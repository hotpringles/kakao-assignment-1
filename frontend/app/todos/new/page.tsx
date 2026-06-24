import Link from "next/link";
import { createTodo } from "../../actions";
import { TodoForm } from "../todo-form";

export default function NewTodoPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-10">
      <header>
        <Link href="/todos" className="text-sm font-medium text-slate-500">
          목록으로
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">
          Todo 생성
        </h1>
      </header>

      <TodoForm action={createTodo} submitLabel="저장" />
    </main>
  );
}
