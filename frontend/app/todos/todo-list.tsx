"use client";

import Link from "next/link";
import { useTransition } from "react";
import type { Todo } from "../actions";
import { deleteTodo, toggleTodo } from "../actions";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TodoList({ todos }: { todos: Todo[] }) {
  const [isPending, startTransition] = useTransition();

  if (todos.length === 0) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">
          등록된 Todo가 없습니다
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          새 Todo를 만들어 작업을 관리하세요.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <ul className="divide-y divide-slate-200">
        {todos.map((todo) => (
          <li key={todo.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => {
                      void toggleTodo(todo.id, !todo.completed);
                    })
                  }
                  className={`h-5 w-5 rounded border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    todo.completed
                      ? "border-emerald-600 bg-emerald-600"
                      : "border-slate-300 bg-white"
                  }`}
                  aria-label={todo.completed ? "미완료로 변경" : "완료로 변경"}
                />
                <h2
                  className={`truncate text-lg font-semibold ${
                    todo.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-950"
                  }`}
                >
                  {todo.title}
                </h2>
              </div>
              {todo.description ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {todo.description}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-slate-400">
                수정일 {formatDate(todo.updated_at)}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:justify-end">
              <Link
                href={`/todos/${todo.id}`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                수정
              </Link>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (!window.confirm("이 Todo를 삭제할까요?")) {
                    return;
                  }

                  startTransition(() => {
                    void deleteTodo(todo.id);
                  });
                }}
                className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
