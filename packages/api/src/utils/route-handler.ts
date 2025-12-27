import type { RouteHandler } from "./middleware";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

interface RouteModule {
  GET?: RouteHandler;
  POST?: RouteHandler;
  PUT?: RouteHandler;
  PATCH?: RouteHandler;
  DELETE?: RouteHandler;
  HEAD?: RouteHandler;
}

const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
];

export const isHttpMethod = (method: string): method is HttpMethod =>
  HTTP_METHODS.some((httpMethod) => httpMethod === method);

export const isRouteModule = (module: unknown): module is RouteModule =>
  typeof module === "object" && module !== null;
