import type { SyncResult } from "./types";
import { log } from "@keeper.sh/log";

export interface DestinationProvider {
  syncForUser(userId: string): Promise<SyncResult | null>;
}

const providers: DestinationProvider[] = [];

export function registerDestinationProvider(
  provider: DestinationProvider,
): void {
  providers.push(provider);
}

export async function syncDestinationsForUser(userId: string): Promise<void> {
  const results = await Promise.allSettled(
    providers.map((provider) => provider.syncForUser(userId)),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      log.error(result.reason, "destination sync failed for user '%s'", userId);
    }
  }
}
