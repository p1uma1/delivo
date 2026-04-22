# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/api-gateway/package*.json ./backend/api-gateway/
RUN npm install --workspace=backend/packages/shared --workspace=backend/api-gateway
COPY backend/packages/shared ./backend/packages/shared
COPY backend/api-gateway ./backend/api-gateway
RUN npm run build --workspace=backend/packages/shared
RUN npm run build --workspace=backend/api-gateway

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/backend/packages/shared/dist ./backend/packages/shared/dist
COPY --from=builder /app/backend/packages/shared/package.json ./backend/packages/shared/
COPY --from=builder /app/backend/api-gateway/dist ./backend/api-gateway/dist
COPY --from=builder /app/backend/api-gateway/package.json ./backend/api-gateway/
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/backend/api-gateway
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/api-gateway/package*.json ./backend/api-gateway/
RUN npm install --workspace=backend/packages/shared --workspace=backend/api-gateway
COPY backend/packages/shared ./backend/packages/shared
COPY backend/api-gateway ./backend/api-gateway
WORKDIR /app/backend/api-gateway
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]
