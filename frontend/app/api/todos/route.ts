import { NextRequest, NextResponse } from "next/server";

function backendUrl() {
  const value = process.env.BACKEND_URL;
  if (!value) {
    throw new Error("BACKEND_URL environment variable is required");
  }

  return value;
}

async function proxy(path: string, init?: RequestInit) {
  const response = await fetch(`${backendUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return NextResponse.json(body, { status: response.status });
}

export async function GET() {
  return proxy("/todos");
}

export async function POST(request: NextRequest) {
  return proxy("/todos", {
    method: "POST",
    body: await request.text(),
  });
}
