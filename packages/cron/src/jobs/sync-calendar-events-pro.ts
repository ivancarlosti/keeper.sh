import type { CronOptions } from "cronbake";
import { log } from "@keeper.sh/log";
import {
  getGoogleAccountForUser,
  syncGoogleAccount,
} from "@keeper.sh/integration-google-calendar";
import {
  fetchAndSyncSource,
  getSourcesByPlan,
  type Source,
} from "../lib/sync-utils";

const syncUserSources = async (userId: string, sources: Source[]) => {
  await Promise.allSettled(sources.map(fetchAndSyncSource));

  const googleAccount = await getGoogleAccountForUser(userId);
  if (!googleAccount) return;
  await syncGoogleAccount(googleAccount);
};

export default {
  name: import.meta.file,
  cron: "@every_5_minutes",
  immediate: true,
  delay: "1m",
  async callback() {
    const sources = await getSourcesByPlan("pro");
    log.debug("syncing %s pro sources", sources.length);

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
