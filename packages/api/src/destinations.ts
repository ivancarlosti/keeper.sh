import { database } from "@keeper.sh/database";
import { calendarDestinationsTable } from "@keeper.sh/database/schema";
import { eq, and } from "drizzle-orm";

export {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  fetchUserInfo,
  validateState,
} from "@keeper.sh/oauth-google";

interface CalendarDestination {
  id: string;
  provider: string;
  email: string | null;
}

export const saveCalendarDestination = async (
  userId: string,
  provider: string,
  accountId: string,
  email: string | null,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
): Promise<void> => {
  const [existingDestination] = await database
    .select({
      id: calendarDestinationsTable.id,
      userId: calendarDestinationsTable.userId,
    })
    .from(calendarDestinationsTable)
    .where(
      and(
        eq(calendarDestinationsTable.provider, provider),
        eq(calendarDestinationsTable.accountId, accountId),
      ),
    )
    .limit(1);

  if (existingDestination && existingDestination.userId !== userId) {
    throw new Error("This account is already linked to another user");
  }

  await database
    .insert(calendarDestinationsTable)
    .values({
      userId,
      provider,
      accountId,
      email,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: expiresAt,
    })
    .onConflictDoUpdate({
      target: [
        calendarDestinationsTable.provider,
        calendarDestinationsTable.accountId,
      ],
      set: {
        email,
        accessToken,
        refreshToken,
        accessTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      },
    });
};

export const listCalendarDestinations = async (
  userId: string,
): Promise<CalendarDestination[]> => {
  const destinations = await database
    .select({
      id: calendarDestinationsTable.id,
      provider: calendarDestinationsTable.provider,
      email: calendarDestinationsTable.email,
    })
    .from(calendarDestinationsTable)
    .where(eq(calendarDestinationsTable.userId, userId));

  return destinations;
};

export const deleteCalendarDestination = async (
  userId: string,
  destinationId: string,
): Promise<boolean> => {
  const result = await database
    .delete(calendarDestinationsTable)
    .where(
      and(
        eq(calendarDestinationsTable.userId, userId),
        eq(calendarDestinationsTable.id, destinationId),
      ),
    )
    .returning({ id: calendarDestinationsTable.id });

  return result.length > 0;
};
