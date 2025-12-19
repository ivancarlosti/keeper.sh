import { randomUUID, randomPastDate, randomString, randomElement } from "../utils/random";

const CALENDAR_NAMES = [
  "Work",
  "Personal",
  "Family",
  "Meetings",
  "Holidays",
  "Birthdays",
  "Travel",
  "Projects",
  "Deadlines",
  "Reminders",
];

export type GeneratedCalendar = {
  id: string;
  userId: string;
  remoteUrl: string;
  name: string;
  createdAt: Date;
};

export const generateCalendar = (userId: string): GeneratedCalendar => ({
  id: randomUUID(),
  userId,
  remoteUrl: `https://calendar.example.com/${randomString(12)}.ics`,
  name: randomElement(CALENDAR_NAMES),
  createdAt: randomPastDate(60),
});

export const generateCalendars = (userId: string, count: number): GeneratedCalendar[] =>
  Array.from({ length: count }, () => generateCalendar(userId));
