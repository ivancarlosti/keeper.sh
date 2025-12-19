import { randomUUID, randomPastDate } from "../utils/random";

export type GeneratedUser = {
  id: string;
  createdAt: Date;
};

export const generateUser = (): GeneratedUser => ({
  id: randomUUID(),
  createdAt: randomPastDate(90),
});

export const generateUsers = (count: number): GeneratedUser[] =>
  Array.from({ length: count }, () => generateUser());
