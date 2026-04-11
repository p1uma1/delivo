# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api-gateway/package*.json ./apps/api-gateway/
RUN npm install --workspace=packages/shared --workspace=apps/api-gateway
COPY packages/shared ./packages/shared
COPY apps/api-gateway ./apps/api-gateway
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/api-gateway

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/apps/api-gateway
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api-gateway/package*.json ./apps/api-gateway/
RUN npm install --workspace=packages/shared --workspace=apps/api-gateway
COPY packages/shared ./packages/shared
COPY apps/api-gateway ./apps/api-gateway
WORKDIR /app/apps/api-gateway
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]
