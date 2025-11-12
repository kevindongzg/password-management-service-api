# Project Structure, Environment & API

## Project Structure
- `src/app.ts` – Koa app setup, middleware, and decorator route init (`Route`).
- `src/framework/decorator.ts` – decorators (`@controller`, `@get`...) and auto-scan.
- `src/controllers/health.ts` – health controller using decorators.
- `src/controllers/passwordReset.ts` – password reset controller (`/password-reset/initiate`, `/password-reset/execute`).
- `src/index.ts` – server bootstrap and DB initialization.
- `src/config/database.ts` – PostgreSQL pool configuration.
- `src/__tests__/unit/health.test.ts` – unit test for health endpoint.
- `src/__tests__/integration/health.http.e2e.test.ts` – E2E test hitting real app.
- `Dockerfile` – production image build.
- `docker-compose.yml` – local app + db.
- `docker-compose.test.yml` – containerized test runner hitting real app.

## Environment Variables
- Use `.env.local` for local development. The application loads env files in priority order: `.env.local` → `.env` → process environment.
- Docker Compose sets environment variables via service configuration; `.env.local` is not required inside containers.

## API
- Local Base URL: `http://localhost:3000/api/v1`.
- Endpoints:
  - `GET /health` – service health check.
  - `POST /password-reset/initiate` – initiate reset flow.
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
  - `POST /password-reset/execute` – complete reset flow.
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