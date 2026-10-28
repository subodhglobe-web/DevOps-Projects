// Thin API client for the calculator backend. Nothing UI-related lives here -
// just building the request, calling fetch, and turning the response into
// either a typed result or a thrown Error. Components should never call
// fetch() directly; they should go through `calculate()`.

/** The base URL of the backend, e.g. "http://localhost:8080". Configured via
 * the VITE_API_BASE_URL environment variable (see frontend/.env).
 *
 * When it's not set, this falls back to "" (a relative path) rather than a
 * hardcoded host - so `fetch("/api/calculate")` resolves against whatever
 * origin is currently serving the page. That's what makes the Docker/Nginx
 * setup work: the production image is built with no VITE_API_BASE_URL (see
 * frontend/.dockerignore, which excludes .env from the build), so the app
 * calls same-origin "/api/..." URLs, and Nginx reverse-proxies those to the
 * backend container. Local `npm run dev` is unaffected, since frontend/.env
 * already sets VITE_API_BASE_URL for that case. */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

/** The six operations the backend understands. Keeping this as a union type
 * (rather than a TS enum) means it disappears completely at build time and
 * still gives autocomplete + compile-time checking wherever it's used. */
export type Operation = "add" | "subtract" | "multiply" | "divide" | "power" | "sqrt";

/** List of all operations, handy for populating a <select> dropdown. */
export const OPERATIONS: readonly Operation[] = ["add", "subtract", "multiply", "divide", "power", "sqrt"];

/** Request body sent to POST /api/calculate.
 *
 * `b` is optional: for "sqrt" it should simply be omitted (left `undefined`)
 * rather than sent as 0 or null - `JSON.stringify` drops `undefined`
 * properties automatically, so `{ operation: "sqrt", a: 25 }` is exactly
 * what goes over the wire. */
export interface CalculateRequest {
  operation: Operation;
  a: number;
  b?: number;
}

/** Response body on success, e.g. `{ "result": 15 }`. */
export interface CalculateResponse {
  result: number;
}

/** Response body on failure, e.g. `{ "error": "division by zero" }`. */
interface CalculateErrorResponse {
  error: string;
}

function isCalculateResponse(body: unknown): body is CalculateResponse {
  return typeof body === "object" && body !== null && typeof (body as CalculateResponse).result === "number";
}

function isCalculateErrorResponse(body: unknown): body is CalculateErrorResponse {
  return typeof body === "object" && body !== null && typeof (body as CalculateErrorResponse).error === "string";
}

/**
 * Calls POST /api/calculate on the backend and returns the parsed result.
 *
 * On a non-2xx response, throws an Error whose message is the backend's
 * `error` field when available, falling back to a generic message
 * otherwise - so callers can just do:
 *
 *   try {
 *     const { result } = await calculate({ operation: "divide", a: 10, b: 0 });
 *   } catch (err) {
 *     showError((err as Error).message); // "division by zero"
 *   }
 */
export async function calculate(request: CalculateRequest): Promise<CalculateResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error("Unable to reach the calculator server. Please check that it is running.");
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = isCalculateErrorResponse(body)
      ? body.error
      : `Calculation failed (status ${response.status}).`;
    throw new Error(message);
  }

  if (!isCalculateResponse(body)) {
    throw new Error("Received an unexpected response from the calculator server.");
  }

  return body;
}
