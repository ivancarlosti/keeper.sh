import { randomUUID, randomPastDate } from "../utils/random";

export type GeneratedUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

let userCounter = 0;

export const generateUser = (): GeneratedUser => {
  const index = ++userCounter;
  const now = randomPastDate(90);
  return {
    id: randomUUID(),
    username: `user${index}`,
    name: `Test User ${index}`,
    email: `user${index}@local`,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };
};

export const generateUsers = (count: number): GeneratedUser[] =>
  Array.from({ length: count }, () => generateUser());
