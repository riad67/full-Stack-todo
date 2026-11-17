import type { Todo, TodoFormValues } from "../types";
import TodoItem from "./TodoItem";

interface Props {
  todos: Todo[];
  removingIds: ReadonlySet<number>;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo, values: TodoFormValues) => Promise<boolean>;
  onDelete: (todo: Todo) => void;
}

export default function TodoList({ todos, removingIds, onToggle, onEdit, onDelete }: Props) {
  return (
    <ul className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          removing={removingIds.has(todo.id)}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
