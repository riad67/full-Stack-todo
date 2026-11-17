import axios, { AxiosError } from "axios";
import { ZodError } from "zod";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

/** Turns any thrown value into a message that is safe to show to a person. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: unknown }>;
    if (!err.response) {
      return err.code === "ECONNABORTED"
        ? "The request timed out. Try again."
        : "Can't reach the server. Check that the backend is running on port 8000.";
    }
    if (err.response.status === 429) {
      return "Too many requests. Wait a moment and try again.";
    }
    const detail = err.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) return first.msg.replace(/^Value error, /, "");
    }
    return `The request failed (status ${err.response.status}).`;
  }
  if (error instanceof ZodError) {
    return "The server sent a response this app doesn't understand.";
  }
  return "Something went wrong. Try again.";
}
