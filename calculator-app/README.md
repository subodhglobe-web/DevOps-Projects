# Calculator App

A full-stack calculator: a React + TypeScript frontend talking to a Go REST API backend. Built as a learning/assignment project, with an emphasis on simple, idiomatic, well-tested code over frameworks or cleverness.

## Project Overview

The app exposes a single calculation endpoint on the backend and a small form-based UI on the frontend. You pick an operation, enter one or two numbers, and get a result — with both client-side and server-side validation, and clear error messages for things like division by zero.

## Tech Stack

**Backend**
- Go (standard library only — `net/http`, `encoding/json`, `math`; no web framework)
- Go's built-in `testing` package for unit and HTTP handler tests

**Frontend**
- React 18 + TypeScript
- Vite (build tool / dev server)
- Plain CSS (no UI framework)
- Vitest + React Testing Library + `user-event` for tests

## Features

- Six operations: `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`
- Strict request validation (see [Validation Rules](#validation-rules) below)
- Division-by-zero and negative-square-root protection on both frontend and backend
- Clear JSON error responses, e.g. `{"error": "division by zero"}`
- `GET /health` liveness endpoint
- CORS enabled for local frontend development
- Accessible, responsive form UI with loading and error states
- Unit tests for calculator logic, HTTP handlers, and the React component
- Docker Compose support for running the full stack locally

## Project Structure

```
calculator-app/
├── PROMPTS.md                          # AI prompts used to build this project
├── README.md
├── backend/
│   ├── go.mod                          # module: calculator-app/backend
│   ├── cmd/
│   │   └── server/
│   │       └── main.go                 # entry point, starts the HTTP server
│   └── internal/
│       ├── calculator/
│       │   ├── calculator.go           # pure math logic (add, subtract, ..., sqrt)
│       │   └── calculator_test.go
│       └── api/
│           ├── handler.go              # POST /api/calculate, GET /health
│           ├── cors.go                 # CORS middleware
│           └── handler_test.go
└── frontend/
    ├── .env                            # VITE_API_BASE_URL=http://localhost:8080
    ├── index.html
    ├── vite.config.ts                  # includes Vitest test config
    ├── tsconfig.json
    └── src/
        ├── main.tsx                    # React entry point
        ├── App.tsx / App.css
        ├── style.css                   # global styles/theme variables
        ├── setupTests.ts               # Vitest + jest-dom + RTL cleanup setup
        ├── components/
        │   ├── Calculator.tsx          # the calculator form/UI
        │   ├── Calculator.css
        │   └── Calculator.test.tsx
        └── services/
            └── calculatorApi.ts        # typed fetch client for the backend
```

## Backend Setup

Requires Go (see `backend/go.mod` for the minimum version).

```bash
cd backend
go run ./cmd/server
```

The server starts on `http://localhost:8080`.

## Frontend Setup

Requires Node.js and npm.

Create a local environment file from the example:

```bash
cp frontend/.env.example frontend/.env
```

Then install dependencies and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL (normally `http://localhost:5173`). The frontend reads the backend's URL from `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

Make sure the backend is running first — the frontend has no built-in retry/mocking and will simply show a connection error otherwise.

## Running with Docker

Requires Docker Desktop or Docker Engine with Docker Compose.

From the repository root:

```bash
docker compose up --build
```

Open the frontend at:
```bash
http://localhost:3000
```

The backend is also available directly at:
```bash
http://localhost:8080
```

Test the API through the frontend/Nginx proxy:
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "add", "a": 10, "b": 5}'
```

Expected response:
```bash
{ "result": 15 }
```

To stop the containers:

```bash
docker compose down
```
## Running Tests

**Backend**

```bash
cd backend
go test ./...          # run all tests
go test ./... -v       # verbose output
```

**Frontend**

```bash
cd frontend
npm run test           # runs Vitest in watch mode
npx vitest run         # runs once and exits (e.g. for CI)
```

## Checking Coverage

**Backend**

```bash
cd backend
go test ./... -cover                              # quick per-package summary
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out                  # per-function breakdown
go tool cover -html=coverage.out                  # opens an HTML report in the browser
```

**Frontend**

```bash
cd frontend
npm run test:coverage
```

This prints a table (statements/branches/functions/lines) and writes a full HTML report to `frontend/coverage/index.html`.

## REST API Documentation

Base URL: `http://localhost:8080`

### `GET /health`

Liveness check.

**Response — `200 OK`**
```json
{ "status": "ok" }
```

### `POST /api/calculate`

**Request body**
```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

| Field       | Type   | Required                                             |
|-------------|--------|-------------------------------------------------------|
| `operation` | string | Always. One of: `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt` |
| `a`         | number | Always                                                |
| `b`         | number | For `add`, `subtract`, `multiply`, `divide`, `power`. Must be **omitted** for `sqrt`. |

**Success response — `200 OK`**
```json
{ "result": 15 }
```

**Error response — `400 Bad Request`**
```json
{ "error": "division by zero" }
```

#### Validation Rules

All failures return `400 Bad Request` with `{"error": "<message>"}`. `GET`/`POST` on the wrong route or method returns `405 Method Not Allowed`.

| Rule | Example message |
|---|---|
| Malformed JSON body | `invalid JSON in request body` |
| Operand is not a JSON number (e.g. a string) | `"a" must be a number` |
| Missing or empty `operation` | `"operation" is required` |
| Unsupported operation | `unsupported operation: "modulo"` |
| Missing `a` | `"a" is required` |
| Missing `b` for a binary operation | `"b" is required` |
| `b` provided for `sqrt` (unary operation) | `operand b is not allowed for sqrt` |
| Division by zero | `division by zero` |
| Square root of a negative number | `cannot take the square root of a negative number` |

Integers and decimals are both accepted (everything is parsed as `float64`); `0` is a valid operand everywhere except as the divisor.

## Example curl Requests

**Add**
```bash
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "add", "a": 10, "b": 5}'
# {"result":15}
```

**Divide**
```bash
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "divide", "a": 10, "b": 2}'
# {"result":5}
```

**Division by zero**
```bash
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "divide", "a": 10, "b": 0}'
# {"error":"division by zero"}
```

**Square root**
```bash
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "sqrt", "a": 25}'
# {"result":5}
```

## Design Decisions and Assumptions

- **No frameworks on the backend.** Only the Go standard library is used (`net/http`, `encoding/json`, `math`), per the assignment's Go-focused requirement and to keep the code small enough to explain line-by-line in an interview.
- **`*float64` (pointer) fields for `a`/`b` in the request struct.** A missing JSON field decodes to `nil`, while an explicit `0` decodes to a pointer to `0.0`. This is what lets the API tell "operand not provided" apart from "operand is zero" — needed since `0` is a valid operand for everything except the divisor.
- **`sqrt` strictly rejects an unexpected `b`.** Rather than silently ignoring an extra `b` sent alongside `sqrt`, the API returns a `400` — this surfaces a likely client-side mistake instead of masking it.
- **CORS allows any origin (`*`).** The API takes no cookies/credentials, so a wildcard origin is safe and simplest for local development. This should be locked down to a specific origin before any real deployment.
- **Client-side validation mirrors, but does not replace, backend validation.** The React form validates required fields, numeric input, division by zero, and negative square roots before ever calling the API, purely for snappier UX. Every rule is still enforced independently by the Go backend, which remains the single source of truth.
- **No CSS framework.** Styling is hand-written, per-component plain CSS, to keep the dependency list small and every style rule easy to read and explain.
- **All numbers are `float64`** on both ends, so integers and decimals are handled uniformly with no separate integer code path.
- **Docker setup.** Docker Compose runs the Go backend and the React frontend together. The frontend is served by Nginx, which proxies `/api` requests to the backend container.

## AI-Assisted Development

This project was built with AI pair-programming assistance (Cursor). The full sequence of prompts used — covering project planning, backend implementation, validation refinements, frontend implementation, test setup, and this README — is recorded in [`PROMPTS.md`](./PROMPTS.md) at the repository root.
