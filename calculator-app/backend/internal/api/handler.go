// Package api contains the HTTP layer: request/response structs, JSON
// (de)serialization, validation, and routing glue. It's the equivalent of a
// Java "@RestController" class, except Go's standard library has no
// annotations or dependency injection - handlers are just plain functions
// with the signature func(http.ResponseWriter, *http.Request).
package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"calculator-app/backend/internal/calculator"
)

// calculateRequest mirrors the incoming JSON body. The struct tags
// (`json:"operation"`) tell encoding/json which JSON field maps to which Go
// field - this is the rough equivalent of Jackson's @JsonProperty, except
// it's built into the standard library instead of a separate dependency.
//
// A and B are *float64 (pointers) rather than plain float64 on purpose: a
// missing JSON field decodes to a nil pointer, while a field explicitly set
// to 0 decodes to a pointer to 0.0. That distinction is exactly what we need
// to tell "operand b was not provided" apart from "operand b is zero".
type calculateRequest struct {
	Operation string   `json:"operation"`
	A         *float64 `json:"a"`
	B         *float64 `json:"b"`
}

// calculateResponse is the success shape: {"result": 15}.
type calculateResponse struct {
	Result float64 `json:"result"`
}

// errorResponse is the failure shape: {"error": "division by zero"}.
type errorResponse struct {
	Error string `json:"error"`
}

// CalculateHandler handles POST /api/calculate.
//
// Unlike Spring MVC, plain net/http has no automatic request-body binding
// or bean validation, so every validation step below is written out
// explicitly. It looks more verbose than a Spring controller, but nothing
// here is hidden behind a framework - every step is plainly visible.
func CalculateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed, use POST")
		return
	}

	var req calculateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, invalidRequestMessage(err))
		return
	}

	operation := strings.TrimSpace(req.Operation)
	if operation == "" {
		writeError(w, http.StatusBadRequest, `"operation" is required`)
		return
	}

	if !calculator.IsSupported(operation) {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("unsupported operation: %q", operation))
		return
	}

	if req.A == nil {
		writeError(w, http.StatusBadRequest, `"a" is required`)
		return
	}

	var b float64
	if calculator.RequiresSecondOperand(operation) {
		if req.B == nil {
			writeError(w, http.StatusBadRequest, `"b" is required`)
			return
		}
		b = *req.B
	} else if req.B != nil {
		// Unary operations (sqrt) only take "a". Silently ignoring a
		// provided "b" would hide a likely client-side mistake, so we
		// reject it instead - the equivalent of bean validation rejecting
		// an unexpected field on a DTO.
		writeError(w, http.StatusBadRequest, fmt.Sprintf("operand b is not allowed for %s", operation))
		return
	}

	result, err := calculator.Calculate(operation, *req.A, b)
	if err != nil {
		// Domain errors (division by zero, negative sqrt) are the client's
		// fault - bad input - so they map to 400, not 500. A 500 is reserved
		// for unexpected server-side failures, which this handler doesn't have.
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, calculateResponse{Result: result})
}

// HealthHandler handles GET /health, a simple liveness check that a load
// balancer, uptime monitor, or a curl command can hit to confirm the server
// is up. Equivalent to a Spring Boot Actuator /health endpoint, but hand-rolled.
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed, use GET")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// invalidRequestMessage turns a JSON decoding error into a user-friendly
// message. errors.As is Go's version of `instanceof` combined with a cast:
// it checks whether err (or something it wraps) is a *json.UnmarshalTypeError
// and, if so, gives us access to its fields (like typeErr.Field below).
func invalidRequestMessage(err error) string {
	var typeErr *json.UnmarshalTypeError
	if errors.As(err, &typeErr) && typeErr.Field != "" {
		return fmt.Sprintf("%q must be a number", typeErr.Field)
	}
	return "invalid JSON in request body"
}

// writeJSON is a small helper so every handler serializes responses the same
// way. Go doesn't have a shared "@ControllerAdvice"-style response writer
// built in, so we write our own tiny one.
func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	// Encoding errors here would mean we tried to serialize something
	// unserializable, which can't happen with the fixed structs above, so we
	// intentionally ignore the error rather than adding dead error-handling code.
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, errorResponse{Error: message})
}
