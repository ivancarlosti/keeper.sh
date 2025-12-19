export const randomUUID = (): string => crypto.randomUUID();

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomElement = <T>(array: T[]): T =>
  array[randomInt(0, array.length - 1)]!;

const randomCharacter = (): string => {
  const range = randomInt(0, 2);
  if (range === 0) return String.fromCharCode(randomInt(48, 57));
  if (range === 1) return String.fromCharCode(randomInt(65, 90));
  return String.fromCharCode(randomInt(97, 122));
};

export const randomString = (length: number): string =>
  Array.from({ length }, randomCharacter).join("");

export const randomDate = (start: Date, end: Date): Date => {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + Math.random() * (endTime - startTime));
};

export const randomPastDate = (daysBack = 30): Date => {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return randomDate(past, now);
};

export const randomFutureDate = (daysAhead = 30): Date => {
  const now = new Date();
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return randomDate(now, future);
};

export const randomDuration = (minHours = 0.5, maxHours = 4): number =>
  randomInt(minHours * 60, maxHours * 60) * 60 * 1000;
