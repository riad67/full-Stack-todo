import { useCallback, useState } from "react";
import { Toaster } from "react-hot-toast";

import ConfirmDialog from "./components/ConfirmDialog";
import { EmptyState, ErrorState, LoadingSkeleton } from "./components/States";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import { useTodos } from "./hooks/useTodos";
import type { Todo, TodoFormValues } from "./types";

export default function App() {
  const { todos, loading, error, removingIds, reload, create, update, remove } = useTodos();
  const [pendingDelete, setPendingDelete] = useState<Todo | null>(null);

  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const handleCreate = (values: TodoFormValues) =>
    create({ title: values.title, description: values.description || null });

  const handleToggle = (todo: Todo) =>
    void update(todo.id, { completed: !todo.completed }, { silent: true });

  const handleEdit = (todo: Todo, values: TodoFormValues) =>
    update(todo.id, { title: values.title, description: values.description || null });

  const cancelDelete = useCallback(() => setPendingDelete(null), []);

  const confirmDelete = () => {
    if (pendingDelete) void remove(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", background: "#1e1b4b", color: "#fff", fontSize: "14px" },
        }}
      />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Todos</h1>
          <p className="mt-1 text-sm text-slate-500" aria-live="polite">
            {loading || error
              ? "Keep track of what's next."
              : total === 0
                ? "Nothing on your list."
                : `${total - done} open, ${done} done`}
          </p>
          {total > 0 && !loading && (
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Completed todos"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
        </header>

        <section
          aria-label="Add a todo"
          className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md shadow-indigo-100/50 sm:p-5"
        >
          <TodoForm submitLabel="Add todo" onSubmit={handleCreate} resetOnSubmit autoFocus />
        </section>

        <section aria-label="Your todos">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void reload()} />
          ) : total === 0 ? (
            <EmptyState />
          ) : (
            <TodoList
              todos={todos}
              removingIds={removingIds}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={setPendingDelete}
            />
          )}
        </section>
      </main>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this todo?"
          message={`"${pendingDelete.title}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete todo"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
