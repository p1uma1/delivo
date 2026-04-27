# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/product-service/package*.json ./backend/services/product-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/product-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/product-service ./backend/services/product-service
WORKDIR /app/backend/services/product-service
ENV NODE_ENV=production
EXPOSE 3004
CMD ["node", "src/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY backend/packages/shared/package*.json ./backend/packages/shared/
COPY backend/services/product-service/package*.json ./backend/services/product-service/
RUN npm install --workspace=backend/packages/shared --workspace=backend/services/product-service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/product-service ./backend/services/product-service
WORKDIR /app/backend/services/product-service
ENV NODE_ENV=development
EXPOSE 3004
CMD ["npm", "run", "dev"]
