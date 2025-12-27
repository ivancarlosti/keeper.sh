import env from "@keeper.sh/env/next/backend";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> },
) {
  const { identifier } = await params;

  if (env.API_URL) {
    throw Error("API_URL must be set");
  }

  const url = new URL(`/cal/${identifier}`, env.API_URL);
  const response = await fetch(url);

  if (!response.ok) {
    return new Response("Not found", { status: 404 });
  }

  const body = await response.text();
  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
}
