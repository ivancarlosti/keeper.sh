import { calendarSnapshotsTable, remoteICalSourcesTable } from "@keeper.sh/database/schema";
import { eq } from "drizzle-orm";
import { log } from "@keeper.sh/log";
import type { BunSQLDatabase } from "drizzle-orm/bun-sql";

export async function createSnapshot(
  database: BunSQLDatabase,
  sourceId: string,
  ical: string,
) {
  log.trace("createSnapshot for source '%s' started", sourceId);

  const [source] = await database
    .select({ id: remoteICalSourcesTable.id })
    .from(remoteICalSourcesTable)
    .where(eq(remoteICalSourcesTable.id, sourceId));

  if (!source) {
    log.trace("createSnapshot for source '%s' skipped - source not found", sourceId);
    return;
  }

  await database.insert(calendarSnapshotsTable).values({ sourceId, ical });
  log.trace("createSnapshot for source '%s' complete", sourceId);
}
