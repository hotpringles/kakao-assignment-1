"use client";

export default function TodosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6">
      <section className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-red-600">Error</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-950">
          Todo를 불러오지 못했습니다
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          백엔드 서버가 실행 중인지 확인한 뒤 다시 시도하세요.
        </p>
        {error.message ? (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          다시 시도
        </button>
      </section>
    </main>
  );
}
