# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/admin-service/package*.json ./backend/services/admin-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/admin-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/admin-service ./backend/services/admin-service
RUN npm run build --workspace=backend/packages/shared
RUN npm run build --workspace=backend/services/admin-service

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/backend/packages/shared/dist ./backend/packages/shared/dist
COPY --from=builder /app/backend/packages/shared/package.json ./backend/packages/shared/
COPY --from=builder /app/backend/services/admin-service/dist ./backend/services/admin-service/dist
COPY --from=builder /app/backend/services/admin-service/package.json ./backend/services/admin-service/
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/backend/services/admin-service
ENV NODE_ENV=production
EXPOSE 3006
CMD ["node", "dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/admin-service/package*.json ./backend/services/admin-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/admin-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/admin-service ./backend/services/admin-service
RUN npm run build --workspace=backend/packages/shared
WORKDIR /app/backend/services/admin-service
ENV NODE_ENV=development
EXPOSE 3006
CMD ["npm", "run", "dev"]
