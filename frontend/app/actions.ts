"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type Todo = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

async function requestBackend<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${requiredEnv("BACKEND_URL")}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Todo API request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function appUrl(path: string) {
  const headerStore = await headers();
  const host = headerStore.get("host");

  if (host) {
    const protocol = headerStore.get("x-forwarded-proto") ?? "http";
    return `${protocol}://${host}${path}`;
  }

  return `${requiredEnv("APP_ORIGIN")}${path}`;
}

async function requestApiRoute<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(await appUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Todo API route request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getTodos() {
  return requestBackend<Todo[]>("/todos");
}

export async function getTodo(todoId: string) {
  return requestBackend<Todo>(`/todos/${todoId}`);
}

export async function createTodo(formData: FormData) {
  await requestApiRoute<Todo>("/api/todos", {
    method: "POST",
    body: JSON.stringify({
      title: readText(formData, "title"),
      description: readText(formData, "description"),
    }),
  });

  revalidatePath("/todos");
  redirect("/todos");
}

export async function updateTodo(todoId: number, formData: FormData) {
  await requestApiRoute<Todo>(`/api/todos/${todoId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: readText(formData, "title"),
      description: readText(formData, "description"),
      completed: formData.get("completed") === "on",
    }),
  });

  revalidatePath("/todos");
  revalidatePath(`/todos/${todoId}`);
  redirect("/todos");
}

export async function toggleTodo(todoId: number, completed: boolean) {
  await requestApiRoute<Todo>(`/api/todos/${todoId}`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });

  revalidatePath("/todos");
}

export async function deleteTodo(todoId: number) {
  await requestApiRoute<void>(`/api/todos/${todoId}`, {
    method: "DELETE",
  });

  revalidatePath("/todos");
}
