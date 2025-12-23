import { createHash } from "crypto";
import type { SyncableEvent } from "./types";

const SUFFIX = "@keeper.sh";

const createEventHash = (event: SyncableEvent): string => {
  const data = `${event.sourceUrl}:${event.startTime.getTime()}:${event.endTime.getTime()}`;
  return createHash("sha256").update(data).digest("base64url").slice(0, 16);
};

export const generateEventUid = (
  userId: string,
  event: SyncableEvent,
): string => {
  const hash = createEventHash(event);
  return `${userId}-${hash}${SUFFIX}`;
};

export const parseEventUid = (
  uid: string,
): { userId: string; hash: string } | null => {
  if (!uid.endsWith(SUFFIX)) {
    return null;
  }

  const localPart = uid.slice(0, -SUFFIX.length);
  const [userId, ...hashComponents] = localPart.split("-");

  if (!userId || hashComponents.length === 0) {
    return null;
  }

  return { userId, hash: hashComponents.join("-") };
};

export const isKeeperEvent = (uid: string): boolean => uid.endsWith(SUFFIX);
