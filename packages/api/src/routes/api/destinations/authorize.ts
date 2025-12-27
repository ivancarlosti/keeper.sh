import { calendarDestinationsTable } from "@keeper.sh/database/schema";
import { eq } from "drizzle-orm";
import { withTracing, withAuth } from "../../../utils/middleware";
import {
  getAuthorizationUrl,
  isOAuthProvider,
} from "../../../utils/destinations";
import { database, premiumService, baseUrl } from "../../../context";

export const GET = withTracing(
  withAuth(async ({ request, userId }) => {
    const url = new URL(request.url);
    const provider = url.searchParams.get("provider");

    if (!provider || !isOAuthProvider(provider)) {
      return Response.json({ error: "Unsupported provider" }, { status: 400 });
    }

    const existingDestinations = await database
      .select({ id: calendarDestinationsTable.id })
      .from(calendarDestinationsTable)
      .where(eq(calendarDestinationsTable.userId, userId));

    const allowed = await premiumService.canAddDestination(
      userId,
      existingDestinations.length,
    );

    if (!allowed) {
      const errorUrl = new URL("/dashboard/integrations", baseUrl);
      errorUrl.searchParams.set(
        "error",
        "Destination limit reached. Upgrade to Pro for unlimited destinations.",
      );
      return Response.redirect(errorUrl.toString());
    }

    const callbackUrl = new URL(
      `/api/destinations/callback/${provider}`,
      baseUrl,
    );
    const authUrl = getAuthorizationUrl(provider, userId, {
      callbackUrl: callbackUrl.toString(),
    });

    return Response.redirect(authUrl);
  }),
);
