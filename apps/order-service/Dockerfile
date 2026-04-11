# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/order-service/package*.json ./apps/order-service/
RUN npm install --workspace=packages/shared --workspace=apps/order-service
COPY packages/shared ./packages/shared
COPY apps/order-service ./apps/order-service
RUN npm run build --workspace=packages/shared
RUN npx --prefix apps/order-service prisma generate
RUN npm run build --workspace=apps/order-service

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/order-service/dist ./apps/order-service/dist
COPY --from=builder /app/apps/order-service/package.json ./apps/order-service/
COPY --from=builder /app/apps/order-service/prisma ./apps/order-service/prisma
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/apps/order-service
ENV NODE_ENV=production
EXPOSE 3002
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/order-service/package*.json ./apps/order-service/
RUN npm install --workspace=packages/shared --workspace=apps/order-service
COPY packages/shared ./packages/shared
COPY apps/order-service ./apps/order-service
RUN npx --prefix apps/order-service prisma generate
WORKDIR /app/apps/order-service
ENV NODE_ENV=development
EXPOSE 3002
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
