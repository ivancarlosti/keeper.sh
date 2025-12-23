import { database, account } from "@keeper.sh/database";
import {
  remoteICalSourcesTable,
  eventStatesTable,
  userSubscriptionsTable,
} from "@keeper.sh/database/schema";
import { and, asc, eq, gte } from "drizzle-orm";
import type { Plan } from "@keeper.sh/premium";
import type { SyncableEvent } from "@keeper.sh/integrations";

export interface GoogleAccount {
  userId: string;
  accountId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
}

export const getGoogleAccountsByPlan = async (
  targetPlan: Plan,
): Promise<GoogleAccount[]> => {
  const results = await database
    .select({
      userId: account.userId,
      accountId: account.accountId,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      accessTokenExpiresAt: account.accessTokenExpiresAt,
      plan: userSubscriptionsTable.plan,
    })
    .from(account)
    .leftJoin(
      userSubscriptionsTable,
      eq(account.userId, userSubscriptionsTable.userId),
    )
    .where(eq(account.providerId, "google"));

  const accounts: GoogleAccount[] = [];

  for (const result of results) {
    const { plan, accessToken, refreshToken, accessTokenExpiresAt } = result;
    const userPlan = plan ?? "free";

    if (
      userPlan !== targetPlan ||
      accessToken === null ||
      refreshToken === null ||
      accessTokenExpiresAt === null
    ) {
      continue;
    }

    accounts.push({
      userId: result.userId,
      accountId: result.accountId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
    });
  }

  return accounts;
};

export const getGoogleAccountForUser = async (
  userId: string,
): Promise<GoogleAccount | null> => {
  const results = await database
    .select({
      userId: account.userId,
      accountId: account.accountId,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      accessTokenExpiresAt: account.accessTokenExpiresAt,
    })
    .from(account)
    .where(and(eq(account.providerId, "google"), eq(account.userId, userId)))
    .limit(1);

  const result = results[0];
  if (!result) {
    return null;
  }

  const { accessToken, refreshToken, accessTokenExpiresAt } = result;
  if (
    accessToken === null ||
    refreshToken === null ||
    accessTokenExpiresAt === null
  ) {
    return null;
  }

  return {
    userId: result.userId,
    accountId: result.accountId,
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
  };
};

export const getUserEvents = async (userId: string): Promise<SyncableEvent[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const results = await database
    .select({
      id: eventStatesTable.id,
      startTime: eventStatesTable.startTime,
      endTime: eventStatesTable.endTime,
      sourceId: eventStatesTable.sourceId,
      sourceName: remoteICalSourcesTable.name,
    })
    .from(eventStatesTable)
    .innerJoin(
      remoteICalSourcesTable,
      eq(eventStatesTable.sourceId, remoteICalSourcesTable.id),
    )
    .where(
      and(
        eq(remoteICalSourcesTable.userId, userId),
        gte(eventStatesTable.startTime, today),
      ),
    )
    .orderBy(asc(eventStatesTable.startTime));

  return results.map(({ id, startTime, endTime, sourceId, sourceName }) => ({
    id,
    startTime,
    endTime,
    sourceId,
    sourceName,
    summary: sourceName,
  }));
};
