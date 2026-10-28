# ---- Build stage ----
# Compiles the server binary. This stage has the full Go toolchain, but
# nothing from it ends up in the final image except the compiled binary.
FROM golang:1.26-alpine AS build
WORKDIR /app

# Copy just go.mod first so this download step is cached by Docker and only
# re-runs when dependencies actually change, not on every source edit.
COPY go.mod ./
RUN go mod download

COPY . .

# CGO_ENABLED=0 produces a fully static binary with no glibc dependency, so
# it can run unmodified on the minimal runtime image below.
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/server ./cmd/server

# ---- Runtime stage ----
# Alpine instead of "scratch" so the image still has a shell and basic tools
# for debugging (docker exec), while staying only a few MB larger.
FROM alpine:3.22
WORKDIR /app

COPY --from=build /out/server ./server

EXPOSE 8080
ENTRYPOINT ["./server"]
