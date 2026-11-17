import { FormEvent, useId, useRef, useState } from "react";

import { TodoFormValues, todoFormSchema } from "../types";

interface Props {
  initialValues?: TodoFormValues;
  submitLabel: string;
  /** Resolves to true when the change was saved. */
  onSubmit: (values: TodoFormValues) => Promise<boolean>;
  onCancel?: () => void;
  /** Clear the fields as soon as the form is submitted (used for adding). */
  resetOnSubmit?: boolean;
  autoFocus?: boolean;
}

type Errors = Partial<Record<keyof TodoFormValues, string>>;

const inputClass =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200";

export default function TodoForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  resetOnSubmit = false,
  autoFocus = false,
}: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = todoFormSchema.safeParse({ title, description });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
      });
      if (fieldErrors.title) titleRef.current?.focus();
      return;
    }

    setErrors({});
    const submittedTitle = title;
    const submittedDescription = description;
    if (resetOnSubmit) {
      setTitle("");
      setDescription("");
    }
    setSubmitting(true);
    const ok = await onSubmit(result.data);
    setSubmitting(false);

    // Give the text back if the save failed so nothing has to be retyped.
    if (!ok && resetOnSubmit) {
      setTitle(submittedTitle);
      setDescription(submittedDescription);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div>
        <label htmlFor={`${id}-title`} className="sr-only">
          Title
        </label>
        <input
          id={`${id}-title`}
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          autoFocus={autoFocus}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? `${id}-title-error` : undefined}
          className={`${inputClass} ${errors.title ? "border-rose-400" : "border-slate-200"}`}
        />
        {errors.title && (
          <p id={`${id}-title-error`} className="mt-1.5 text-xs font-medium text-rose-600">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-description`} className="sr-only">
          Description
        </label>
        <textarea
          id={`${id}-description`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details (optional)"
          rows={2}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? `${id}-description-error` : undefined}
          className={`${inputClass} resize-none ${errors.description ? "border-rose-400" : "border-slate-200"}`}
        />
        {errors.description && (
          <p
            id={`${id}-description-error`}
            className="mt-1.5 text-xs font-medium text-rose-600"
          >
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
