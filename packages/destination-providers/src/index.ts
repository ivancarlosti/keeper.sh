import type { DestinationProvider } from "@keeper.sh/integrations";
import { createGoogleCalendarProvider } from "@keeper.sh/integration-google-calendar";
import { createCalDAVProvider } from "@keeper.sh/integration-caldav";
import { createFastMailProvider } from "@keeper.sh/integration-fastmail";
import { createICloudProvider } from "@keeper.sh/integration-icloud";
import { createOutlookCalendarProvider } from "@keeper.sh/integration-outlook";
import type { BunSQLDatabase } from "drizzle-orm/bun-sql";
import type { OAuthProvider, OAuthProviders } from "./oauth";

export interface DestinationProvidersConfig {
  database: BunSQLDatabase;
  oauthProviders: OAuthProviders;
  encryptionKey: string;
}

export const createDestinationProviders = (
  config: DestinationProvidersConfig,
): DestinationProvider[] => {
  const { database, oauthProviders, encryptionKey } = config;

  const providers: DestinationProvider[] = [];

  const googleOAuth = oauthProviders.getProvider("google");
  if (googleOAuth) {
    providers.push(createGoogleCalendarProvider({ database, oauthProvider: googleOAuth }));
  }

  const outlookOAuth = oauthProviders.getProvider("outlook");
  if (outlookOAuth) {
    providers.push(createOutlookCalendarProvider({ database, oauthProvider: outlookOAuth }));
  }

  providers.push(createCalDAVProvider({ database, encryptionKey }));
  providers.push(createFastMailProvider({ database, encryptionKey }));
  providers.push(createICloudProvider({ database, encryptionKey }));

  return providers;
};

export {
  createGoogleCalendarProvider,
  createCalDAVProvider,
  createFastMailProvider,
  createICloudProvider,
  createOutlookCalendarProvider,
};

export {
  DESTINATIONS,
  getDestination,
  isCalDAVDestination,
  getActiveDestinations,
  type DestinationConfig,
  type DestinationId,
} from "@keeper.sh/destination-metadata";

export {
  createOAuthProviders,
  type OAuthProvider,
  type OAuthProviders,
  type OAuthProvidersConfig,
  type OAuthTokens,
  type NormalizedUserInfo,
  type AuthorizationUrlOptions,
} from "./oauth";
