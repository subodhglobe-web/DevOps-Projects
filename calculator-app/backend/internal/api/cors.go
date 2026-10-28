package api

import "net/http"

// WithCORS wraps a handler (typically your top-level mux) so that a browser
// running the React frontend on a different port (e.g. localhost:5173 or
// localhost:3000) is allowed to call this API. Without this, the browser's
// same-origin policy would block the frontend's fetch() calls.
//
// This is the Go equivalent of Spring's CorsFilter/@CrossOrigin, or Express's
// cors() middleware, hand-written using the "middleware" pattern: a function
// that takes a handler and returns a new handler wrapping it.
func WithCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// "*" is fine here because this API takes no cookies/credentials -
		// every request is a plain, credential-less JSON call. Restrict this
		// to a specific origin (e.g. "http://localhost:5173") if that changes.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Browsers send a preflight OPTIONS request before the real POST to
		// ask "are you going to allow this?". We just answer "yes" with an
		// empty 204 response and stop - there's no real handler for OPTIONS.
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
