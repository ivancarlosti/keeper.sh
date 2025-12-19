import { NextRequest } from "next/server";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error("API_URL is not set");
}

export async function GET(request: NextRequest) {
  const cookie = request.headers.get("Cookie");

  const response = await fetch(`${API_URL}/api/calendar-sources`, {
    headers: {
      ...(cookie && { Cookie: cookie }),
    },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const cookie = request.headers.get("Cookie");

  const response = await fetch(`${API_URL}/api/calendar-sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie && { Cookie: cookie }),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
