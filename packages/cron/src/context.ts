import env from "@keeper.sh/env/cron";
import { createDatabase } from "@keeper.sh/database";
import { createRedis } from "@keeper.sh/redis";
import { createPremiumService } from "@keeper.sh/premium";
import {
  createOAuthProviders,
  createDestinationProviders,
} from "@keeper.sh/destination-providers";
import { createSyncCoordinator } from "@keeper.sh/integrations";
import { Polar } from "@polar-sh/sdk";

export const database = createDatabase(env.DATABASE_URL);
const redis = createRedis(env.REDIS_URL);

export const premiumService = createPremiumService({
  database,
  commercialMode: env.COMMERCIAL_MODE ?? false,
});

const oauthProviders = createOAuthProviders({
  google:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        }
      : undefined,
  microsoft:
    env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
      ? {
          clientId: env.MICROSOFT_CLIENT_ID,
          clientSecret: env.MICROSOFT_CLIENT_SECRET,
        }
      : undefined,
});

export const destinationProviders = createDestinationProviders({
  database,
  oauthProviders,
  encryptionKey: env.ENCRYPTION_KEY ?? "",
});

export const syncCoordinator = createSyncCoordinator({ redis });

export const polarClient =
  env.POLAR_ACCESS_TOKEN && env.POLAR_MODE
    ? new Polar({
        accessToken: env.POLAR_ACCESS_TOKEN,
        server: env.POLAR_MODE,
      })
    : null;
