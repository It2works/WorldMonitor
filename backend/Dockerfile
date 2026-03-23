# Build stage
FROM node:20-alpine AS builder

# Install build dependencies for better-sqlite3
RUN apk add --no-cache \
    build-base \
    g++ \
    make \
    python3

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src

# Runner stage
FROM node:20-alpine
WORKDIR /app

# Copy built node_modules and src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

RUN mkdir -p /app/data

EXPOSE 3001
ENV PORT=3001
ENV DATABASE_PATH=/app/data/worldmonitor.db

CMD ["node", "src/server.js"]
