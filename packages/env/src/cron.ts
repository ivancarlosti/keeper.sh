import arkenv from "arkenv";

export default arkenv({
  DATABASE_URL: "string.url",
  REDIS_URL: "string.url",
  COMMERCIAL_MODE: "boolean?",
  POLAR_ACCESS_TOKEN: "string?",
  POLAR_MODE: "'sandbox' | 'production' | undefined?",
  GOOGLE_CLIENT_ID: "string?",
  GOOGLE_CLIENT_SECRET: "string?",
  MICROSOFT_CLIENT_ID: "string?",
  MICROSOFT_CLIENT_SECRET: "string?",
  ENCRYPTION_KEY: "string?",
});
