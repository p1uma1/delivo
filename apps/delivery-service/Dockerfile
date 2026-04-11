# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/delivery-service/package*.json ./apps/delivery-service/
RUN npm install --workspace=packages/shared --workspace=apps/delivery-service
COPY packages/shared ./packages/shared
COPY apps/delivery-service ./apps/delivery-service
RUN npm run build --workspace=packages/shared
RUN npx --prefix apps/delivery-service prisma generate
RUN npm run build --workspace=apps/delivery-service

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/delivery-service/dist ./apps/delivery-service/dist
COPY --from=builder /app/apps/delivery-service/package.json ./apps/delivery-service/
COPY --from=builder /app/apps/delivery-service/prisma ./apps/delivery-service/prisma
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/apps/delivery-service
ENV NODE_ENV=production
EXPOSE 3003
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/delivery-service/package*.json ./apps/delivery-service/
RUN npm install --workspace=packages/shared --workspace=apps/delivery-service
COPY packages/shared ./packages/shared
COPY apps/delivery-service ./apps/delivery-service
RUN npx --prefix apps/delivery-service prisma generate
WORKDIR /app/apps/delivery-service
ENV NODE_ENV=development
EXPOSE 3003
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
