# ArmorX — Arms & Ammunition Distribution Platform

## Architecture

**Monorepo** (pnpm workspaces):

```
artifacts/
  api-server/   — Express 5 REST API (port via $PORT, path /api)
  armory/       — React + Vite frontend (port via $PORT, base path /)
lib/
  api-spec/     — OpenAPI spec + codegen config (orval)
  api-client-react/ — Generated React Query hooks (@workspace/api-client-react)
  api-zod/      — Generated Zod schemas (@workspace/api-zod)
  db/           — Drizzle ORM schema + migrations (@workspace/db)
scripts/        — Utility scripts
```

## Tech Stack

- **Frontend**: React 18, Vite 7, TailwindCSS v4, shadcn/ui, Wouter (routing), TanStack Query v5, react-hook-form + Zod, Recharts, @react-three/fiber + @react-three/drei (3D viewer)
- **Backend**: Express 5, express-session + connect-pg-simple, bcrypt
- **Database**: PostgreSQL (Drizzle ORM)
- **Code generation**: Orval (hooks from OpenAPI) + Zod schemas

## Key Features

1. **Age Gate** — First-visit modal requiring age certification
2. **Role-based auth** — guest / verified_buyer / admin (session-based with bcrypt)
3. **KYC verification** — Multi-step document submission + admin review queue
4. **License registry** — Upload FFL, CCW, hunting, C&R licenses
5. **Product catalog** — 8 seeded products (firearms, ammo, accessories) with license requirement flags
6. **3D product viewer** — Interactive Three.js viewer on product detail page
7. **Cart + Checkout** — 3-step protocol (logistics → compliance → authorization)
8. **Orders** — Full order history with status tracking
9. **Admin dashboard** — Revenue telemetry, KYC queue, order management, user registry, inventory

## Database Schema

Tables: `users`, `products`, `categories`, `orders`, `cart_items`, `kyc_submissions`, `licenses`, `audit_logs`, `session`

## Seeded Data

- **Admin**: admin@armorx.com / Admin@123
- **Verified buyer**: buyer@armorx.com / Admin@123
- **Guest/pending**: pending@armorx.com / Admin@123
- **Products**: 8 products across 3 categories
- **Orders**: 5 historical orders with various statuses
- **KYC**: 1 approved, 1 pending submission
- **Licenses**: 2 approved licenses for buyer account

## API Endpoints

All routes under `/api`:

- `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`
- `GET/POST /products`, `GET /products/featured`, `GET/PUT/DELETE /products/:id`
- `GET /categories`
- `GET/POST/DELETE /cart`, `PUT /cart/:id`, `GET /cart/validate`
- `GET/POST /orders`, `GET /orders/:id`
- `GET/POST /kyc`
- `GET/POST /licenses`
- `GET /admin/users`, `PUT /admin/users/:id/role`
- `GET /admin/kyc`, `POST /admin/kyc/:id/approve`, `POST /admin/kyc/:id/reject`
- `GET /admin/licenses`, `POST /admin/licenses/:id/approve`, `POST /admin/licenses/:id/reject`
- `GET /admin/orders`, `PUT /admin/orders/:id/status`
- `GET /dashboard/summary`, `GET /dashboard/sales-trend`, `GET /dashboard/category-breakdown`, `GET /dashboard/recent-activity`, `GET /dashboard/user-stats`

## Important Notes

- PostgreSQL numeric columns are returned as strings by Drizzle — frontend wraps with `Number()` before `.toFixed()`
- `products/featured` returns a plain array; `products` list returns `{ items, total, page, limit, totalPages }`
- `licenses` and `admin/kyc` return plain arrays; other list endpoints return paginated objects with `items`
- Session secret stored in `SESSION_SECRET` env var
- `dedupe: ["react", "react-dom"]` in vite config prevents duplicate React with Three.js
