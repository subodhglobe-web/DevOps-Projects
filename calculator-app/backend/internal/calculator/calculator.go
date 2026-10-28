// Package calculator contains the pure math logic for the calculator app.
//
// Think of this the way you'd think of a Java "CalculatorService" that has
// only static methods and no framework dependencies: it doesn't know about
// HTTP, JSON, or anything web-related. That separation makes it trivial to
// unit test and to reuse if we ever add a CLI or a gRPC API later.
package calculator

import (
	"errors"
	"fmt"
	"math"
)

// Operation names accepted by the API. Using untyped string constants (not a
// custom type) keeps comparisons with the raw JSON string simple, similar to
// how you might use `public static final String ADD = "add";` in Java.
const (
	Add      = "add"
	Subtract = "subtract"
	Multiply = "multiply"
	Divide   = "divide"
	Power    = "power"
	Sqrt     = "sqrt"
)

// Sentinel errors: package-level values that callers can compare against
// with errors.Is(err, calculator.ErrDivisionByZero). This is Go's equivalent
// of defining specific checked exception types in Java, but without the
// ceremony of declaring a new class per error.
var (
	ErrDivisionByZero = errors.New("division by zero")
	ErrNegativeSqrt   = errors.New("cannot take the square root of a negative number")
)

// IsSupported reports whether operation is one of the six operations this
// calculator understands.
func IsSupported(operation string) bool {
	switch operation {
	case Add, Subtract, Multiply, Divide, Power, Sqrt:
		return true
	default:
		return false
	}
}

// RequiresSecondOperand reports whether operation needs both "a" and "b".
// Every operation except sqrt is binary; sqrt only needs "a".
func RequiresSecondOperand(operation string) bool {
	return operation != Sqrt
}

// Calculate runs operation on a (and b, for binary operations) and returns
// the result. For sqrt, b is ignored entirely.
//
// This is the single entry point the HTTP layer calls - similar to a
// `calculate(String operation, double a, double b)` method on a Java service
// class, using a switch statement instead of the strategy/enum pattern you
// might reach for in Java.
func Calculate(operation string, a, b float64) (float64, error) {
	switch operation {
	case Add:
		return a + b, nil
	case Subtract:
		return a - b, nil
	case Multiply:
		return a * b, nil
	case Divide:
		if b == 0 {
			return 0, ErrDivisionByZero
		}
		return a / b, nil
	case Power:
		return math.Pow(a, b), nil
	case Sqrt:
		if a < 0 {
			return 0, ErrNegativeSqrt
		}
		return math.Sqrt(a), nil
	default:
		// fmt.Errorf is Go's equivalent of `new Exception("message")`, but it
		// returns a plain error value rather than something you throw/catch.
		return 0, fmt.Errorf("unsupported operation: %s", operation)
	}
}
