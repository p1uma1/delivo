# Delivo — Delivery Platform

A delivery management system for small and medium businesses.

---

## Architecture Overview

```
                            ┌─────────────────┐
                            │   Web Frontend  │  :5173
                            │  (Vite + React) │
                            └────────┬────────┘
                                     │  /api/* (Vite proxy)
                            ┌────────▼────────┐
                            │   API Gateway   │  :3000
                            │  JWT validation │
                            │   + proxying    │
                            └────────┬────────┘
          ┌──────────┬───────────────┼───────────────┬──────────┐
          │          │               │               │          │
 ┌────────▼───┐ ┌────▼─────┐ ┌──────▼─────┐ ┌──────▼───┐ ┌────▼──────┐
 │    User    │ │  Order   │ │  Delivery  │ │ Product  │ │   Cart    │
 │  Service   │ │ Service  │ │  Service   │ │ Service  │ │  Service  │
 │   :3001    │ │  :3002   │ │   :3003    │ │  :3004   │ │   :3005   │
 └────────────┘ └────┬─────┘ └──────┬─────┘ └──────────┘ └───────────┘
                     │              │
                     └──────┬───────┘  Events via RabbitMQ
                     ┌──────▼──────────────┐
                     │   Notification      │
                     │   Service  :3006    │  RabbitMQ subscriber
                     │   (Socket.io)       │  + Socket.io push
                     └─────────────────────┘
```

---

## Services

| Service | Path | Port | Description |
|---|---|---|---|
| **Web App** | `apps/web` | 5173 | Vite + React frontend (Customer, Merchant, Rider, Admin dashboards) |
| **API Gateway** | `backend/api-gateway` | 3000 | JWT pre-validation, request proxying |
| **User Service** | `backend/services/user-service` | 3001 | Auth, registration, profiles, roles |
| **Order Service** | `backend/services/order-service` | 3002 | Create & manage delivery orders |
| **Delivery Service** | `backend/services/delivery-service` | 3003 | Rider offers, assignment, status tracking |
| **Product Service** | `backend/services/product-service` | 3004 | Product & merchant catalogue |
| **Cart Service** | `backend/services/cart-service` | 3005 | Shopping cart management |
| **Notification Service** | `backend/services/notification-service` | 3006 | RabbitMQ subscriber + Socket.io real-time alerts |
| **RabbitMQ** | — | 5672 / 15672 | Message broker (Management UI on 15672) |

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed & running
- [Node.js 20+](https://nodejs.org/) (only needed for local dev outside Docker)

### 1. Clone & configure
```bash
git clone <repo-url>
cd delivo
cp .env.example .env
# Fill in your DATABASE_URL, JWT secrets, and Google Client ID
```

### 2. Run everything with Docker
```bash
# Development mode — hot-reload via volume mounts
npm run dev

# Production mode
npm run up

# Stop all containers
npm run down

# Stop and remove volumes (clears RabbitMQ data)
npm run down:volumes

# Stream logs from all containers
npm run logs
```

### 3. Verify services are up
| URL | What |
|---|---|
| http://localhost:5173 | Web App |
| http://localhost:3000/health | API Gateway |
| http://localhost:15672 | RabbitMQ Management UI (`guest` / `guest`) |

---

## Project Structure

```
delivo/
├── apps/
│   └── web/                  # Vite + React frontend
│       ├── src/app/modules/  # customer / merchant / rider / admin
│       └── Dockerfile
├── backend/
│   ├── api-gateway/          # Express reverse proxy
│   ├── packages/
│   │   └── shared/           # @delivo/shared — JWT, RabbitMQ, errors, logger
│   └── services/
│       ├── user-service/
│       ├── order-service/
│       ├── delivery-service/
│       ├── product-service/
│       ├── cart-service/
│       ├── notification-service/
│       └── admin-service/
├── docs/
│   └── context.md            # Canonical data model & business rules
├── infra/
│   └── postgres/init.sql     # Database schema bootstrap
├── .env                      # Single source of truth for all env vars
├── .env.example              # Template — copy to .env to get started
├── docker-compose.yml        # Production service definitions
└── docker-compose.override.yml  # Dev overrides (hot-reload mounts)
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript |
| **Backend** | Node.js 20, Express.js, TypeScript |
| **Shared Lib** | `@delivo/shared` — JWT helpers, RabbitMQ client, error classes, logger |
| **Database** | PostgreSQL (hosted on Supabase for dev) |
| **Message Broker** | RabbitMQ 3.13 (topic exchange `delivo.events`) |
| **Real-time** | Socket.io (notification-service) |
| **Containers** | Docker + Docker Compose |
| **Auth** | JWT (access + refresh tokens), Google OAuth |

---

## User Roles

| Role | Access |
|---|---|
| `customer` | Browse products, place orders, track deliveries |
| `merchant` | Manage products, view incoming orders |
| `rider` | Browse pending orders, submit delivery fee offers, track assignments |
| `admin` | Platform-wide dashboard, user management |

---

## Event Bus

All inter-service communication happens via RabbitMQ on the `delivo.events` topic exchange.

| Event | Publisher | Subscribers |
|---|---|---|
| `order.created` | order-service | delivery-service, notification-service |
| `order.cancelled` | order-service | delivery-service |
| `delivery.assigned` | delivery-service | notification-service |
| `delivery.status.updated` | delivery-service | notification-service |

---

## Adding a New Service

1. **Create the folder** under `backend/services/your-service/`
2. **Copy** `package.json`, `tsconfig.json`, and `Dockerfile` from `order-service` and update names
3. **Add to `docker-compose.yml`** — set `build.context: .`, `dockerfile: backend/services/your-service/Dockerfile`, and `env_file: .env`
4. **Add a dev override** in `docker-compose.override.yml` with volume mounts for hot-reload
5. **Register the route** in `backend/api-gateway/src/index.ts`
