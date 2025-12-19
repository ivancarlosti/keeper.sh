import type { CronOptions } from "cronbake";
import type { IcsCalendar } from "ts-ics";
import { database } from "@keeper.sh/database";
import {
  calendarsTable,
  eventStatesTable,
  calendarSnapshotsTable,
} from "@keeper.sh/database/schema";
import { parseIcsEvents, diffEvents } from "@keeper.sh/sync-events";
import { log } from "@keeper.sh/log";
import { eq, inArray, desc } from "drizzle-orm";

type Calendar = typeof calendarsTable.$inferSelect;

const isIcsCalendar = (value: unknown): value is IcsCalendar =>
  typeof value === "object" && value !== null && "version" in value;

const getLatestSnapshot = async (userId: string) => {
  const [snapshot] = await database
    .select({ json: calendarSnapshotsTable.json })
    .from(calendarSnapshotsTable)
    .where(eq(calendarSnapshotsTable.userId, userId))
    .orderBy(desc(calendarSnapshotsTable.createdAt))
    .limit(1);

  if (!snapshot?.json || !isIcsCalendar(snapshot.json)) {
    return null;
  }

  return snapshot.json;
};

const getStoredEvents = async (calendarId: string) => {
  return database
    .select({
      id: eventStatesTable.id,
      startTime: eventStatesTable.startTime,
      endTime: eventStatesTable.endTime,
    })
    .from(eventStatesTable)
    .where(eq(eventStatesTable.calendarId, calendarId));
};

const removeEvents = async (calendarId: string, eventIds: string[]) => {
  await database
    .delete(eventStatesTable)
    .where(inArray(eventStatesTable.id, eventIds));

  log.debug("removed %s events from calendar '%s'", eventIds.length, calendarId);
};

const addEvents = async (
  calendarId: string,
  events: { startTime: Date; endTime: Date }[],
) => {
  const rows = events.map((event) => ({
    calendarId,
    startTime: event.startTime,
    endTime: event.endTime,
  }));

  await database.insert(eventStatesTable).values(rows);
  log.debug("added %s events to calendar '%s'", events.length, calendarId);
};

const syncCalendar = async (calendar: Calendar) => {
  log.debug("syncing calendar '%s'", calendar.id);

  try {
    const icsCalendar = await getLatestSnapshot(calendar.userId);
    if (!icsCalendar) {
      log.debug("no snapshot found for calendar '%s'", calendar.id);
      return;
    }

    const remoteEvents = parseIcsEvents(icsCalendar);
    const storedEvents = await getStoredEvents(calendar.id);
    const { toAdd, toRemove } = diffEvents(remoteEvents, storedEvents);

    if (toRemove.length > 0) {
      const eventIds = toRemove.map((event) => event.id);
      await removeEvents(calendar.id, eventIds);
    }

    if (toAdd.length > 0) {
      await addEvents(calendar.id, toAdd);
    }

    if (toAdd.length === 0 && toRemove.length === 0) {
      log.debug("calendar '%s' is in sync", calendar.id);
    }
  } catch (error) {
    log.error({ error, calendarId: calendar.id }, "failed to sync calendar");
  }
};

export default {
  name: import.meta.file,
  cron: "@every_5_minutes",
  async callback() {
    const calendars = await database.select().from(calendarsTable);
    log.debug("syncing %s calendars", calendars.length);

    const syncs = calendars.map((calendar) => syncCalendar(calendar));
    await Promise.allSettled(syncs);
  },
} satisfies CronOptions;
