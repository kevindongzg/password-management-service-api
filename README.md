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
- Decorator-based controllers auto-loaded from `src/controllers`
- Password reset flow: Initiate + Execute endpoints with TTL and single-use

## Running Locally
1. Install dependencies: `npm install`
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
  - Containerized integration tests: `npm run docker:test`

## DB migration
- DB migration create: `npm run migrate:create <name>`
- Update DB schema in created migration scripts.
- DB migration up: `npm run migrate:up:local`
- DB migration down: `npm run migrate:down:local`
 
Seed users (development/testing): a migration `migrations/*_seed-users.js` inserts example users (`user1@example.com`, `user2@example.com`). This runs as part of normal `up` and is reversible via `down`.

## Database Schema
- Managed via migrations (`migrations/`).

## Security
- Basic hardening via `helmet`, CORS, and input parsing.
- Password hashing: `bcrypt` with configurable rounds (`BCRYPT_ROUNDS`, default 12)
- Reset requests: valid for 30 minutes (`expires_at`), single-use (`used_at` set on success)
- Only one active reset request per identity at a time
- Email validation via `validator.isEmail`

## Error Handling
- Application-level error middleware returns JSON:
  - `{ "error": string, "status": number, "timestamp": ISOString, "path": string }`
- Endpoint-level errors return concise messages with appropriate HTTP status codes.

## Logging
- Structured logging with `winston`.
- Logs include: request method, URL, status, duration, and for reset endpoints minimal identifiers (email) without sensitive content.

## Project Structure
- `src/app.ts` – Koa app setup, middleware, and decorator route init (`Route`)
- `src/framework/decorator.ts` – decorators (`@controller`, `@get`...) and auto-scan
- `src/controllers/health.ts` – health controller using decorators
- `src/controllers/passwordReset.ts` – password reset controller (`/password-reset/initiate`, `/password-reset/execute`)
- `src/index.ts` – server bootstrap and DB initialization
- `src/config/database.ts` – PostgreSQL pool configuration
- `src/__tests__/unit/health.test.ts` – unit test for health endpoint
- `src/__tests__/integration/health.http.e2e.test.ts` – E2E test hitting real app
- `Dockerfile` – production image build
- `docker-compose.yml` – local app + db
- `docker-compose.test.yml` – containerized test runner hitting real app

## Environment Variables
Use `.env.local` for local development. The application will load env files in priority order: `.env.local` → `.env` → process environment.
Docker Compose sets environment variables via service configuration; `.env.local` is not required inside containers.

## API
- Local Base URL: `http://localhost:3000/api/v1`
- Endpoints:
  - `GET /health` – service health check
  - `POST /password-reset/initiate` – initiate reset flow
    - Request:
      ```json
      {
        "email": "user1@example.com"
      }
      ```
    - Response:
      ```json
      {
        "resetId": "7b6a1c9d-1234-5678-9abc-def012345678",
        "code": "123456",
        "expiresAt": "2025-11-11T10:30:00.000Z"
      }
      ```
  - `POST /password-reset/execute` – complete reset flow
    - Request:
      ```json
      {
        "email": "user@example.com",
        "code": "123456",
        "newPassword": "NewPass123!"
      }
      ```
    - Response:
      ```json
      {
        "message": "Password updated successfully"
      }
      ```
  - Error response (uniform):
    ```json
    {
      "error": "Invalid email",
      "status": 400,
      "timestamp": "2025-11-11T10:00:00.000Z",
      "path": "/api/v1/password-reset/initiate"
    }
    ```

Note: For this exercise, reset code is returned directly in the initiate response to simplify validation (real-world systems typically deliver via email or SMS).

## Postman Collection
- Import the collection file:
  - `postman/password-reset.postman_collection.json`
- Variables
  - `baseUrl` (collection variable) defaults to `http://localhost:3000/api/v1`
  - `code` and `resetId` are automatically captured from the initiate response for use in execute.
- Usage
  1. Run "Initiate Password Reset"; verify response; variables `code`/`resetId` will be set.
  2. Run "Execute Password Reset"; it will use `{{code}}` from the collection variables and return success message.

## VCS (Git)
- This project includes a local Git repository. To submit publicly:
  - Create a new repo on GitHub/GitLab.
  - Add remote: `git remote add origin <repo_url>`
  - Push: `git push -u origin main` (or the branch you use)
  - Share the repository link.