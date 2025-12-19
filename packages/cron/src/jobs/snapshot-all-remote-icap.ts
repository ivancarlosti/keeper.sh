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
  sourceId: string;
};

const fetchRemoteCalendar = async (
  sourceId: string,
  url: string,
): Promise<FetchResult> => {
  log.debug("fetching remote calendar '%s'", sourceId);

  try {
    const { ical } = await pullRemoteCalendar("ical", url);
    log.debug("fetched remote calendar '%s'", sourceId);
    return { ical, sourceId };
  } catch (error) {
    log.error(error, "could not fetch remote calendar '%s'", sourceId);
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
  async callback() {
    const remoteSources = await database.select().from(remoteICalSourcesTable);
    log.debug("fetching %s remote sources", remoteSources.length);

    const fetches = remoteSources.map(({ id, url }) =>
      fetchRemoteCalendar(id, url),
    );

    const settlements = await Promise.allSettled(fetches);

    for (const settlement of settlements) {
      if (settlement.status === "rejected") continue;
      const { ical, sourceId } = settlement.value;
      await insertSnapshot({ sourceId, ical });
    }
  },
} satisfies CronOptions;
