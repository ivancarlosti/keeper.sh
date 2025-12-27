import { syncDestinationsForUser } from "@keeper.sh/integrations";
import { log } from "@keeper.sh/log";
import { destinationProviders, syncCoordinator } from "../context";

/**
 * Triggers a background sync for all destinations of a user.
 * Fire-and-forget with error logging - does not throw.
 */
export const triggerDestinationSync = (userId: string): void => {
  syncDestinationsForUser(userId, destinationProviders, syncCoordinator).catch((error) => {
    log.error({ userId, error }, "background destination sync failed");
  });
};
