"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { Todo } from "../actions";

type TodoFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  todo?: Todo;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}

export function TodoForm({ action, submitLabel, todo }: TodoFormProps) {
  return (
    <form
      action={action}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">제목</span>
        <input
          name="title"
          required
          maxLength={120}
          defaultValue={todo?.title}
          className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-950"
        />
      </label>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-slate-700">설명</span>
        <textarea
          name="description"
          rows={6}
          defaultValue={todo?.description}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
        />
      </label>

      {todo ? (
        <label className="mt-5 flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            name="completed"
            type="checkbox"
            defaultChecked={todo.completed}
            className="h-4 w-4 rounded border-slate-300"
          />
          완료됨
        </label>
      ) : null}

      <div className="mt-6 flex justify-end gap-2">
        <Link
          href="/todos"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          취소
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
