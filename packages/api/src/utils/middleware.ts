import { log } from "@keeper.sh/log";
import { auth } from "../context";

interface RouteContext {
  request: Request;
  params: Record<string, string>;
}

interface AuthenticatedRouteContext extends RouteContext {
  userId: string;
}

export type RouteHandler = (
  request: Request,
  params: Record<string, string>,
) => Promise<Response>;

type RouteCallback = (ctx: RouteContext) => Promise<Response>;
type AuthenticatedRouteCallback = (
  ctx: AuthenticatedRouteContext,
) => Promise<Response>;

export const withTracing = (handler: RouteCallback): RouteHandler => {
  return async (request, params) => {
    const url = request.url;
    log.trace("request to %s started", url);
    const result = await handler({ request, params });
    log.trace("request to %s complete", url);
    return result;
  };
};

const getSession = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return session;
};

export const withAuth = (
  handler: AuthenticatedRouteCallback,
): RouteCallback => {
  return async ({ request, params }) => {
    const session = await getSession(request);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler({ request, params, userId: session.user.id });
  };
};
