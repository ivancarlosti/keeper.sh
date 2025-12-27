import { syncStatusTable, calendarDestinationsTable } from "@keeper.sh/database/schema";
import { eq } from "drizzle-orm";
import { withTracing, withAuth } from "../../../utils/middleware";
import { database } from "../../../context";

export const GET = withTracing(
  withAuth(async ({ userId }) => {
    const statuses = await database
      .select({
        destinationId: syncStatusTable.destinationId,
        localEventCount: syncStatusTable.localEventCount,
        remoteEventCount: syncStatusTable.remoteEventCount,
        lastSyncedAt: syncStatusTable.lastSyncedAt,
      })
      .from(syncStatusTable)
      .innerJoin(
        calendarDestinationsTable,
        eq(syncStatusTable.destinationId, calendarDestinationsTable.id),
      )
      .where(eq(calendarDestinationsTable.userId, userId));

    const destinations = statuses.map((status) => ({
      destinationId: status.destinationId,
      localEventCount: status.localEventCount,
      remoteEventCount: status.remoteEventCount,
      lastSyncedAt: status.lastSyncedAt,
      inSync: status.localEventCount === status.remoteEventCount,
    }));

    return Response.json({ destinations });
  }),
);
