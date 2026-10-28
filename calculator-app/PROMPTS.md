# AI Prompts Used

This document lists the main prompts used while building the full-stack calculator application.

---

## 1. Project Planning

### Prompt

```txt
I need to build a full-stack calculator assignment.

I am a Java developer, but the backend should be implemented in Go because Go is preferred in the assignment. Please help me build this step by step.

Requirements:
- React TypeScript frontend using Vite
- Go backend using only the standard library
- REST API endpoint: POST /api/calculate
- Operations: add, subtract, multiply, divide
- Optional if simple: power and sqrt
- Validate input and handle division by zero
- Return JSON responses
- Unit tests for backend and frontend
- README with setup instructions, API examples, design decisions
- PROMPTS.md with prompts used

Please first create a simple project structure and then implement the backend in small, understandable steps. Keep the code simple enough that I can explain it in an interview.
```

---

## 2. Backend Implementation

### Prompt

```txt
I need to implement the backend for a full-stack calculator assignment. 

Context:
- I am a Java developer and new to Go.
- Please kepp the Go code simple, idiomatic, and easy to explain.
- Use only the Go standard library, no frameworks.

Requirements:
- Backend folder already exists.
- Go module is calculator-app/backend.
- Create this structure:
   cmd/server/main.go
   internal/calculator/calculator.go
   internal/calculator/calculator_test.go
   internal/api/handler.go
   internal/api/handler_test.go

API:
- POST /api/calculate
- Request JSON:
{
   "operation": "add",
   "a": 10,
   "b": 5
}
- "b" is required for add, subtract, multiply, divide, and power.
- For sqrt, only "a" is required.
- Success response:
{
   "result": 15
}
- Error response:
{
   "error": "division by zero"
}

Operations:
- add
- subtract
- multiply
- divide
- power
- sqrt

Validation:
- invalid JSON
- unsupported operation
- missing or empty operation
- missing required operand "a"
- missingrequired operand "b" for binary operations
- operands must be JSON numbers, not strings or other types
- allow both integers and decimals
- division by zero
- sqrt of negative number

Also:
- Add GET /heath endpoint
- Add simple CORS support for local React frontend
- Add unit tests for calculator logic
- Add HTTP handler tests

Please generate the files and explain the code in Java-developer-friendly terms.

```

---

## 3. Backend Validation Improvement

### Prompt

```txt
Please update the backend validation so unary operations like sqrt reject operand b if it is provided.

Expected behavior:
- {"operation":"sqrt","a":25} should return {"result":5}
- {"operation":"sqrt","a":25,"b":5} should return 400 with {"error":"operand b is not allowed for sqrt"}

Also add or update unit tests and HTTP handler tests for this behavior.
```

---

## 4. Go Code Explanation

### Prompt

```txt
Explain this Go backend code to me as a Java developer.

Focus on:
- package structure
- structs
- functions
- error handling
- JSON decoding and encoding
- HTTP handler behavior
- CORS handling
- how the tests work
```

---

## 5. Frontend Implementation

### Prompt

```txt
Create a React TypeScript API service for my calculator frontend.

Backend endpoint:
POST http://localhost:8080/api/calculate

Use the environment variable:
VITE_API_BASE_URL=http://localhost:8080

Request body:
{
  "operation": "add",
  "a": 10,
  "b": 5
}

For sqrt, do not send b:
{
  "operation": "sqrt",
  "a": 25
}

Success response:
{
  "result": 15
}

Error response:
{
  "error": "division by zero"
}

Requirements:
- Create src/services/calculatorApi.ts
- Export TypeScript types for operation, request, and response
- Export an async calculate function
- Throw a user-friendly Error when backend returns non-2xx response
- Keep code simple and readable
```

---

## 6. Frontend Test Setup

### Prompt

```txt
Set up frontend testing for this Vite React TypeScript app.

Use:
- Vitest
- React Testing Library
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom

Please:
- Update vite.config.ts with test configuration
- Create src/setupTests.ts
- Add test scripts to package.json:
  "test": "vitest"
  "test:coverage": "vitest run --coverage"

Keep the setup simple.
```

---

## 7. Frontend Tests

### Prompt

```txt
Add unit tests for the Calculator component.

Use:
- Vitest
- React Testing Library
- user-event

Test cases:
1. Renders calculator title, inputs, operation dropdown, and calculate button.
2. Shows validation error when first number is missing.
3. Shows validation error when second number is missing for a binary operation.
4. Shows validation error for division by zero.
5. For sqrt, hides or disables the second number input.
6. For sqrt, shows validation error for negative input.
7. Calls the API service with correct payload for addition.
8. Calls the API service with correct payload for sqrt without operand b.
9. Displays the result returned by the API.
10. Displays API error messages.

Mock the calculate function from src/services/calculatorApi.ts.
Keep tests readable and maintainable.
```

---

## 8. README Generation

### Prompt

```txt
Create a professional README.md for this full-stack calculator assignment.

Include:
- Project overview
- Tech stack
- Features
- Project structure
- Backend setup instructions
- Frontend setup instructions
- How to run tests
- How to check coverage
- REST API documentation
- Example curl requests for add, divide, division by zero, and sqrt
- Design decisions and assumptions
- Notes about AI prompts used, referencing PROMPTS.md

Keep it clear and concise.
```

---

## 9. Docker Implementation

### Prompt

```txt
Add Docker support for this full-stack calculator application.

Current project:
- backend: Go REST API
- frontend: React TypeScript Vite app
- backend endpoint: POST /api/calculate
- backend health endpoint: GET /health
- frontend calls the backend using src/services/calculatorApi.ts
- local backend runs on http://localhost:8080
- local frontend runs on http://localhost:5173

Requirements:
1. Add backend/Dockerfile
   - Use a multi-stage Go build
   - Build the Go server from ./cmd/server
   - Produce a small runtime image
   - Expose port 8080
   - Run the compiled backend binary

2. Add backend/.dockerignore
   - Exclude unnecessary files such as local binaries, test cache, etc.

3. Add frontend/Dockerfile
   - Use a multi-stage build
   - Build the React Vite app
   - Serve the built dist folder using Nginx
   - Expose port 80

4. Add frontend/nginx.conf
   - Serve the React app
   - Support client-side routing fallback to index.html
   - Proxy /api requests to the backend container at http://backend:8080
   - Proxy /health requests to the backend container at http://backend:8080

5. Add frontend/.dockerignore
   - Exclude node_modules, dist, coverage, etc.

6. Add root docker-compose.yml
   - Define backend service
   - Define frontend service
   - Build each service from its folder
   - Map backend port 8080:8080
   - Map frontend port 3000:80
   - Make frontend depend on backend

7. Update frontend API service if needed:
   - It should use VITE_API_BASE_URL when provided
   - Otherwise, it should use a relative path so Docker/Nginx can proxy /api requests

8. Keep the implementation simple and easy to explain.
9. Do not introduce unnecessary complexity.

After generating the files, explain how to run the full stack with Docker and how the Nginx proxy works.
```

---