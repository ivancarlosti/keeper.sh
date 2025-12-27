import { createDatabase } from "@keeper.sh/database";
import { createAuth } from "@keeper.sh/auth";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createServices() {
  const database = createDatabase(getRequiredEnv("DATABASE_URL"));

  const { auth } = createAuth({
    database,
    secret: getRequiredEnv("BETTER_AUTH_SECRET"),
    baseUrl: getRequiredEnv("BETTER_AUTH_URL"),
    commercialMode: process.env.COMMERCIAL_MODE === "true",
    polarAccessToken: process.env.POLAR_ACCESS_TOKEN,
    polarMode: process.env.POLAR_MODE === "sandbox" || process.env.POLAR_MODE === "production"
      ? process.env.POLAR_MODE
      : undefined,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    passkeyRpId: process.env.PASSKEY_RP_ID,
    passkeyRpName: process.env.PASSKEY_RP_NAME,
    passkeyOrigin: process.env.PASSKEY_ORIGIN,
  });

  return { database, auth };
}

let services: ReturnType<typeof createServices> | null = null;

function getServices() {
  if (!services) {
    services = createServices();
  }
  return services;
}

export function getDatabase() {
  return getServices().database;
}

export function getAuth() {
  return getServices().auth;
}
