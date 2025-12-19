import { database } from "@keeper.sh/database";
import { calendarSnapshotsTable } from "@keeper.sh/database/schema";
import { log } from "@keeper.sh/log";
import { BunRequest } from "bun";
import { eq, and } from "drizzle-orm";

type BunRouteCallback = (request: BunRequest<string>) => Promise<Response>;

const makeLoggedRequest = (callback: BunRouteCallback): BunRouteCallback => {
  return async (request) => {
    const url = request.url;
    log.trace("request to %s started", url);
    const result = await callback(request);
    log.trace("request to %s complete", url);
    return result;
  };
};

const server = Bun.serve({
  port: 3000,
  routes: {
    "/users/:userId/snapshots": makeLoggedRequest(async (request) => {
      const { userId } = request.params;

      if (!userId) {
        return new Response(null, { status: 404 });
      }

      const snapshots = await database
        .select({ id: calendarSnapshotsTable.id })
        .from(calendarSnapshotsTable)
        .where(
          and(
            eq(calendarSnapshotsTable.userId, userId),
            eq(calendarSnapshotsTable.public, true),
          ),
        );

      const snapshotIds = snapshots.map(({ id }) => id);
      return Response.json(snapshotIds);
    }),

    "/snapshots/:id": makeLoggedRequest(async (request) => {
      const id = request.params.id?.replace(/\.ics$/, "");

      if (!id) {
        return new Response(null, { status: 404 });
      }

      const [snapshot] = await database
        .select()
        .from(calendarSnapshotsTable)
        .where(
          and(
            eq(calendarSnapshotsTable.id, id),
            eq(calendarSnapshotsTable.public, true),
          ),
        )
        .limit(1);

      if (!snapshot?.ical) {
        return new Response(null, { status: 404 });
      }

      return new Response(snapshot.ical, {
        headers: { "Content-Type": "text/calendar" },
      });
    }),
  },
});

log.info({ port: server.port }, "server started");
