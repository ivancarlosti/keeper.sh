import { randomUUID, randomPastDate, randomFutureDate, randomDuration } from "../utils/random";

export type GeneratedEventState = {
  id: string;
  calendarId: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
};

export const generateEventState = (calendarId: string): GeneratedEventState => {
  const startTime = randomFutureDate(30);
  const endTime = new Date(startTime.getTime() + randomDuration(0.5, 4));

  return {
    id: randomUUID(),
    calendarId,
    startTime,
    endTime,
    createdAt: randomPastDate(7),
  };
};

export const generateEventStates = (calendarId: string, count: number): GeneratedEventState[] =>
  Array.from({ length: count }, () => generateEventState(calendarId));
