# ===== Builder =====
FROM golang:alpine AS builder
WORKDIR /app

COPY ./docker/main/go.mod ./docker/main/go.sum ./
RUN go mod download

COPY ./docker/main .
RUN go build -o server main.go

# ===== Runtime =====
FROM alpine:latest

WORKDIR /app
RUN apk add --no-cache bash curl dcron mariadb-client git

# Copy binary
COPY --from=builder /app/server .

# Copy src 
COPY ./src/templates /app/templates
COPY ./src/static /app/static 

# Copy .git
COPY ./.git /app/.git

# Copy scripts
COPY ./docker/main/scripts/status-check.sh /app/status-check.sh
COPY ./docker/main/scripts/cronjob /etc/crontabs/root
RUN chmod +x /app/status-check.sh

# Start all
COPY ./docker/main/scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]

