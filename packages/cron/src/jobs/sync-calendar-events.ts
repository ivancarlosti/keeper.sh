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

const isIcsCalendar = (value: unknown): value is IcsCalendar =>
  typeof value === "object" && value !== null && "version" in value;

export default {
  name: import.meta.file,
  cron: "@every_5_minutes",
  async callback() {
    const calendars = await database.select().from(calendarsTable);
    log.debug("syncing events for %s calendars", calendars.length);

    for (const calendar of calendars) {
      try {
        const [snapshot] = await database
          .select({ json: calendarSnapshotsTable.json })
          .from(calendarSnapshotsTable)
          .where(eq(calendarSnapshotsTable.userId, calendar.userId))
          .orderBy(desc(calendarSnapshotsTable.createdAt))
          .limit(1);

        if (!snapshot?.json || !isIcsCalendar(snapshot.json)) {
          log.debug("no snapshot found for calendar '%s'", calendar.id);
          continue;
        }

        const icsCalendar = snapshot.json;
        const remoteEvents = parseIcsEvents(icsCalendar);

        const storedEvents = await database
          .select({
            id: eventStatesTable.id,
            startTime: eventStatesTable.startTime,
            endTime: eventStatesTable.endTime,
          })
          .from(eventStatesTable)
          .where(eq(eventStatesTable.calendarId, calendar.id));

        const { toAdd, toRemove } = diffEvents(remoteEvents, storedEvents);

        if (toRemove.length > 0) {
          const idsToRemove = toRemove.map((event) => event.id);
          await database
            .delete(eventStatesTable)
            .where(inArray(eventStatesTable.id, idsToRemove));

          log.debug(
            "removed %s events from calendar '%s'",
            toRemove.length,
            calendar.id,
          );
        }

        if (toAdd.length > 0) {
          const eventsToInsert = toAdd.map((event) => ({
            calendarId: calendar.id,
            startTime: event.startTime,
            endTime: event.endTime,
          }));

          await database.insert(eventStatesTable).values(eventsToInsert);

          log.debug(
            "added %s events to calendar '%s'",
            toAdd.length,
            calendar.id,
          );
        }

        if (toAdd.length === 0 && toRemove.length === 0) {
          log.debug("calendar '%s' is in sync", calendar.id);
        }
      } catch (error) {
        log.error(
          { error, calendarId: calendar.id },
          "failed to sync calendar",
        );
      }
    }
  },
} satisfies CronOptions;
