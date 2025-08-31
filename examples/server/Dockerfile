FROM golang:1.21.8-alpine

WORKDIR /app

# Install git for dependency fetching
RUN apk add --no-cache git

# Copy go.mod and go.sum first to leverage Docker cache
COPY go.mod go.sum* ./
RUN go mod download

# Copy the rest of the code
COPY . .

# Build the server application
RUN go build -o lsat-server ./examples/server/server.go

# Expose the port the server runs on (assuming 8080)
EXPOSE 8080

# Command to run the server
CMD ["./lsat-server"]
