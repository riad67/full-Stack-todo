export function LoadingSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">Loading your todos</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex animate-pulse items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4"
        >
          <div className="mt-0.5 h-5 w-5 rounded-md bg-slate-200" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">No todos yet</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
        Add your first todo above and it will show up here.
      </p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center"
    >
      <h2 className="text-base font-semibold text-rose-900">Your todos didn't load</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-rose-700">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}
