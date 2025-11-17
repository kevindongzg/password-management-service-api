# Local Run and Tests Guide

This guide covers two ways to run the application locally, how to validate with the Postman collection, and how to run unit and integration tests.

## Option 1: Run with Docker
- Prerequisites: `Docker` and `docker-compose` installed.
- Commands:
  - Build and start containers: `docker-compose build`, then `docker-compose up -d`
  - See: [Validate with Postman](#validate-with-postman)
  - Stop and clean up: `docker-compose down`
- Behavior:
  - Once started, the app listens on `http://localhost:3000/api/v1`
  - App and DB are orchestrated by `docker-compose.yml`; startup runs migrations and build.

## Option 2: Run with Local Node Environment
- Prerequisites:
  - Node.js `>= 18`
  - Local PostgreSQL, or start only the DB with `docker-compose`
- Recommended steps:
  - Install dependencies: `npm install`
  - Generate Prisma client: `npx prisma generate`
  - Start the database Docker: `docker-compose up -d db`
  - Run DB migrations: `npm run migrate:up:local`
  - Start the service: `npm run local`
  - See: [Validate with Postman](#validate-with-postman)
- Access after startup: `http://localhost:3000/api/v1`

## Validate with Postman
- Import the collection: [password-reset.postman_collection.json](../postman/password-reset.postman_collection.json)
- Collection variables:
  - `baseUrl` defaults to `http://localhost:3000/api/v1`
  - After initiating reset, `code` and `resetId` are captured automatically for the execute step
- Validation flow:
  - Run “Initiate Password Reset”; confirm response contains `resetId`, `code`, `expiresAt`
  - Then run “Execute Password Reset”; the collection uses `{{code}}` and returns the success message
- Check Postgresql DB data:
  - Get Postgresql DB connection informations in [.env.local](../.env.local)
  - DB table: `users` and `password_reset_requests`

## Run Tests
- Unit tests: `npm run test:unit`
- Integration tests (local environment): `npm run test:integration` (ensure the service is running)
- Integration tests (containerized): `npm run docker:integration` (uses `docker-compose.test.yml` to orchestrate and run tests, no need service is running before)

## Quick Checks
- Health check: `GET /api/v1/health` should return `{ status: "ok" }`
