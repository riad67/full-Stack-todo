import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { getErrorMessage } from "../api/client";
import { todoApi } from "../api/todos";
import type { Todo, TodoCreateInput, TodoUpdateInput } from "../types";

const EXIT_ANIMATION_MS = 180;

const byNewest = (a: Todo, b: Todo) =>
  Date.parse(b.created_at) - Date.parse(a.created_at);

/** Ids below zero belong to todos that exist only on the client until saved. */
export const isUnsaved = (todo: Todo) => todo.id < 0;

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<ReadonlySet<number>>(new Set());

  // Lets async handlers read the latest list when they need to roll back.
  const todosRef = useRef(todos);
  todosRef.current = todos;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTodos(await todoApi.list());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (input: TodoCreateInput): Promise<boolean> => {
    const tempId = -Date.now();
    const optimistic: Todo = {
      id: tempId,
      title: input.title,
      description: input.description,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: null,
    };
    setTodos((prev) => [optimistic, ...prev]);
    try {
      const saved = await todoApi.create(input);
      setTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
      toast.success("Todo added");
      return true;
    } catch (err) {
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
      toast.error(`Couldn't add the todo. ${getErrorMessage(err)}`);
      return false;
    }
  }, []);

  const update = useCallback(
    async (
      id: number,
      patch: TodoUpdateInput,
      options: { silent?: boolean } = {},
    ): Promise<boolean> => {
      const previous = todosRef.current.find((t) => t.id === id);
      if (!previous) return false;

      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      try {
        const saved = await todoApi.update(id, patch);
        setTodos((prev) => prev.map((t) => (t.id === id ? saved : t)));
        if (!options.silent) toast.success("Todo updated");
        return true;
      } catch (err) {
        setTodos((prev) => prev.map((t) => (t.id === id ? previous : t)));
        toast.error(`Couldn't update the todo. ${getErrorMessage(err)}`);
        return false;
      }
    },
    [],
  );

  const remove = useCallback(async (id: number): Promise<void> => {
    const removed = todosRef.current.find((t) => t.id === id);
    if (!removed) return;

    // Let the exit transition play, then drop the item before the request returns.
    setRemovingIds((prev) => new Set(prev).add(id));
    await new Promise((resolve) => setTimeout(resolve, EXIT_ANIMATION_MS));
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setRemovingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    try {
      await todoApi.remove(id);
      toast.success("Todo deleted");
    } catch (err) {
      setTodos((prev) => [...prev, removed].sort(byNewest));
      toast.error(`Couldn't delete the todo. ${getErrorMessage(err)}`);
    }
  }, []);

  return { todos, loading, error, removingIds, reload: load, create, update, remove };
}
