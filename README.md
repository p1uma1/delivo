# Delivo — Delivery Platform

A delivery management system for small and medium businesses.

---

## Architecture Overview

```
                            ┌─────────────────┐
                            │   Web Frontend  │  :5173
                            │   (Vite + React)│
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │   API Gateway   │  :3000
                            │  (Entry Point)  │
                            └────────┬────────┘
                                     │  JWT pre-validation + proxying
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
     ┌────────▼────────┐   ┌─────────▼───────┐   ┌─────────▼────────┐
     │  User Service   │   │  Order Service  │   │ Delivery Service │
     │     :3001       │   │     :3002       │   │     :3003        │
     └────────┬────────┘   └────────┬────────┘   └────────┬─────────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │  Events via RabbitMQ
                            ┌───────▼────────┐
                            │ Notification   │
                            │   Service      │  (no HTTP, event-only)
                            └────────────────┘
```

## Applications & Services

| App | Path | Port | Description |
|---|---|---|---|
| **Web App** | `apps/web` | 5173 | 
| **API Gateway** | `apps/api-gateway` | 3000 | Single entry point. Proxies to all services |
| **User Service** | `apps/user-service` | 3001 | Auth, user profiles, roles |
| **Order Service** | `apps/order-service` | 3002 | Create & manage delivery orders |
| **Delivery Service** | `apps/delivery-service` | 3003 | Assign riders, track status |
| **Notification Service** | `apps/notification-service` | — | Consumes events, sends alerts |

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed & running
- [Node.js 20+](https://nodejs.org/) (for local development outside Docker)

### 1. Clone & configure
```bash
git clone <repo-url>
cd delivo
cp .env.example .env
# Edit .env with your secrets (JWT secrets at minimum)
```

### 2. Start all services
```bash
# Production mode
npm run up

# Development mode (with hot-reload)
npm run dev
```

### 3. Verify
- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3000/health
- **RabbitMQ Dashboard:** http://localhost:15672 (guest/guest)

---

## Project Structure

```
delivo/
├── apps/
│   ├── web/             # Vite + React Frontend
│   ├── api-gateway/     # Entry point
│   ├── user-service/    # Auth & Users
│   ├── order-service/   # Orders
│   ├── delivery-service/# Deliveries
│   └── notification-service/ # Event-only Service
├── packages/
│   └── shared/          # @delivo/shared — Shared Logic
└── infra/
    └── postgres/
        └── init.sql     # Database initializations
```

---

## Technology Stack

- **Frontend:** React + Vite + TypeScript 
- **Backend Runtime:** Node.js 20 + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 
- **Message Broker:** RabbitMQ 3.13
- **Containers:** Docker + Docker Compose

---

## Adding a New App or Service

### 1. Create the Folder
Create a new directory in `backend/services`, for example: `services/billing-service`.

### 2. Scaffold the Service
The easiest way is to copy the `package.json`, `tsconfig.json`, and `Dockerfile` from an existing service (like `order-service`) and update the names. Update all `Dockerfile` paths to reflect the `apps/` directory.

### 3. Register in Docker Compose
Add your service to `docker-compose.yml`. Ensure the `build.context` is set to the root `./` and `dockerfile` points to `apps/your-service/Dockerfile`.
