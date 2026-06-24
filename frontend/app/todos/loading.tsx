export default function TodosLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-4 w-14 rounded bg-slate-200" />
          <div className="mt-3 h-9 w-40 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-36 rounded bg-slate-100" />
        </div>
        <div className="h-11 w-24 rounded-md bg-slate-200" />
      </header>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {[0, 1, 2].map((item) => (
          <div key={item} className="border-b border-slate-200 p-5 last:border-0">
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-full rounded bg-slate-100" />
            <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </section>
    </main>
  );
}
