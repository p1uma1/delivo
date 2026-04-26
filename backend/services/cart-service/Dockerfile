FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY backend/shared ./backend/shared
COPY backend/services/cart-service/package.json ./backend/services/cart-service/

# Install dependencies for all workspace modules if this is a monorepo, 
# or just run install. Assuming standard npm workspace structure from other Dockerfiles.
RUN npm install

COPY backend/services/cart-service ./backend/services/cart-service

WORKDIR /usr/src/app/backend/services/cart-service
RUN npm run build

CMD ["npm", "start"]
