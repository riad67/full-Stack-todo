import { useState } from "react";

import { isUnsaved } from "../hooks/useTodos";
import type { Todo, TodoFormValues } from "../types";
import TodoForm from "./TodoForm";

interface Props {
  todo: Todo;
  removing: boolean;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo, values: TodoFormValues) => Promise<boolean>;
  onDelete: (todo: Todo) => void;
}

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function TodoItem({ todo, removing, onToggle, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const unsaved = isUnsaved(todo);

  return (
    <li
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/60 transition-all duration-200 animate-item-in ${
        removing ? "-translate-x-2 scale-[0.98] opacity-0" : ""
      }`}
    >
      {editing ? (
        <TodoForm
          autoFocus
          submitLabel="Save changes"
          initialValues={{ title: todo.title, description: todo.description ?? "" }}
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            const ok = await onEdit(todo, values);
            if (ok) setEditing(false);
            return ok;
          }}
        />
      ) : (
        <div className="flex items-start gap-3.5">
          <input
            type="checkbox"
            checked={todo.completed}
            disabled={unsaved}
            onChange={() => onToggle(todo)}
            aria-label={`Mark "${todo.title}" as ${todo.completed ? "not done" : "done"}`}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md accent-indigo-600 disabled:cursor-wait"
          />

          <div
            className={`min-w-0 flex-1 transition-opacity duration-200 ${
              todo.completed ? "opacity-50" : ""
            }`}
          >
            <p
              className={`break-words font-medium text-slate-900 ${
                todo.completed ? "line-through" : ""
              }`}
            >
              {todo.title}
            </p>
            {todo.description && (
              <p
                className={`mt-1 whitespace-pre-wrap break-words text-sm text-slate-600 ${
                  todo.completed ? "line-through" : ""
                }`}
              >
                {todo.description}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              {unsaved ? "Saving…" : `Added ${dateFormat.format(new Date(todo.created_at))}`}
            </p>
          </div>

          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => setEditing(true)}
              disabled={unsaved}
              aria-label={`Edit "${todo.title}"`}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-violet-50 hover:text-violet-600 disabled:cursor-wait disabled:opacity-40"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(todo)}
              disabled={unsaved}
              aria-label={`Delete "${todo.title}"`}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-40"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0 0-2h-3.382l-.724-1.447A1 1 0 0 0 11 2H9ZM7 8a1 1 0 0 1 2 0v6a1 1 0 1 1-2 0V8Zm5-1a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
