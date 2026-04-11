# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/user-service/package*.json ./apps/user-service/
RUN npm install --workspace=packages/shared --workspace=apps/user-service
COPY packages/shared ./packages/shared
COPY apps/user-service ./apps/user-service
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/user-service

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/user-service/dist ./apps/user-service/dist
COPY --from=builder /app/apps/user-service/package.json ./apps/user-service/
COPY --from=builder /app/node_modules ./node_modules
WORKDIR /app/apps/user-service
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/user-service/package*.json ./apps/user-service/
RUN npm install --workspace=packages/shared --workspace=apps/user-service
COPY packages/shared ./packages/shared
COPY apps/user-service ./apps/user-service
WORKDIR /app/apps/user-service
ENV NODE_ENV=development
EXPOSE 3001
CMD ["npm", "run", "dev"]
