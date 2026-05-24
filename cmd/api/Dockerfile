### Multi-stage Dockerfile for Go API
# Builds a static binary and runs it in a distroless non-root image

FROM golang:1.25 AS builder
WORKDIR /src

# Cache go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the repo and build the api binary
COPY . .
WORKDIR /src/cmd/api
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags "-s -w" -o /expenses-api

### Final image: distroless static (non-root)
FROM gcr.io/distroless/static:nonroot
COPY --from=builder /expenses-api /expenses-api

EXPOSE 8080
USER nonroot
ENTRYPOINT ["/expenses-api"]
