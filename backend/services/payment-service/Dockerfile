FROM node:20-alpine

WORKDIR /usr/src/app

# Install pnpm or fallback to npm if pnpm is not used (Delivo uses npm workspaces as seen in root package.json, wait no, it uses npm workspaces but root has package-lock.json)
# Copy root package files
COPY package.json package-lock.json ./

# Copy the shared package and the specific service
COPY backend/packages/shared ./backend/packages/shared
COPY backend/services/payment-service ./backend/services/payment-service

# Install dependencies for workspaces
RUN npm install

# Build shared package first
WORKDIR /usr/src/app/backend/packages/shared
RUN npm run build || tsc || echo "No build script in shared"

# Build payment service
WORKDIR /usr/src/app/backend/services/payment-service
RUN npm run build || tsc

EXPOSE 3004

CMD ["npm", "start"]
