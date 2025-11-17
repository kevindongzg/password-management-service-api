# Password Management Service API
Repository URL: https://github.com/kevindongzg/password-management-service-api

## Documents
- [Local Run & Tests Guide](docs/local-run-and-tests.md)
- [Database Migrations & Schema](docs/db-migrations-and-schema.md)
- [Security, Error Handling & Logging](docs/security-error-logging-correlation-id.md)
- [Project Structure, Environment & API](docs/project-structure-env-api.md)

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
- Decorator-based controllers auto-loaded from `src/controllers`
- Password reset flow: Initiate + Execute endpoints with TTL and single-use

## Running Locally (no Docker)
1. Install dependencies: `npm install`
2. Generate Prisma client: `npx prisma generate`
2. Start DB (Docker): `docker-compose up -d db`
3. DB migration up:`npm run migrate:up:local`
4. Start service with local: `npm run local` (exposes `3000`)

Build: `npm run build`

## Docker Running Locally
- Build service image: `npm run docker:build` or `docker-compose build`
- Start service with containers: `npm run docker:up` or `docker-compose up -d` (exposes `3000`)
- Stop service with containers: `npm run docker:down` or `docker-compose down`

## Tests
- Unit tests: `npm run test:unit`
- Integration tests:
  - Local env integration tests: `npm run test:integration` (__need service started with local or containers__)
  - Containerized integration tests: `npm run docker:integration`
