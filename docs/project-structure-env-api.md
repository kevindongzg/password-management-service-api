# Project Structure, Environment & API

## Project Structure (folders)
- `src/controllers/` – API controllers.
- `src/services/` – business logic.
- `src/repositories/` – database access.
- `src/middleware/` – Koa middlewares.
- `src/config/` – configuration and DB connection.
- `src/utils/` – utilities (logger, validation, errors).
- `src/framework/` – decorators and route loader.
- `src/types/` – TypeScript types.
- `src/__tests__/unit/` – unit tests.
- `src/__tests__/integration/` – integration/E2E tests.
- Root: `Dockerfile`, `docker-compose.yml`, `docker-compose.test.yml`.

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
      "path": "/api/v1/password-reset/initiate",
      "correlationId": "31fbac2a-846b-4673-a60a-f3170c28850e"
    }
    ```

Note: For this exercise, reset code is returned directly in the initiate response to simplify validation (real-world systems typically deliver via email or SMS).