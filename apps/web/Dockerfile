# ─── Builder Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm install --workspace=apps/web
COPY apps/web ./apps/web

# VITE_* vars are baked into the bundle at build time.
# Pass via --build-arg in CI (docker build --build-arg VITE_API_URL=https://api.example.com ...)
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_NOTIFICATION_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_NOTIFICATION_SOCKET_URL=$VITE_NOTIFICATION_SOCKET_URL

RUN npm run build --workspace=apps/web

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ─── Development Stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm install --workspace=apps/web
COPY apps/web ./apps/web
WORKDIR /app/apps/web
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
