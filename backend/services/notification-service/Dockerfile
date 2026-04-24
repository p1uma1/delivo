# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/notification-service/package*.json ./backend/services/notification-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/notification-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/notification-service ./backend/services/notification-service
RUN npm run build --workspace=backend/packages/shared
RUN npm run build --workspace=backend/services/notification-service

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/backend/packages/shared/dist ./backend/packages/shared/dist
COPY --from=builder /app/backend/packages/shared/package.json ./backend/packages/shared/
COPY --from=builder /app/backend/services/notification-service/dist ./backend/services/notification-service/dist
COPY --from=builder /app/backend/services/notification-service/package.json ./backend/services/notification-service/
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/backend/services/notification-service
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/notification-service/package*.json ./backend/services/notification-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/notification-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/notification-service ./backend/services/notification-service
RUN npm run build --workspace=backend/packages/shared
WORKDIR /app/backend/services/notification-service
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
