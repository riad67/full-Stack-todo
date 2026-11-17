import { z } from "zod";

/** Shape of a todo as returned by the API. */
export const todoSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

export const todoListSchema = z.array(todoSchema);

/** Validation for the add / edit form. */
export const todoFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title for this todo")
    .max(255, "Keep the title to 255 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(5000, "Keep the description to 5,000 characters or fewer"),
});

export type Todo = z.infer<typeof todoSchema>;
export type TodoFormValues = z.infer<typeof todoFormSchema>;

export interface TodoCreateInput {
  title: string;
  description: string | null;
}

export interface TodoUpdateInput {
  title?: string;
  description?: string | null;
  completed?: boolean;
}
