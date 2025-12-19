import type { CronOptions } from "cronbake";
import { database } from "@keeper.sh/database";
import {
  remoteICalSourcesTable,
  calendarSnapshotsTable,
} from "@keeper.sh/database/schema";
import { pullRemoteCalendar } from "@keeper.sh/pull-calendar";
import { log } from "@keeper.sh/log";

type FetchResult = {
  ical: string;
  json: unknown;
  userId: string;
};

const fetchRemoteCalendar = async (
  id: string,
  url: string,
  userId: string,
): Promise<FetchResult> => {
  log.debug("fetching remote calendar '%s'", id);

  try {
    const { ical, json } = await pullRemoteCalendar(["ical", "json"], url);
    log.debug("fetched remote calendar '%s'", id);
    return { ical, json, userId };
  } catch (error) {
    log.error(error, "could not fetch remote calendar '%s'", id);
    throw error;
  }
};

const insertSnapshot = async (
  payload: typeof calendarSnapshotsTable.$inferInsert,
) => {
  try {
    await database.insert(calendarSnapshotsTable).values(payload);
  } catch (error) {
    log.error(error, "failed to submit entry into the database");
  }
};

export default {
  name: import.meta.file,
  cron: "@every_1_minutes",
  immediate: true,
  async callback() {
    const remoteSources = await database.select().from(remoteICalSourcesTable);
    log.debug("fetching %s remote sources", remoteSources.length);

    const fetches = remoteSources.map(({ id, url, userId }) =>
      fetchRemoteCalendar(id, url, userId),
    );

    const settlements = await Promise.allSettled(fetches);

    for (const settlement of settlements) {
      if (settlement.status === "rejected") continue;
      const { ical, json, userId } = settlement.value;
      await insertSnapshot({ userId, ical, json });
    }
  },
} satisfies CronOptions;
