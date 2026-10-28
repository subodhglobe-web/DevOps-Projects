// Command server starts the calculator backend's HTTP server.
//
// In Java terms, this file is the equivalent of the class with `public static
// void main(String[] args)` in a Spring Boot app - except there's no
// framework doing classpath scanning or auto-configuration behind the
// scenes. Every route is registered explicitly, right here.
package main

import (
	"log"
	"net/http"

	"calculator-app/backend/internal/api"
)

func main() {
	// http.ServeMux is the standard library's router - the rough equivalent
	// of Spring's DispatcherServlet + @RequestMapping, but much smaller: it
	// just matches a URL path to a handler function.
	mux := http.NewServeMux()
	mux.HandleFunc("/api/calculate", api.CalculateHandler)
	mux.HandleFunc("/health", api.HealthHandler)

	// Wrap the whole mux with the CORS middleware so every route gets the
	// same cross-origin headers, instead of adding them one handler at a time.
	handler := api.WithCORS(mux)

	const addr = ":8080"
	log.Printf("calculator backend listening on http://localhost%s", addr)

	// http.ListenAndServe blocks forever (like a Java server's main thread
	// blocking on an accept loop) until the process is killed or an
	// unrecoverable error occurs.
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal(err)
	}
}
