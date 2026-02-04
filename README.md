# Production Node.js/Express.js Backend

This repository is a minimal production-grade reference built to help set up a Node.js/Express.js API featuring modular architecture and common production patterns like auth, RBAC, caching and rate limiting.

> **TLDR:** This is a cheatsheet to set up a backend in Node.js/Express.js.

## Tech Stack

- **Runtime:** Node.js + Express (TypeScript)
- **Database:** MongoDB
- **Caching:** Redis
- **Auth:** JWT
- **Infra:** Docker

### Quick Start

```bash
git clone <repo>
cd <repo>
docker-compose up --build
```

API runs at: `http://localhost:8000` by default

## Core Features

### Authentication

- Access & refresh tokens
- Refresh token rotation and revocation

### Role-Based Access Control (RBAC)

- User vs Admin access rules

### Public & Private Data Isolation

- Ownership-based access for private records

### Redis Caching

- Expensive aggregation cached with TTL

### Rate Limiting

- Redis-based, configurable per route

## Other Features

- Centralized error handling
- Structured logging
- Containerized for reliability and speed

## API Overview

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /public/record`
- `GET /private/record` (auth + role-based)
- `GET /public/expensive` (cached)

### Improvements

I’ll add anything I find recurring across multiple backends, or when I learn something new about the features already present.
