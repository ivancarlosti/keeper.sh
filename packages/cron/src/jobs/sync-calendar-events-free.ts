import type { CronOptions } from "cronbake";
import { log } from "@keeper.sh/log";
import { GoogleCalendarProvider } from "@keeper.sh/integration-google-calendar";
import {
  fetchAndSyncSource,
  getSourcesByPlan,
  type Source,
} from "../lib/sync-utils";

const destinationProviders = [GoogleCalendarProvider];

const syncUserSources = async (userId: string, sources: Source[]) => {
  await Promise.allSettled(sources.map(fetchAndSyncSource));
  await Promise.allSettled(
    destinationProviders.map((Provider) => Provider.syncForUser(userId)),
  );
};

export default {
  name: import.meta.file,
  cron: "@every_30_minutes",
  immediate: true,
  async callback() {
    const sources = await getSourcesByPlan("free");
    log.debug("syncing %s free sources", sources.length);

    const sourcesByUser = new Map<string, Source[]>();
    for (const source of sources) {
      const userSources = sourcesByUser.get(source.userId) ?? [];
      userSources.push(source);
      sourcesByUser.set(source.userId, userSources);
    }

    const userSyncs = Array.from(sourcesByUser.entries()).map(
      ([userId, userSources]) => syncUserSources(userId, userSources),
    );

    await Promise.allSettled(userSyncs);
  },
} satisfies CronOptions;
