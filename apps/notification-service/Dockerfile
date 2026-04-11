# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/notification-service/package*.json ./apps/notification-service/
RUN npm install --workspace=packages/shared --workspace=apps/notification-service
COPY packages/shared ./packages/shared
COPY apps/notification-service ./apps/notification-service
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/notification-service

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/notification-service/dist ./apps/notification-service/dist
COPY --from=builder /app/apps/notification-service/package.json ./apps/notification-service/
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/apps/notification-service
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/notification-service/package*.json ./apps/notification-service/
RUN npm install --workspace=packages/shared --workspace=apps/notification-service
COPY packages/shared ./packages/shared
COPY apps/notification-service ./apps/notification-service
WORKDIR /app/apps/notification-service
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
