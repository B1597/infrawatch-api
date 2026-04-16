# InfraWatch API

Backend service for InfraWatch — an infrastructure monitoring system for managing datacenters, racks, servers, and network devices.

## Live Demo

- **Swagger UI:** https://infrawatch-api-d94p.onrender.com/api
- **OpenAPI JSON:** https://infrawatch-api-d94p.onrender.com/api-json

> Note: hosted on Render free tier — first request may take ~30 seconds if the service is sleeping.

## Tech Stack

- **NestJS** — Node.js framework
- **PostgreSQL** — database (hosted on Neon)
- **Prisma** — ORM and migrations
- **Jest** — unit testing
- **GitHub Actions** — CI/CD pipeline
- **Render** — deployment

## Features

- Hierarchical topology API (datacenters → racks → devices)
- Node details and basic configuration via GET/PATCH endpoints
- Node metrics and details retrieval
- Aggregated dashboard statistics (health and utilization)
- Alerts system with acknowledge / resolve workflow
- Swagger API documentation
- Unit testing with mocked Prisma layer
- CI/CD with automated deployment

## Architecture

- Layered structure: Controller → Service → Prisma
- DTO-based validation and response shaping
- Self-referencing Node hierarchy for topology (datacenter → rack → device)

## Real-World Context

In a production setup, this API would receive data from distributed agents running on devices (servers, network equipment). These agents would periodically send metrics and status updates, which are stored and exposed via the API for monitoring and visualization.

## Data Model

- `Node` — core entity representing datacenters, racks, and devices (self-referencing hierarchy)
- `NodeConfig` — configuration data per node (credentials, identifiers)
- `NodeMetrics` — performance metrics per node (CPU, memory, network, uptime)
- `Alert` — system alerts with acknowledgment and resolution flow

## Frontend

- **Repository:** https://github.com/B1597/infra-watch

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL database
- Copy `.env.example` to `.env` and fill in your values

```bash
cp .env.example .env
```

### Install & Run

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

### Run Tests

```bash
npm test
```

### Swagger

Once running locally, open:

```
http://localhost:3000/api
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Port to listen on (default: 3000) |
| `CORS_ORIGIN` | Allowed frontend origin |

## CI/CD

On every push to `develop`:
1. GitHub Actions runs unit tests
2. If tests pass, triggers a deploy to Render automatically
