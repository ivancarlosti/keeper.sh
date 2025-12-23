import type {
  SyncableEvent,
  PushResult,
  DeleteResult,
  SyncResult,
  RemoteEvent,
  ProviderConfig,
} from "./types";
import { generateEventUid, isKeeperEvent } from "./event-identity";
import { log } from "@keeper.sh/log";

export abstract class CalendarProvider<TConfig extends ProviderConfig = ProviderConfig> {
  abstract readonly name: string;
  abstract readonly id: string;

  protected readonly childLog = log.child({ provider: this.constructor.name });

  constructor(protected config: TConfig) {}

  abstract pushEvents(events: SyncableEvent[]): Promise<PushResult[]>;
  abstract deleteEvents(eventIds: string[]): Promise<DeleteResult[]>;
  abstract listRemoteEvents(): Promise<RemoteEvent[]>;

  async sync(localEvents: SyncableEvent[]): Promise<SyncResult> {
    this.childLog.debug(
      { userId: this.config.userId, localCount: localEvents.length },
      "starting sync",
    );

    const remoteEvents = await this.listRemoteEvents();
    const { toAdd, toRemove } = this.diffEvents(localEvents, remoteEvents);

    this.childLog.debug(
      {
        userId: this.config.userId,
        toAddCount: toAdd.length,
        toRemoveCount: toRemove.length,
      },
      "diff complete",
    );

    if (toAdd.length === 0 && toRemove.length === 0) {
      this.childLog.debug({ userId: this.config.userId }, "destination in sync");
      return { added: 0, removed: 0 };
    }

    if (toAdd.length > 0) {
      await this.pushEvents(toAdd);
    }

    if (toRemove.length > 0) {
      await this.deleteEvents(toRemove);
    }

    this.childLog.info(
      { userId: this.config.userId, added: toAdd.length, removed: toRemove.length },
      "sync complete",
    );

    return { added: toAdd.length, removed: toRemove.length };
  }

  private diffEvents(
    localEvents: SyncableEvent[],
    remoteEvents: RemoteEvent[],
  ): { toAdd: SyncableEvent[]; toRemove: string[] } {
    const remoteUidSet = new Set<string>();
    for (const event of remoteEvents) {
      remoteUidSet.add(event.uid);
    }

    const localUidToEvent = new Map<string, SyncableEvent>();
    for (const event of localEvents) {
      const uid = this.generateUid(event);
      localUidToEvent.set(uid, event);
    }

    const toAdd: SyncableEvent[] = [];
    const toRemove: string[] = [];

    for (const [uid, event] of localUidToEvent) {
      if (!remoteUidSet.has(uid)) {
        toAdd.push(event);
      }
    }

    for (const uid of remoteUidSet) {
      if (!localUidToEvent.has(uid)) {
        toRemove.push(uid);
      }
    }

    return { toAdd, toRemove };
  }

  protected generateUid(event: SyncableEvent): string {
    return generateEventUid(this.config.userId, event);
  }

  protected isKeeperEvent(uid: string): boolean {
    return isKeeperEvent(uid);
  }
}
