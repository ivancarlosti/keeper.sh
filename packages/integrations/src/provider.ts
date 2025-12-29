import type {
  SyncableEvent,
  PushResult,
  DeleteResult,
  SyncResult,
  RemoteEvent,
  ProviderConfig,
  SyncOperation,
  ListRemoteEventsOptions,
} from "./types";
import {
  getEventMappingsForDestination,
  createEventMapping,
  deleteEventMappingByDestinationUid,
  type EventMapping,
} from "./mappings";
import { generateEventUid, isKeeperEvent } from "./event-identity";
import type { SyncContext, SyncStage } from "./sync-coordinator";
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
  abstract listRemoteEvents(
    options: ListRemoteEventsOptions,
  ): Promise<RemoteEvent[]>;

  async sync(
    localEvents: SyncableEvent[],
    context: SyncContext,
  ): Promise<SyncResult> {
    const { database, userId, destinationId } = this.config;

    this.childLog.debug(
      { userId, localCount: localEvents.length },
      "starting sync",
    );

    this.emitProgress(context, {
      stage: "fetching",
      localEventCount: localEvents.length,
      remoteEventCount: 0,
    });

    const [existingMappings, remoteEvents] = await Promise.all([
      getEventMappingsForDestination(database, destinationId),
      this.listRemoteEvents({ until: this.getTenYearsFromNow() }),
    ]);

    this.emitProgress(context, {
      stage: "comparing",
      localEventCount: localEvents.length,
      remoteEventCount: remoteEvents.length,
    });

    const operations = this.computeSyncOperations(
      localEvents,
      existingMappings,
      remoteEvents,
    );
    const addCount = operations.filter((op) => op.type === "add").length;
    const removeCount = operations.filter((op) => op.type === "remove").length;

    this.childLog.debug(
      { userId, toAddCount: addCount, toRemoveCount: removeCount },
      "diff complete",
    );

    if (operations.length === 0) {
      this.childLog.debug({ userId }, "destination in sync");
      await context.onDestinationSync?.({
        userId,
        destinationId,
        localEventCount: localEvents.length,
        remoteEventCount: remoteEvents.length,
      });
      return { added: 0, removed: 0 };
    }

    const processed = await this.processOperations(operations, {
      context,
      localEventCount: localEvents.length,
      remoteEventCount: remoteEvents.length,
    });

    const finalRemoteCount =
      remoteEvents.length + processed.added - processed.removed;
    await context.onDestinationSync?.({
      userId,
      destinationId,
      localEventCount: localEvents.length,
      remoteEventCount: finalRemoteCount,
      broadcast: true,
    });

    this.childLog.info(
      { userId, added: processed.added, removed: processed.removed },
      "sync complete",
    );

    return processed;
  }

  private computeSyncOperations(
    localEvents: SyncableEvent[],
    existingMappings: EventMapping[],
    remoteEvents: RemoteEvent[],
  ): SyncOperation[] {
    const localEventIds = new Set(localEvents.map((event) => event.id));
    const mappedEventIds = new Set(existingMappings.map((m) => m.eventStateId));
    const mappedDestinationUids = new Set(
      existingMappings.map(({ destinationEventUid }) => destinationEventUid),
    );

    const operations: SyncOperation[] = [];

    for (const event of localEvents) {
      if (!mappedEventIds.has(event.id)) {
        operations.push({ type: "add", event });
      }
    }

    for (const mapping of existingMappings) {
      if (!localEventIds.has(mapping.eventStateId)) {
        operations.push({
          type: "remove",
          uid: mapping.destinationEventUid,
          deleteId: mapping.deleteIdentifier,
          startTime: mapping.startTime,
        });
      }
    }

    for (const remoteEvent of remoteEvents) {
      if (!mappedDestinationUids.has(remoteEvent.uid)) {
        operations.push({
          type: "remove",
          uid: remoteEvent.uid,
          deleteId: remoteEvent.deleteId,
          startTime: remoteEvent.startTime,
        });
      }
    }

    return this.sortOperationsByTime(operations);
  }

  private sortOperationsByTime(operations: SyncOperation[]): SyncOperation[] {
    return operations.sort((first, second) => {
      const firstTime = this.getOperationEventTime(first).getTime();
      const secondTime = this.getOperationEventTime(second).getTime();
      return firstTime - secondTime;
    });
  }

  private async processOperations(
    operations: SyncOperation[],
    params: {
      context: SyncContext;
      localEventCount: number;
      remoteEventCount: number;
    },
  ): Promise<SyncResult> {
    const { database, destinationId } = this.config;
    const total = operations.length;
    let current = 0;
    let added = 0;
    let removed = 0;
    let currentRemoteCount = params.remoteEventCount;

    for (const operation of operations) {
      if (!(await params.context.isCurrent())) {
        this.childLog.debug("sync superseded, stopping");
        break;
      }

      const eventTime = this.getOperationEventTime(operation);

      if (operation.type === "add") {
        const [result] = await this.pushEvents([operation.event]);
        if (result?.success && result.remoteId) {
          await createEventMapping(database, {
            eventStateId: operation.event.id,
            destinationId,
            destinationEventUid: result.remoteId,
            deleteIdentifier: result.deleteId,
            startTime: operation.event.startTime,
            endTime: operation.event.endTime,
          });
          added++;
          currentRemoteCount++;
        }
      } else {
        const [result] = await this.deleteEvents([operation.deleteId]);
        if (result?.success) {
          await deleteEventMappingByDestinationUid(
            database,
            destinationId,
            operation.uid,
          );
          removed++;
          currentRemoteCount--;
        }
      }

      current++;

      this.emitProgress(params.context, {
        stage: "processing",
        localEventCount: params.localEventCount,
        remoteEventCount: currentRemoteCount,
        progress: { current, total },
        lastOperation: {
          type: operation.type,
          eventTime: eventTime.toISOString(),
        },
      });

      await params.context.onDestinationSync?.({
        userId: this.config.userId,
        destinationId: this.config.destinationId,
        localEventCount: params.localEventCount,
        remoteEventCount: currentRemoteCount,
        broadcast: false,
      });
    }

    return { added, removed };
  }

  private getOperationEventTime(operation: SyncOperation): Date {
    if (operation.type === "add") {
      return operation.event.startTime;
    }
    return operation.startTime;
  }

  private getTenYearsFromNow(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 10);
    return date;
  }

  private emitProgress(
    context: SyncContext,
    params: {
      stage: SyncStage;
      localEventCount: number;
      remoteEventCount: number;
      progress?: { current: number; total: number };
      lastOperation?: { type: "add" | "remove"; eventTime: string };
    },
  ): void {
    context.onSyncProgress?.({
      userId: this.config.userId,
      destinationId: this.config.destinationId,
      status: "syncing",
      stage: params.stage,
      localEventCount: params.localEventCount,
      remoteEventCount: params.remoteEventCount,
      progress: params.progress,
      lastOperation: params.lastOperation,
      inSync: false,
    });
  }

  protected generateUid(): string {
    return generateEventUid();
  }

  protected isKeeperEvent(uid: string): boolean {
    return isKeeperEvent(uid);
  }
}
