# ---- base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libstdc++

# ---- deps ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund
RUN npx prisma generate

# ---- build ----
FROM deps AS build
COPY tsconfig.json .
COPY src ./src
COPY migrations ./migrations
RUN npm run build

# ---- prod ----
FROM base AS prod
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations
COPY package.json ./
COPY jest.integration.config.js ./
EXPOSE 3000
CMD ["node", "dist/index.js"]