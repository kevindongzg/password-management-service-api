# Password Management Service API

## Tech Stack
- Runtime: Node.js (>= 18)
- Framework: Koa
- Language: TypeScript
- Database: PostgreSQL
- Testing: Jest + Supertest

## Features
- Koa application with essential middleware (helmet, cors, bodyparser, compress)
- PostgreSQL connection pool with health check
- Jest unit testing with `supertest`
- Dockerfile with multi-stage build
- Docker Compose for app + Postgres

## Running Locally
1. Start DB (Docker): `docker-compose up -d db`
2. Setup:
    - Install dependencies: `npm install`
    - DB migration up:`npm run migrate:up:local`
3. Start Dev server: `npm run dev` (exposes `3000`)
- Build: `npm run build`
- Tests: 
  - Unit tests: `npm run test:unit` 
  - Integration tests: `npm run test:integration` (need dev server started)

## Docker running locally
- Build service image: `npm run docker:build`
- Start service with containers: `npm run docker:up` (exposes `3000`)
- Stop service with containers: `npm run docker:down`
- Containerized integration tests: `npm run docker:test`

## API
- Base URL: `http://localhost:3000/api/v1`
- Endpoints:
  - `GET /health` – service health check

## Database Schema
- Managed via migrations (`migrations/`). Use `npm run migrate:up` to apply.

## Security
- Basic hardening via `helmet`, CORS, and input parsing.

## Error Handling
- Application-level error middleware returns JSON:
  - `{ "error": string, "status": number, "timestamp": ISOString, "path": string }`
- Endpoint-level errors return concise messages with appropriate HTTP status codes.

## Logging
- Structured logging with `winston`.
- Logs include: request method, URL, status, duration, and for reset endpoints minimal identifiers (email) without sensitive content.

## Unit Tests
- `src/__tests__/unit/health.test.ts` – health endpoint.

## Project Structure
- `src/app.ts` – Koa app setup and middleware
- `src/index.ts` – server bootstrap and DB initialization
- `src/config/database.ts` – PostgreSQL pool configuration
- `src/routes/index.ts` – API routes (health endpoint)
- `src/__tests__/unit/health.test.ts` – unit test for health endpoint
- `src/__tests__/integration/health.http.e2e.test.ts` – E2E test hitting real app
- `Dockerfile` – production image build
- `docker-compose.yml` – local app + db
- `docker-compose.test.yml` – containerized test runner hitting real app

## Environment Variables
Use `.env.local` for local development. The application will load env files in priority order: `.env.local` → `.env` → process environment.
Docker Compose sets environment variables via service configuration; `.env.local` is not required inside containers.

## API
- Health check: `GET /api/v1/health`