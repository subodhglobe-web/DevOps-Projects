package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// httptest.NewRequest + httptest.NewRecorder is the standard-library way to
// unit test an HTTP handler without starting a real server or opening a real
// socket - similar in spirit to Spring's MockMvc or a MockHttpServletResponse,
// but much smaller: we call the handler function directly and inspect the
// http.ResponseRecorder afterwards.

// postJSON is a small test helper: it builds a POST request with the given
// raw JSON body, runs it through CalculateHandler, and returns the recorder.
func postJSON(t *testing.T, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/calculate", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	CalculateHandler(rec, req)
	return rec
}

func decodeResult(t *testing.T, rec *httptest.ResponseRecorder) calculateResponse {
	t.Helper()
	var resp calculateResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode success response: %v, body=%s", err, rec.Body.String())
	}
	return resp
}

func decodeError(t *testing.T, rec *httptest.ResponseRecorder) errorResponse {
	t.Helper()
	var resp errorResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode error response: %v, body=%s", err, rec.Body.String())
	}
	return resp
}

func TestCalculateHandler_Add(t *testing.T) {
	rec := postJSON(t, `{"operation": "add", "a": 10, "b": 5}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body=%s", rec.Code, http.StatusOK, rec.Body.String())
	}
	if got := decodeResult(t, rec).Result; got != 15 {
		t.Errorf("result = %v, want 15", got)
	}
}

func TestCalculateHandler_Decimals(t *testing.T) {
	rec := postJSON(t, `{"operation": "divide", "a": 5.5, "b": 2}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body=%s", rec.Code, http.StatusOK, rec.Body.String())
	}
	if got := decodeResult(t, rec).Result; got != 2.75 {
		t.Errorf("result = %v, want 2.75", got)
	}
}

func TestCalculateHandler_Sqrt_OnlyRequiresA(t *testing.T) {
	rec := postJSON(t, `{"operation": "sqrt", "a": 16}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body=%s", rec.Code, http.StatusOK, rec.Body.String())
	}
	if got := decodeResult(t, rec).Result; got != 4 {
		t.Errorf("result = %v, want 4", got)
	}
}

func TestCalculateHandler_InvalidJSON(t *testing.T) {
	rec := postJSON(t, `{"operation": "add", "a": 10,`) // truncated / malformed JSON

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
	if decodeError(t, rec).Error == "" {
		t.Error("expected a non-empty error message")
	}
}

func TestCalculateHandler_MissingOperation(t *testing.T) {
	rec := postJSON(t, `{"a": 10, "b": 5}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}

func TestCalculateHandler_EmptyOperation(t *testing.T) {
	rec := postJSON(t, `{"operation": "", "a": 10, "b": 5}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}

func TestCalculateHandler_UnsupportedOperation(t *testing.T) {
	rec := postJSON(t, `{"operation": "modulo", "a": 10, "b": 5}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}

func TestCalculateHandler_MissingA(t *testing.T) {
	rec := postJSON(t, `{"operation": "add", "b": 5}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}

func TestCalculateHandler_MissingB_ForBinaryOperation(t *testing.T) {
	rec := postJSON(t, `{"operation": "add", "a": 10}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}

func TestCalculateHandler_MissingB_NotRequiredForSqrt(t *testing.T) {
	rec := postJSON(t, `{"operation": "sqrt", "a": 9}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d, body=%s", rec.Code, http.StatusOK, rec.Body.String())
	}
}

func TestCalculateHandler_Sqrt_RejectsUnexpectedB(t *testing.T) {
	rec := postJSON(t, `{"operation": "sqrt", "a": 25, "b": 5}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
	if got, want := decodeError(t, rec).Error, "operand b is not allowed for sqrt"; got != want {
		t.Errorf("error = %q, want %q", got, want)
	}
}

func TestCalculateHandler_OperandAIsString(t *testing.T) {
	rec := postJSON(t, `{"operation": "add", "a": "10", "b": 5}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}

func TestCalculateHandler_OperandBIsString(t *testing.T) {
	rec := postJSON(t, `{"operation": "add", "a": 10, "b": "5"}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
}

func TestCalculateHandler_DivisionByZero(t *testing.T) {
	rec := postJSON(t, `{"operation": "divide", "a": 10, "b": 0}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
	if got := decodeError(t, rec).Error; got != "division by zero" {
		t.Errorf("error = %q, want %q", got, "division by zero")
	}
}

func TestCalculateHandler_SqrtOfNegative(t *testing.T) {
	rec := postJSON(t, `{"operation": "sqrt", "a": -4}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusBadRequest)
	}
	if decodeError(t, rec).Error == "" {
		t.Error("expected a non-empty error message")
	}
}

func TestCalculateHandler_WrongHTTPMethod(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/calculate", nil)
	rec := httptest.NewRecorder()
	CalculateHandler(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusMethodNotAllowed)
	}
}

func TestHealthHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	HealthHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
	}

	var body map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to decode health response: %v", err)
	}
	if body["status"] != "ok" {
		t.Errorf(`status field = %q, want "ok"`, body["status"])
	}
}

func TestWithCORS_SetsHeadersAndHandlesPreflight(t *testing.T) {
	wrapped := WithCORS(http.HandlerFunc(HealthHandler))

	// A real GET request should reach the underlying handler and still carry
	// the CORS header, so the browser's fetch() call is allowed to read it.
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	wrapped.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("GET status = %d, want %d", rec.Code, http.StatusOK)
	}
	if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, "*")
	}

	// A browser's OPTIONS preflight should short-circuit with 204 and never
	// reach the underlying handler.
	preflightReq := httptest.NewRequest(http.MethodOptions, "/api/calculate", nil)
	preflightRec := httptest.NewRecorder()
	wrapped.ServeHTTP(preflightRec, preflightReq)

	if preflightRec.Code != http.StatusNoContent {
		t.Fatalf("OPTIONS status = %d, want %d", preflightRec.Code, http.StatusNoContent)
	}
}
