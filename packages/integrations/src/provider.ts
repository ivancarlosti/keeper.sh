import type {
  SyncableEvent,
  PushResult,
  DeleteResult,
  SyncResult,
  RemoteEvent,
  ProviderConfig,
  SyncOperation,
  SlotOperations,
  ListRemoteEventsOptions,
} from "./types";
import { generateEventUid, isKeeperEvent } from "./event-identity";
import type { SyncContext } from "./sync-coordinator";
import { log } from "@keeper.sh/log";

export abstract class CalendarProvider<
  TConfig extends ProviderConfig = ProviderConfig,
> {
  abstract readonly name: string;
  abstract readonly id: string;

  protected readonly childLog = log.child({ provider: this.constructor.name });

  constructor(protected config: TConfig) {}

  abstract pushEvents(events: SyncableEvent[]): Promise<PushResult[]>;
  abstract deleteEvents(eventIds: string[]): Promise<DeleteResult[]>;
  abstract listRemoteEvents(options: ListRemoteEventsOptions): Promise<RemoteEvent[]>;

  async sync(
    localEvents: SyncableEvent[],
    _context: SyncContext,
  ): Promise<SyncResult> {
    const { userId } = this.config;

    this.childLog.debug(
      {
        userId,
        localCount: localEvents.length,
      },
      "starting sync",
    );

    const maxEndTime = localEvents.reduce<Date | undefined>(
      (max, event) => (!max || event.endTime > max ? event.endTime : max),
      undefined,
    );

    if (!maxEndTime) {
      this.childLog.debug({ userId }, "no local events to sync");
      return { added: 0, removed: 0 };
    }

    const remoteEvents = await this.listRemoteEvents({ until: maxEndTime });

    const operations = this.diffEvents(localEvents, remoteEvents);
    const addCount = operations.filter((op) => op.type === "add").length;
    const removeCount = operations.filter((op) => op.type === "remove").length;

    this.childLog.debug(
      { userId, toAddCount: addCount, toRemoveCount: removeCount },
      "diff complete",
    );

    if (operations.length === 0) {
      this.childLog.debug({ userId }, "destination in sync");
      return { added: 0, removed: 0 };
    }

    const processed = await this.processOperations(operations);

    this.childLog.info(
      { userId, added: processed.added, removed: processed.removed },
      "sync complete",
    );

    return processed;
  }

  private async processOperations(
    operations: SyncOperation[],
  ): Promise<SyncResult> {
    let added = 0;
    let removed = 0;

    for (const operation of operations) {
      if (operation.type === "add") {
        await this.pushEvents([operation.event]);
        added++;
      } else {
        await this.deleteEvents([operation.uid]);
        removed++;
      }
    }

    return { added, removed };
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

      const [localSlotEvent] = localSlotEvents;
      const [remoteSlotEvent] = remoteSlotEvents;

      const operations: SyncOperation[] = [];

      const startTime = localSlotEvent?.startTime ?? remoteSlotEvent?.startTime;
      if (!startTime) continue;

      const diff = localSlotEvents.length - remoteSlotEvents.length;

      if (diff > 0) {
        for (const event of localSlotEvents.slice(0, diff)) {
          operations.push({ type: "add", event });
        }
      } else if (diff < 0) {
        const surplus = -diff;
        for (const event of remoteSlotEvents.slice(0, surplus)) {
          operations.push({
            type: "remove",
            uid: event.uid,
            startTime: event.startTime,
          });
        }
      }

      if (operations.length > 0) {
        slotOperations.push({ startTime: startTime.getTime(), operations });
      }
    }

    slotOperations.sort((first, second) => first.startTime - second.startTime);
    return slotOperations.flatMap((slot) => slot.operations);
  }

  protected generateUid(): string {
    return generateEventUid();
  }

  protected isKeeperEvent(uid: string): boolean {
    return isKeeperEvent(uid);
  }
}
