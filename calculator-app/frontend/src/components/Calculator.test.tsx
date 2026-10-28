import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.tsx";
import { Calculator } from "./Calculator.tsx";
import { calculate } from "../services/calculatorApi.ts";

// Replace the real calculate() (which calls fetch) with a mock, while
// keeping every other export (OPERATIONS, the types, etc.) exactly as they
// really are - similar to @MockBean in a Spring test: only the one
// collaborator we care about is faked, everything else is real.
vi.mock("../services/calculatorApi.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/calculatorApi.ts")>();
  return {
    ...actual,
    calculate: vi.fn(),
  };
});

const mockedCalculate = vi.mocked(calculate);

afterEach(() => {
  mockedCalculate.mockReset();
});

// Small query helpers so every test refers to fields the same way a user
// would - by their visible label - instead of repeating long queries.
// The first-number field's label switches between "First number" (binary
// ops) and "Number" (sqrt), so it's matched with an anchored regex to avoid
// accidentally also matching "Second number".
function getOperationSelect() {
  return screen.getByRole("combobox", { name: "Operation" });
}
function getFirstNumberInput() {
  return screen.getByRole("textbox", { name: /^(first number|number)$/i });
}
function getSecondNumberInput() {
  return screen.getByRole("textbox", { name: "Second number" });
}
function getCalculateButton() {
  return screen.getByRole("button", { name: "Calculate" });
}

describe("Calculator", () => {
  it("renders the title, operation dropdown, number inputs, and calculate button", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Calculator" })).toBeInTheDocument();
    expect(getOperationSelect()).toBeInTheDocument();
    expect(getFirstNumberInput()).toBeInTheDocument();
    expect(getSecondNumberInput()).toBeInTheDocument();
    expect(getCalculateButton()).toBeInTheDocument();
  });

  it("shows a validation error when the first number is missing", async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.selectOptions(getOperationSelect(), "add");
    await user.type(getSecondNumberInput(), "5");
    await user.click(getCalculateButton());

    expect(await screen.findByRole("alert")).toHaveTextContent("First number is required.");
    expect(mockedCalculate).not.toHaveBeenCalled();
  });

  it("shows a validation error when the second number is missing for a binary operation", async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.selectOptions(getOperationSelect(), "add");
    await user.type(getFirstNumberInput(), "10");
    await user.click(getCalculateButton());

    expect(await screen.findByRole("alert")).toHaveTextContent("Second number is required.");
    expect(mockedCalculate).not.toHaveBeenCalled();
  });

  it("shows a validation error for division by zero", async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.selectOptions(getOperationSelect(), "divide");
    await user.type(getFirstNumberInput(), "10");
    await user.type(getSecondNumberInput(), "0");
    await user.click(getCalculateButton());

    expect(await screen.findByRole("alert")).toHaveTextContent("Cannot divide by zero.");
    expect(mockedCalculate).not.toHaveBeenCalled();
  });

  it("hides the second number input for sqrt", async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.selectOptions(getOperationSelect(), "sqrt");

    expect(screen.queryByLabelText("Second number")).not.toBeInTheDocument();
    expect(getFirstNumberInput()).toBeInTheDocument();
  });

  it("shows a validation error for the square root of a negative number", async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    await user.selectOptions(getOperationSelect(), "sqrt");
    await user.type(getFirstNumberInput(), "-4");
    await user.click(getCalculateButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cannot take the square root of a negative number.",
    );
    expect(mockedCalculate).not.toHaveBeenCalled();
  });

  it("calls the API service with the correct payload for addition", async () => {
    mockedCalculate.mockResolvedValueOnce({ result: 15 });
    const user = userEvent.setup();
    render(<Calculator />);

    await user.selectOptions(getOperationSelect(), "add");
    await user.type(getFirstNumberInput(), "10");
    await user.type(getSecondNumberInput(), "5");
    await user.click(getCalculateButton());

    await screen.findByText("15");
    expect(mockedCalculate).toHaveBeenCalledTimes(1);
    expect(mockedCalculate).toHaveBeenCalledWith({ operation: "add", a: 10, b: 5 });
  });

  it("calls the API service with the correct payload for sqrt, without operand b", async () => {
    mockedCalculate.mockResolvedValueOnce({ result: 5 });
    const user = userEvent.setup();
    render(<Calculator />);

    await user.selectOptions(getOperationSelect(), "sqrt");
    await user.type(getFirstNumberInput(), "25");
    await user.click(getCalculateButton());

    await screen.findByText("5");
    expect(mockedCalculate).toHaveBeenCalledTimes(1);
    expect(mockedCalculate).toHaveBeenCalledWith({ operation: "sqrt", a: 25 });
  });

  it("displays the result returned by the API", async () => {
    mockedCalculate.mockResolvedValueOnce({ result: 42 });
    const user = userEvent.setup();
    render(<Calculator />);

    await user.selectOptions(getOperationSelect(), "multiply");
    await user.type(getFirstNumberInput(), "6");
    await user.type(getSecondNumberInput(), "7");
    await user.click(getCalculateButton());

    expect(await screen.findByText("42")).toBeInTheDocument();
  });

  it("displays an error message returned by the API", async () => {
    mockedCalculate.mockRejectedValueOnce(new Error("division by zero"));
    const user = userEvent.setup();
    render(<Calculator />);

    // Use an operation/operand combination that passes client-side
    // validation, so the request actually reaches the (mocked) API and we
    // can verify the component surfaces whatever error it throws.
    await user.selectOptions(getOperationSelect(), "divide");
    await user.type(getFirstNumberInput(), "10");
    await user.type(getSecondNumberInput(), "2");
    await user.click(getCalculateButton());

    expect(await screen.findByRole("alert")).toHaveTextContent("division by zero");
  });
});
