import type {
  SyncableEvent,
  PushResult,
  DeleteResult,
  SyncResult,
  RemoteEvent,
  ProviderConfig,
  SyncOperation,
  SlotOperations,
} from "./types";
import type { SyncStatus } from "@keeper.sh/data-schemas";
import { generateEventUid, isKeeperEvent } from "./event-identity";
import { log } from "@keeper.sh/log";
import { emit } from "@keeper.sh/broadcast";
import { database } from "@keeper.sh/database";
import { syncStatusTable } from "@keeper.sh/database/schema";

export abstract class CalendarProvider<TConfig extends ProviderConfig = ProviderConfig> {
  abstract readonly name: string;
  abstract readonly id: string;

  protected readonly childLog = log.child({ provider: this.constructor.name });

  constructor(protected config: TConfig) {}

  abstract pushEvents(events: SyncableEvent[]): Promise<PushResult[]>;
  abstract deleteEvents(eventIds: string[]): Promise<DeleteResult[]>;
  abstract listRemoteEvents(): Promise<RemoteEvent[]>;

  async sync(localEvents: SyncableEvent[]): Promise<SyncResult> {
    const { userId } = this.config;

    this.childLog.debug(
      { userId, localCount: localEvents.length },
      "starting sync",
    );

    this.emitStatus({
      status: "syncing",
      stage: "fetching",
      localEventCount: localEvents.length,
      remoteEventCount: 0,
      inSync: false,
    });

    const remoteEvents = await this.listRemoteEvents();

    this.emitStatus({
      status: "syncing",
      stage: "comparing",
      localEventCount: localEvents.length,
      remoteEventCount: remoteEvents.length,
      inSync: false,
    });

    const operations = this.diffEvents(localEvents, remoteEvents);
    const addCount = operations.filter((op) => op.type === "add").length;
    const removeCount = operations.filter((op) => op.type === "remove").length;

    this.childLog.debug(
      { userId, toAddCount: addCount, toRemoveCount: removeCount },
      "diff complete",
    );

    if (operations.length === 0) {
      this.childLog.debug({ userId }, "destination in sync");
      await this.persistAndEmitFinalStatus(localEvents.length, remoteEvents.length);
      return { added: 0, removed: 0 };
    }

    this.emitStatus({
      status: "syncing",
      stage: "pushing",
      localEventCount: localEvents.length,
      remoteEventCount: remoteEvents.length,
      progress: { current: 0, total: operations.length },
      inSync: false,
    });

    await this.processOperations(operations);

    const finalRemoteCount = remoteEvents.length + addCount - removeCount;
    await this.persistAndEmitFinalStatus(localEvents.length, finalRemoteCount);

    this.childLog.info(
      { userId, added: addCount, removed: removeCount },
      "sync complete",
    );

    return { added: addCount, removed: removeCount };
  }

  private async processOperations(operations: SyncOperation[]): Promise<void> {
    for (const operation of operations) {
      if (operation.type === "add") {
        await this.pushEvents([operation.event]);
      } else {
        await this.deleteEvents([operation.uid]);
      }
    }
  }

  private emitStatus(status: Omit<SyncStatus, "provider">): void {
    emit(this.config.userId, "sync:status", {
      provider: this.id,
      ...status,
    });
  }

  private async persistAndEmitFinalStatus(
    localEventCount: number,
    remoteEventCount: number,
  ): Promise<void> {
    const { userId } = this.config;
    const now = new Date();

    await database
      .insert(syncStatusTable)
      .values({
        userId,
        provider: this.id,
        localEventCount,
        remoteEventCount,
        lastSyncedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [syncStatusTable.userId, syncStatusTable.provider],
        set: {
          localEventCount,
          remoteEventCount,
          lastSyncedAt: now,
          updatedAt: now,
        },
      });

    this.emitStatus({
      status: "idle",
      localEventCount,
      remoteEventCount,
      lastSyncedAt: now.toISOString(),
      inSync: true,
    });
  }

  private diffEvents(
    localEvents: SyncableEvent[],
    remoteEvents: RemoteEvent[],
  ): SyncOperation[] {
    const timeKey = (start: Date, end: Date) =>
      `${start.getTime()}:${end.getTime()}`;

    const localBySlot = new Map<string, SyncableEvent[]>();
    for (const event of localEvents) {
      const key = timeKey(event.startTime, event.endTime);
      const slotEvents = localBySlot.get(key) ?? [];
      slotEvents.push(event);
      localBySlot.set(key, slotEvents);
    }

    const remoteBySlot = new Map<string, RemoteEvent[]>();
    for (const event of remoteEvents) {
      const key = timeKey(event.startTime, event.endTime);
      const slotEvents = remoteBySlot.get(key) ?? [];
      slotEvents.push(event);
      remoteBySlot.set(key, slotEvents);
    }

    const allSlots = new Set([...localBySlot.keys(), ...remoteBySlot.keys()]);
    const slotOperations: SlotOperations[] = [];

    for (const slot of allSlots) {
      const localSlotEvents = localBySlot.get(slot) ?? [];
      const remoteSlotEvents = remoteBySlot.get(slot) ?? [];
      const operations: SyncOperation[] = [];

      const startTime = localSlotEvents[0]?.startTime ?? remoteSlotEvents[0]?.startTime;
      if (!startTime) continue;

      const diff = localSlotEvents.length - remoteSlotEvents.length;

      if (diff > 0) {
        const remoteUids = new Set(remoteSlotEvents.map((event) => event.uid));
        let added = 0;
        for (const event of localSlotEvents) {
          if (added >= diff) break;
          if (!remoteUids.has(this.generateUid(event))) {
            operations.push({ type: "add", event });
            added++;
          }
        }
      } else if (diff < 0) {
        const surplus = -diff;
        const localUids = new Set(
          localSlotEvents.map((event) => this.generateUid(event)),
        );
        const unmatched = remoteSlotEvents.filter(
          (event) => !localUids.has(event.uid),
        );
        const matched = remoteSlotEvents.filter((event) =>
          localUids.has(event.uid),
        );

        const toRemoveFromSlot = [...unmatched, ...matched].slice(0, surplus);
        for (const event of toRemoveFromSlot) {
          operations.push({ type: "remove", uid: event.uid });
        }
      }

      if (operations.length > 0) {
        slotOperations.push({ startTime: startTime.getTime(), operations });
      }
    }

    slotOperations.sort((first, second) => first.startTime - second.startTime);
    return slotOperations.flatMap((slot) => slot.operations);
  }

  protected generateUid(event: SyncableEvent): string {
    return generateEventUid(this.config.userId, event);
  }

  protected isKeeperEvent(uid: string): boolean {
    return isKeeperEvent(uid);
  }
}
