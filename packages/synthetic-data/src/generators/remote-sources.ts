import { randomUUID, randomPastDate, randomString, randomElement } from "../utils/random";

const DOMAINS = [
  "calendar.google.com",
  "outlook.office365.com",
  "caldav.fastmail.com",
  "calendar.yahoo.com",
  "ical.example.org",
];

export type GeneratedRemoteSource = {
  id: string;
  userId: string;
  url: string;
  createdAt: Date;
};

export const generateRemoteSource = (userId: string): GeneratedRemoteSource => ({
  id: randomUUID(),
  userId,
  url: `https://${randomElement(DOMAINS)}/ical/${randomString(16)}.ics`,
  createdAt: randomPastDate(30),
});

export const generateRemoteSources = (userId: string, count: number): GeneratedRemoteSource[] =>
  Array.from({ length: count }, () => generateRemoteSource(userId));
