# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/payment-service/package*.json ./backend/services/payment-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/payment-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/payment-service ./backend/services/payment-service
RUN npm run build --workspace=backend/packages/shared
RUN npm run build --workspace=backend/services/payment-service

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/backend/packages/shared/dist ./backend/packages/shared/dist
COPY --from=builder /app/backend/packages/shared/package.json ./backend/packages/shared/
COPY --from=builder /app/backend/services/payment-service/dist ./backend/services/payment-service/dist
COPY --from=builder /app/backend/services/payment-service/package.json ./backend/services/payment-service/
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/backend/services/payment-service
ENV NODE_ENV=production
EXPOSE 3004
CMD ["node", "dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/payment-service/package*.json ./backend/services/payment-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/payment-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/payment-service ./backend/services/payment-service
RUN npm run build --workspace=backend/packages/shared
WORKDIR /app/backend/services/payment-service
ENV NODE_ENV=development
EXPOSE 3004
CMD ["npm", "run", "dev"]
