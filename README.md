# JAYASCRAVINGS

*Cake & Confectionery Order Management Platform*

**Backend API — NestJS + GraphQL + PostgreSQL**

*Built by Techillionaire Solutions Ltd.*

`Node 20` • `NestJS 11` • `TypeScript` • `PostgreSQL 16` • `Redis 7` • `GraphQL`

---

## 1. Project Overview

Jayascravings is a full-stack cake and confectionery order management platform. This repository contains the backend API which powers both the customer-facing shop and the internal admin dashboard.

| | |
|---|---|
| **Client** | Jayascravings |
| **Developer** | Techillionaire Solutions Ltd. |
| **Repo** | [github.com/kingonyeka/jayascraving-BE](https://github.com/kingonyeka/jayascraving-BE) |
| **API Style** | GraphQL (primary) + REST (webhooks, file uploads, SSE) |
| **Auth** | Google SSO → JWT access token + httpOnly refresh cookie |

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| Framework | NestJS 11 |
| API | GraphQL (Apollo Server 5) + REST |
| Database | PostgreSQL 16 (Neon) |
| ORM | TypeORM 0.3 |
| Cache & Queues | Redis 7 (Upstash/Railway) + Bull |
| Auth | Google OAuth2 + JWT (passport-jwt) |
| Payments | Paystack |
| Email | Resend |
| Push | Firebase Cloud Messaging |
| Storage | AWS S3 + CloudFront CDN |
| Observability | Winston + Sentry + correlation IDs |
| Containerisation | Docker + docker-compose |
| CI/CD | GitHub Actions → GitHub Container Registry → Render |

## 3. Prerequisites

Make sure you have the following installed before proceeding:

- [Node.js 20+](https://nodejs.org)
- npm 9+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git
- A [Neon PostgreSQL](https://neon.tech) account — free tier is fine for dev
- An [Upstash Redis](https://upstash.com) account — or use docker-compose Redis

## 4. Local Development Setup

### 4.1 Clone the repository

```bash
git clone https://github.com/kingonyeka/jayascraving-BE.git
cd jayascraving-BE
```

### 4.2 Install dependencies

```bash
npm install --legacy-peer-deps
```

### 4.3 Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set all required values. See [Section 5](#5-environment-variables) for a full description of every variable.

### 4.4 Start infrastructure with Docker

Start Postgres, Redis (cache), Redis (queue) and Bull Board in the background:

```bash
docker-compose up postgres redis-cache redis-queue -d
```

Verify all services are healthy:

```bash
docker-compose ps
```

You should see `status: Up (healthy)` for all three services.

### 4.5 Start the development server

```bash
npm run start:dev
```

The server starts with hot reload. You should see:

```
🚀 Server running on http://localhost:3000/api
📊 GraphQL playground: http://localhost:3000/graphql
❤️ Health check: http://localhost:3000/api/health
```

### 4.6 Verify it works

Open `http://localhost:3000/api/health/live` in your browser. You should see:

```json
{ "status": "ok", "uptime": 12, "environment": "development" }
```

## 5. Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NODE_ENV` | `development` \| `production` \| `test` | Yes |
| `PORT` | HTTP port (default: 3000) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis URL for cache and sessions | Yes |
| `REDIS_QUEUE_URL` | Redis URL for Bull job queues | Yes |
| `JWT_SECRET` | Secret for access tokens (min 64 chars) | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 64 chars) | Yes |
| `JWT_EXPIRES_IN` | Access token TTL (default: 15m) | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default: 30d) | No |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Yes |
| `AWS_REGION` | AWS region (e.g. us-east-1) | Yes |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | Yes |
| `S3_BUCKET` | S3 bucket name for media uploads | Yes |
| `CLOUDFRONT_URL` | CloudFront distribution URL | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret key (`sk_live_...` or `sk_test_...`) | Yes |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack webhook HMAC secret | Yes |
| `RESEND_API_KEY` | Resend API key for transactional email | Yes |
| `EMAIL_FROM` | From address for emails | Yes |
| `FRONTEND_URL` | Frontend origin URL for CORS | Yes |
| `INTERNAL_API_KEY` | API key for service-to-service calls | Yes |
| `SENTRY_DSN` | Sentry DSN for error tracking | No |
| `FIREBASE_PROJECT_ID` | Firebase project ID for push notifications | No |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | No |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | No |

Generate secure secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 6. Docker

### 6.1 Development (docker-compose)

Starts Postgres, two Redis instances and Bull Board. Your NestJS app runs natively with `npm run start:dev` for fast hot reload.

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f api
docker-compose down
docker-compose down -v  # also deletes all data volumes
```

### 6.2 Production simulation

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### 6.3 Useful Docker commands

```bash
docker-compose exec postgres psql -U postgres -d jayascravings
docker-compose exec redis-cache redis-cli
docker stats
docker system prune
```

### 6.4 Bull Board

Queue monitoring dashboard available at `http://localhost:3002` when docker-compose is running.

## 7. Database & Migrations

In development, TypeORM auto-syncs the schema (`synchronize: true`). In production, use migrations.

### 7.1 Generate a migration

```bash
npm run migration:generate -- migrations/DescribeYourChange
```

### 7.2 Run pending migrations

```bash
npm run migration:run
```

### 7.3 Revert last migration

```bash
npm run migration:revert
```

### 7.4 Check migration status

```bash
npm run migration:show
```

## 8. API Overview

### 8.1 GraphQL

The primary API. Access the interactive playground at `http://localhost:3000/graphql`

All queries and mutations are documented in the auto-generated schema at `src/schema.gql`

### 8.2 REST endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/webhook` | Paystack webhook handler |
| POST | `/api/media/presign` | Get presigned S3 upload URL |
| POST | `/api/media/confirm` | Confirm upload and save media record |
| GET | `/api/media/:id` | Get a media record |
| DELETE | `/api/media/:id` | Delete a media record |
| GET | `/api/analytics/live` | SSE stream for live dashboard |
| GET | `/api/health` | Full health check (DB + Redis + memory) |
| GET | `/api/health/live` | Liveness probe |
| GET | `/api/health/ready` | Readiness probe |

## 9. Project Structure

```
src/
├── common/                  # guards, decorators, filters, interceptors, pipes, enums
├── config/                  # database, redis, jwt, aws config
├── modules/
│   ├── auth/                    # Google SSO, JWT, refresh tokens
│   ├── users/                   # user profiles, addresses
│   ├── products/                # catalogue, categories, variants, customisation options
│   ├── cart/                    # cart with inventory reservation
│   ├── orders/                  # order lifecycle with auto-cancel
│   ├── payments/                # Paystack integration, webhook handler
│   ├── custom-orders/           # bespoke cake requests, quotes, agreements
│   ├── delivery/                # zones, slots
│   ├── promotions/              # promo codes
│   ├── notifications/           # email via Resend + Bull queue
│   ├── media/                   # S3 presigned uploads, CloudFront
│   ├── reviews/                 # product reviews with moderation
│   ├── analytics/                # revenue, orders, customers dashboard
│   ├── real-time-analytics/     # SSE live dashboard
│   ├── staff/                   # staff invites, roles, audit logs
│   ├── settings/                # key-value app settings
│   ├── health/                  # health check endpoints
│   ├── queues/                  # Bull processors (order, payment, inventory, cart)
│   ├── observability/           # Winston, Sentry, correlation IDs, slow queries
│   ├── cache/                   # Redis cache service with invalidation
│   ├── dataloader/              # N+1 prevention via DataLoader
│   ├── push-notifications/      # Firebase Cloud Messaging
│   ├── in-app-notifications/    # notification bell
│   └── abandoned-cart/          # recovery email scheduling
├── data-source.ts           # TypeORM CLI config for migrations
├── app.module.ts             # root module
└── main.ts                   # bootstrap
```

## 10. Available Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled output |
| `npm test` | Run Jest unit tests |
| `npm run lint` | Run ESLint |
| `npm run migration:generate` | Generate TypeORM migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:show` | List migration status |

## 11. CI/CD Pipeline

GitHub Actions pipeline in `.github/workflows/ci.yml` runs on every push:

- **Lint** — ESLint check
- **Test** — Jest with real Postgres + Redis services
- **Build** — TypeScript compilation
- **Docker** — builds and pushes image to `ghcr.io` (main branch only)
- **Deploy** — triggers Render deploy hook (main branch only)

Required GitHub secrets:

- `RENDER_DEPLOY_HOOK_URL` — from Render dashboard → your service → Settings → Deploy Hook

## 12. Key Module Interactions

When a customer places an order, this chain fires automatically:

1. `CartService` reserves inventory (pessimistic DB lock)
2. `OrdersService` creates the order and schedules auto-cancel in 30 minutes via Bull
3. `PaymentsService` initiates Paystack transaction
4. Paystack webhook confirms payment → order moves to `CONFIRMED`, auto-cancel job removed
5. `NotificationsService` queues order confirmation email via Bull → Resend delivers it
6. `InAppNotificationsService` creates bell notification for the customer
7. `PushNotificationsService` sends FCM push to customer's device
8. `RealTimeAnalyticsService` emits SSE event to admin dashboard

## 13. Contributing

Branch naming convention:

- `feat/description` — new features
- `fix/description` — bug fixes
- `chore/description` — maintenance

Commit message format (Conventional Commits):

```
feat(module): short description

- Detail 1
- Detail 2
```

All PRs must pass lint, tests and build before merging to main.

## 14. License

Proprietary. Built by Techillionaire Solutions Ltd. for Jayascravings. All rights reserved.