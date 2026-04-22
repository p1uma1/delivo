# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/delivery-service/package*.json ./backend/services/delivery-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/delivery-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/delivery-service ./backend/services/delivery-service
RUN npm run build --workspace=backend/packages/shared
RUN npm run build --workspace=backend/services/delivery-service

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/backend/packages/shared/dist ./backend/packages/shared/dist
COPY --from=builder /app/backend/packages/shared/package.json ./backend/packages/shared/
COPY --from=builder /app/backend/services/delivery-service/dist ./backend/services/delivery-service/dist
COPY --from=builder /app/backend/services/delivery-service/package.json ./backend/services/delivery-service/
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/backend/services/delivery-service
ENV NODE_ENV=production
EXPOSE 3003
CMD ["node", "dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/delivery-service/package*.json ./backend/services/delivery-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/delivery-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/delivery-service ./backend/services/delivery-service
WORKDIR /app/backend/services/delivery-service
ENV NODE_ENV=development
EXPOSE 3003
CMD ["npm", "run", "dev"]
