# Database Migrations & Schema

## DB Migration
- Start DB (Docker): `docker-compose up -d db`
- Create a migration: `npm run migrate:create <name>`
- Update DB schema in the created migration scripts.
- Migrate up (local): `npm run migrate:up:local`
    - Sync Prisma models: `npm run prisma:pull`.
    - Generate Prisma Client: `npm run prisma:generate`.
- Migrate down (local): `npm run migrate:down:local`
    - Sync Prisma models: `npm run prisma:pull`.
    - Generate Prisma Client: `npm run prisma:generate`.
- Seed users (development/testing): `migrations/*_seed-users.js` inserts example users (`user1@example.com`, `user2@example.com`) as part of normal `up` and is reversible via `down`.

## Database Schema
- Managed via migrations in the `migrations/` directory.