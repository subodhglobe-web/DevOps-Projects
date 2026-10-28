import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { calculate, OPERATIONS } from "../services/calculatorApi.ts";
import type { CalculateRequest, Operation } from "../services/calculatorApi.ts";
import "./Calculator.css";

const OPERATION_LABELS: Record<Operation, string> = {
  add: "Add (a + b)",
  subtract: "Subtract (a − b)",
  multiply: "Multiply (a × b)",
  divide: "Divide (a ÷ b)",
  power: "Power (a ^ b)",
  sqrt: "Square root (√a)",
};

/** Parses user input into a finite number, or null if it isn't one.
 * Kept separate from validation so both the "required" and "must be a
 * valid number" checks can reuse it. */
function parseNumber(raw: string): number | null {
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

type ValidationResult = { ok: true; request: CalculateRequest } | { ok: false; message: string };

/**
 * Validates the raw form input and, if everything checks out, returns the
 * exact request body to send to the backend. Keeping this as one function
 * (rather than scattering checks through the component) means there's a
 * single source of truth for "is this submission allowed?".
 */
function validateAndBuildRequest(operation: Operation | "", rawA: string, rawB: string): ValidationResult {
  if (operation === "") {
    return { ok: false, message: "Please choose an operation." };
  }

  const trimmedA = rawA.trim();
  if (trimmedA === "") {
    return { ok: false, message: "First number is required." };
  }
  const a = parseNumber(trimmedA);
  if (a === null) {
    return { ok: false, message: "First number must be a valid number." };
  }

  if (operation === "sqrt") {
    if (a < 0) {
      return { ok: false, message: "Cannot take the square root of a negative number." };
    }
    return { ok: true, request: { operation, a } };
  }

  const trimmedB = rawB.trim();
  if (trimmedB === "") {
    return { ok: false, message: "Second number is required." };
  }
  const b = parseNumber(trimmedB);
  if (b === null) {
    return { ok: false, message: "Second number must be a valid number." };
  }
  if (operation === "divide" && b === 0) {
    return { ok: false, message: "Cannot divide by zero." };
  }

  return { ok: true, request: { operation, a, b } };
}

export function Calculator() {
  const [operation, setOperation] = useState<Operation | "">("");
  const [rawA, setRawA] = useState("");
  const [rawB, setRawB] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isUnary = operation === "sqrt";

  function handleOperationChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextOperation = event.target.value as Operation | "";
    setOperation(nextOperation);
    setResult(null);
    setError(null);
    // The backend rejects "b" entirely for sqrt, so clear it out of the form
    // too - there's no point keeping a value around that will never be sent.
    if (nextOperation === "sqrt") {
      setRawB("");
    }
  }

  function handleAChange(event: ChangeEvent<HTMLInputElement>) {
    setRawA(event.target.value);
    setResult(null);
    setError(null);
  }

  function handleBChange(event: ChangeEvent<HTMLInputElement>) {
    setRawB(event.target.value);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateAndBuildRequest(operation, rawA, rawB);
    if (validation.ok === false) {
      setResult(null);
      setError(validation.message);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await calculate(validation.request);
      setResult(response.result);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="calculator" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="operation">Operation</label>
        <select id="operation" value={operation} onChange={handleOperationChange} disabled={isLoading}>
          <option value="" disabled>
            Select an operation…
          </option>
          {OPERATIONS.map((op) => (
            <option key={op} value={op}>
              {OPERATION_LABELS[op]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="operand-a">{isUnary ? "Number" : "First number"}</label>
        <input
          id="operand-a"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 10"
          value={rawA}
          onChange={handleAChange}
          disabled={isLoading}
        />
      </div>

      {!isUnary && (
        <div className="field">
          <label htmlFor="operand-b">Second number</label>
          <input
            id="operand-b"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 5"
            value={rawB}
            onChange={handleBChange}
            disabled={isLoading}
          />
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Calculating…" : "Calculate"}
      </button>

      <div className="calculator-status" aria-live="polite">
        {error && (
          <p className="message message-error" role="alert">
            {error}
          </p>
        )}

        {result !== null && !error && (
          <p className="message message-result">
            Result: <strong>{result}</strong>
          </p>
        )}
      </div>
    </form>
  );
}
