import { drizzle, type BunSQLDatabase } from "drizzle-orm/bun-sql";

export const createDatabase = (url: string): BunSQLDatabase => {
  return drizzle(url);
};
