package calculator

import (
	"errors"
	"math"
	"testing"
)

// Go's built-in testing package plays the role of JUnit here. There's no
// @Test annotation - any func named TestXxx(t *testing.T) in a _test.go file
// is automatically discovered and run by `go test`.

func TestCalculate_Add(t *testing.T) {
	got, err := Calculate(Add, 10, 5)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != 15 {
		t.Errorf("Add(10, 5) = %v, want 15", got)
	}
}

func TestCalculate_Subtract(t *testing.T) {
	got, err := Calculate(Subtract, 10, 5)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != 5 {
		t.Errorf("Subtract(10, 5) = %v, want 5", got)
	}
}

func TestCalculate_Multiply(t *testing.T) {
	got, err := Calculate(Multiply, 10, 5)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != 50 {
		t.Errorf("Multiply(10, 5) = %v, want 50", got)
	}
}

func TestCalculate_Divide(t *testing.T) {
	got, err := Calculate(Divide, 10, 5)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != 2 {
		t.Errorf("Divide(10, 5) = %v, want 2", got)
	}
}

func TestCalculate_DivideByZero(t *testing.T) {
	_, err := Calculate(Divide, 10, 0)
	if !errors.Is(err, ErrDivisionByZero) {
		t.Fatalf("Divide(10, 0) error = %v, want ErrDivisionByZero", err)
	}
}

func TestCalculate_Power(t *testing.T) {
	got, err := Calculate(Power, 2, 3)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != 8 {
		t.Errorf("Power(2, 3) = %v, want 8", got)
	}
}

func TestCalculate_Sqrt(t *testing.T) {
	got, err := Calculate(Sqrt, 16, 0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != 4 {
		t.Errorf("Sqrt(16) = %v, want 4", got)
	}
}

func TestCalculate_SqrtNegative(t *testing.T) {
	_, err := Calculate(Sqrt, -4, 0)
	if !errors.Is(err, ErrNegativeSqrt) {
		t.Fatalf("Sqrt(-4) error = %v, want ErrNegativeSqrt", err)
	}
}

func TestCalculate_UnsupportedOperation(t *testing.T) {
	_, err := Calculate("modulo", 10, 3)
	if err == nil {
		t.Fatal("expected an error for an unsupported operation, got nil")
	}
}

func TestCalculate_Decimals(t *testing.T) {
	// Table-driven test: Go's idiomatic stand-in for JUnit's @ParameterizedTest.
	// Each entry is one test case; the t.Run subtest gives each case its own
	// name in the output, similar to a parameterized test's display name.
	tests := []struct {
		name      string
		operation string
		a, b      float64
		want      float64
	}{
		{"add decimals", Add, 10.5, 2.25, 12.75},
		{"subtract decimals", Subtract, 10.5, 0.5, 10},
		{"multiply decimals", Multiply, 2.5, 4, 10},
		{"divide decimals", Divide, 5, 2, 2.5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calculate(tt.operation, tt.a, tt.b)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if math.Abs(got-tt.want) > 1e-9 {
				t.Errorf("%s(%v, %v) = %v, want %v", tt.operation, tt.a, tt.b, got, tt.want)
			}
		})
	}
}

func TestIsSupported(t *testing.T) {
	supported := []string{Add, Subtract, Multiply, Divide, Power, Sqrt}
	for _, op := range supported {
		if !IsSupported(op) {
			t.Errorf("IsSupported(%q) = false, want true", op)
		}
	}

	if IsSupported("modulo") {
		t.Error(`IsSupported("modulo") = true, want false`)
	}
	if IsSupported("") {
		t.Error(`IsSupported("") = true, want false`)
	}
}

func TestRequiresSecondOperand(t *testing.T) {
	binaryOps := []string{Add, Subtract, Multiply, Divide, Power}
	for _, op := range binaryOps {
		if !RequiresSecondOperand(op) {
			t.Errorf("RequiresSecondOperand(%q) = false, want true", op)
		}
	}

	if RequiresSecondOperand(Sqrt) {
		t.Error("RequiresSecondOperand(sqrt) = true, want false")
	}
}
