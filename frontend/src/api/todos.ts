import {
  Todo,
  TodoCreateInput,
  TodoUpdateInput,
  todoListSchema,
  todoSchema,
} from "../types";
import { http } from "./client";

const BASE = "/api/todos";

export const todoApi = {
  async list(): Promise<Todo[]> {
    const { data } = await http.get(BASE);
    return todoListSchema.parse(data);
  },

  async get(id: number): Promise<Todo> {
    const { data } = await http.get(`${BASE}/${id}`);
    return todoSchema.parse(data);
  },

  async create(input: TodoCreateInput): Promise<Todo> {
    const { data } = await http.post(BASE, input);
    return todoSchema.parse(data);
  },

  async update(id: number, input: TodoUpdateInput): Promise<Todo> {
    const { data } = await http.put(`${BASE}/${id}`, input);
    return todoSchema.parse(data);
  },

  async remove(id: number): Promise<void> {
    await http.delete(`${BASE}/${id}`);
  },
};
