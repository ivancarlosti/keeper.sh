import { generateIcsCalendar, type IcsCalendar, type IcsEvent } from "ts-ics";
import {
  randomUUID,
  randomPastDate,
  randomFutureDate,
  randomString,
  randomInt,
  randomDuration,
} from "../utils/random";

export type GeneratedSnapshot = {
  id: string;
  userId: string;
  ical: string;
  createdAt: Date;
};

const generateIcsEvent = (): IcsEvent => {
  const start = randomFutureDate(60);
  const end = new Date(start.getTime() + randomDuration(0.5, 3));

  return {
    summary: `Event ${randomString(8)}`,
    uid: `${randomUUID()}@keeper.sh`,
    stamp: { date: new Date() },
    start: { date: start },
    end: { date: end },
  };
};

const generateIcsContent = (): string => {
  const eventCount = randomInt(3, 10);
  const events: IcsEvent[] = Array.from({ length: eventCount }, generateIcsEvent);

  const calendar: IcsCalendar = {
    version: "2.0",
    prodId: "-//keeper.sh//synthetic-data//EN",
    events,
  };

  return generateIcsCalendar(calendar);
};

export const generateSnapshot = (userId: string): GeneratedSnapshot => ({
  id: randomUUID(),
  userId,
  ical: generateIcsContent(),
  createdAt: randomPastDate(14),
});

export const generateSnapshots = (userId: string, count: number): GeneratedSnapshot[] =>
  Array.from({ length: count }, () => generateSnapshot(userId));
