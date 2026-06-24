import Link from "next/link";
import { notFound } from "next/navigation";
import { getTodo, updateTodo } from "../../actions";
import { TodoForm } from "../todo-form";

type PageProps = {
  params: Promise<{
    todoId: string;
  }>;
};

export default async function EditTodoPage({ params }: PageProps) {
  const { todoId } = await params;
  const id = Number(todoId);

  if (!Number.isInteger(id) || id < 1) {
    notFound();
  }

  const todo = await getTodo(todoId).catch(() => null);

  if (!todo) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-10">
      <header>
        <Link href="/todos" className="text-sm font-medium text-slate-500">
          목록으로
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">
          Todo 수정
        </h1>
      </header>

      <TodoForm
        action={updateTodo.bind(null, todo.id)}
        submitLabel="저장"
        todo={todo}
      />
    </main>
  );
}
