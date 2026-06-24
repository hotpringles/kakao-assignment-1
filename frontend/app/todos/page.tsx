import Link from "next/link";
import { getTodos } from "../actions";
import { TodoList } from "./todo-list";

export default async function TodosPage() {
  const todos = await getTodos();
  const activeCount = todos.filter((todo) => !todo.completed).length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Todo</p>
          <h1 className="text-3xl font-semibold text-slate-950">할 일 목록</h1>
          <p className="mt-2 text-sm text-slate-600">
            전체 {todos.length}개 중 미완료 {activeCount}개
          </p>
        </div>
        <Link
          href="/todos/new"
          className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          새 Todo
        </Link>
      </header>

      <TodoList todos={todos} />
    </main>
  );
}
