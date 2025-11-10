# ---- base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- deps ----
FROM base AS deps
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN apk add --no-cache python3 build-base \
  && npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# ---- build ----
FROM deps AS build
COPY tsconfig.json .
COPY src ./src
COPY migrations ./migrations
RUN npm run build

# ---- prod ----
FROM node:20-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations
COPY package.json ./
COPY jest.integration.config.js ./
EXPOSE 3000
CMD ["node", "dist/index.js"]