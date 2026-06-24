import { NextRequest, NextResponse } from "next/server";

function backendUrl() {
  const value = process.env.BACKEND_URL;
  if (!value) {
    throw new Error("BACKEND_URL environment variable is required");
  }

  return value;
}

type RouteContext = {
  params: Promise<{
    todoId: string;
  }>;
};

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

async function todoPath(context: RouteContext) {
  const { todoId } = await context.params;
  return `/todos/${todoId}`;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  return proxy(await todoPath(context));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxy(await todoPath(context), {
    method: "PUT",
    body: await request.text(),
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(await todoPath(context), {
    method: "PATCH",
    body: await request.text(),
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  return proxy(await todoPath(context), {
    method: "DELETE",
  });
}
