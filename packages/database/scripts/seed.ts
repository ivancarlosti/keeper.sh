import { database } from "@keeper.sh/database";
import {
  usersTable,
  calendarsTable,
  calendarSnapshotsTable,
  remoteICalSourcesTable,
  eventStatesTable,
} from "@keeper.sh/database/schema";
import {
  generateUsers,
  generateCalendars,
  generateSnapshots,
  generateRemoteSources,
  generateEventStates,
  randomInt,
} from "@keeper.sh/synthetic-data";
import { log } from "@keeper.sh/log";

const seed = async () => {
  log.info("seeding database");

  const users = generateUsers(5);
  await database.insert(usersTable).values(users);
  log.debug({ count: users.length }, "users");

  for (const user of users) {
    const calendars = generateCalendars(user.id, randomInt(2, 3));
    await database.insert(calendarsTable).values(calendars);
    log.debug({ userId: user.id, count: calendars.length }, "calendars");

    for (const calendar of calendars) {
      const eventStates = generateEventStates(calendar.id, randomInt(5, 10));
      await database.insert(eventStatesTable).values(eventStates);
      log.debug(
        { calendarId: calendar.id, count: eventStates.length },
        "event states",
      );
    }

    const remoteSources = generateRemoteSources(user.id, randomInt(1, 2));
    await database.insert(remoteICalSourcesTable).values(remoteSources);
    log.debug(
      { userId: user.id, count: remoteSources.length },
      "remote sources",
    );

    const snapshots = generateSnapshots(user.id, randomInt(3, 5));
    await database.insert(calendarSnapshotsTable).values(snapshots);
    log.debug({ userId: user.id, count: snapshots.length }, "snapshots");
  }

  log.info("seeding complete");
};

await seed();
