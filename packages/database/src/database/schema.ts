import { boolean, jsonb, text, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const calendarSnapshotsTable = pgTable("calendar_snapshots", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  ical: text(),
  json: jsonb(),
  public: boolean().notNull().default(false),
});

export const remoteICalSourcesTable = pgTable("remote_ical_sources", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  url: text().notNull(),
});

export const calendarsTable = pgTable("calendars", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  remoteUrl: text().notNull(),
  name: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const eventStatesTable = pgTable("event_states", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  calendarId: uuid()
    .notNull()
    .references(() => calendarsTable.id, { onDelete: "cascade" }),
  startTime: timestamp().notNull(),
  endTime: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});
