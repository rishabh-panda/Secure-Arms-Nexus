<div align="center">

```
█████╗ ██████╗ ███╗   ███╗ ██████╗ ██████╗ ██╗  ██╗
██╔══██╗██╔══██╗████╗ ████║██╔═══██╗██╔══██╗╚██╗██╔╝
███████║██████╔╝██╔████╔██║██║   ██║██████╔╝ ╚███╔╝ 
██╔══██║██╔══██╗██║╚██╔╝██║██║   ██║██╔══██╗ ██╔██╗ 
██║  ██║██║  ██║██║ ╚═╝ ██║╚██████╔╝██║  ██║██╔╝ ██╗
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
```

### ⚡ Elite Arms & Ammunition Distribution Platform ⚡

*A militarized, compliance-first e-commerce ecosystem for the modern firearms industry*

---

## Home Page Preview
<img width="1337" height="747" alt="image" src="https://github.com/user-attachments/assets/ff8492c9-329c-41f4-8527-943e6fb307e8" />

---

## Arsenal Catalog
<img width="1332" height="747" alt="image" src="https://github.com/user-attachments/assets/55a5ffc7-9266-411e-bf1f-73865eba5367" />

## SKU Preview
<img width="1467" height="765" alt="image" src="https://github.com/user-attachments/assets/4a624312-aabc-4453-a8ce-7fef5647d9ad" />

---

![Platform](https://img.shields.io/badge/Platform-Full--Stack_Web-00D4FF?style=for-the-badge&logo=react&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Express_5-8B5CF6?style=for-the-badge&logo=node.js&logoColor=white)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![3D](https://img.shields.io/badge/3D_Viewer-Three.js-00FF41?style=for-the-badge&logo=threedotjs&logoColor=black)
![License](https://img.shields.io/badge/License-Proprietary-FF0040?style=for-the-badge)

</div>

---

## 🎯 What is ArmorX?

> **ArmorX** is not your average e-commerce platform. It is a **cyber-dark, militarized distribution system** built for firearms dealers, verified collectors, and licensed operators. Every transaction is wrapped in compliance. Every user is vetted. Every purchase is tracked.

Built with a **futuristic aesthetic** and **enterprise-grade architecture**, ArmorX combines a 3D product viewer, multi-layer KYC verification, real-time compliance checks, and a full admin command center — all under one hardened platform.

---

## 🌐 Platform Preview

| Page | Description |
|------|-------------|
| 🏠 **Home** | Age-gate modal + hero + featured assets grid |
| 🔫 **Arsenal Catalog** | Full product browser with search, filter, license flags |
| 🧊 **Product Detail** | Interactive 3D viewer + holographic spec overlays |
| 🛒 **Cart** | Smart payload manager with compliance status |
| 📋 **Checkout** | 3-step protocol: Logistics → Compliance → Authorization |
| 📦 **Orders** | Requisition history with live status tracking |
| 🪪 **KYC** | Multi-step identity verification protocol |
| 📄 **Licenses** | Firearms license registry (FFL, CCW, C&R, Hunting) |
| 🖥️ **Command Center** | Admin dashboard: revenue telemetry, KYC queue, user registry |

---

## ✨ Core Features

### 🔐 Authentication & Identity

```
[ GUEST ] ──► [ KYC SUBMITTED ] ──► [ VERIFIED BUYER ] ──► [ ADMIN ]
    │                 │                      │                   │
  Browse            Pending               Full Access       Command Center
  Only              Review               + Checkout         + All Controls
```

- **Session-based authentication** with bcrypt password hashing
- **Role hierarchy**: `guest` → `verified_buyer` → `admin`
- **Age Gate**: Legal age certification modal on first visit
- **KYC workflow**: Document upload → Admin review → Status update
- **License registry**: Upload and manage multiple firearms licenses

---

### 🧊 Interactive 3D Product Viewer

Built with **@react-three/fiber** and **@react-three/drei**, the product detail page features:

- Real-time **OrbitControls** — rotate, zoom, pan
- **Holographic spec labels** with HTML overlays in 3D space
- Dynamic **environment lighting** and contact shadows
- Animated **geometric weapon representations**
- Seamless fallback for unsupported environments

---

### ⚖️ Compliance Engine

```
Order Submitted
      │
      ▼
 License Check ──► FAIL ──► compliance_review status
      │
     PASS
      │
      ▼
 KYC Verified? ──► NO ──► blocked + user notified
      │
     YES
      │
      ▼
 Background Check Consent ──► Approved ──► Shipped
```

- Products flagged with `requiresLicense` trigger automatic license verification
- Cart validation endpoint checks eligibility before checkout
- Orders enter `compliance_review` status for restricted items
- Admin can approve, reject, or escalate any stage

---

### 📊 Admin Command Center

| Panel | Data |
|-------|------|
| 📈 Revenue Telemetry | Area chart showing daily revenue trend (30 days) |
| 👥 Operative Registry | Full user table with role management controls |
| 🪪 Clearance Queue | Pending KYC submissions with approve/reject actions |
| 📦 Logistics Management | All orders with inline status update dropdowns |
| 🗄️ Inventory Control | Full product inventory with stock levels |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARMORX PLATFORM                          │
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────────────────┐  │
│  │   React Frontend  │◄──────►│      Express 5 API Server    │  │
│  │  (Vite + TS)      │  HTTP  │   /api/** (port via $PORT)   │  │
│  │                   │        │                              │  │
│  │  • TanStack Query │        │  • Session Auth (bcrypt)     │  │
│  │  • Wouter Router  │        │  • connect-pg-simple         │  │
│  │  • shadcn/ui      │        │  • Drizzle ORM               │  │
│  │  • Three.js       │        │  • Audit logging             │  │
│  │  • Recharts       │        │  • Role middleware            │  │
│  └──────────────────┘         └──────────┬───────────────────┘  │
│                                          │                       │
│  ┌───────────────────────────────────────▼───────────────────┐  │
│  │                    PostgreSQL Database                     │  │
│  │  users │ products │ categories │ orders │ cart_items       │  │
│  │  kyc_submissions │ licenses │ audit_logs │ session         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Shared Libraries                       │  │
│  │  @workspace/api-spec     → OpenAPI 3.1 source of truth    │  │
│  │  @workspace/api-client-react → Orval-generated RQ hooks   │  │
│  │  @workspace/api-zod      → Orval-generated Zod schemas    │  │
│  │  @workspace/db           → Drizzle schema + migrations    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite 7** | Build tool & dev server |
| **TailwindCSS v4** | Utility-first styling |
| **shadcn/ui** | Accessible component primitives |
| **Wouter** | Lightweight client-side routing |
| **TanStack Query v5** | Server state, caching, mutations |
| **react-hook-form + Zod** | Form validation |
| **@react-three/fiber** | React renderer for Three.js |
| **@react-three/drei** | Three.js helpers & abstractions |
| **Recharts** | Data visualization (admin charts) |
| **date-fns** | Date formatting |
| **Orbitron + Inter** | Futuristic monospace + clean sans-serif |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express 5** | HTTP server framework |
| **express-session** | Session management |
| **connect-pg-simple** | PostgreSQL session store |
| **bcrypt** | Password hashing (12 rounds) |
| **Drizzle ORM** | Type-safe SQL query builder |
| **PostgreSQL** | Primary relational database |
| **Pino** | Structured JSON logging |

### Developer Experience
| Technology | Purpose |
|-----------|---------|
| **TypeScript (strict)** | End-to-end type safety |
| **Orval** | OpenAPI → React Query hooks + Zod schemas codegen |
| **pnpm workspaces** | Monorepo package management |
| **OpenAPI 3.1** | API contract (source of truth) |

---

## 📁 Project Structure

```
armorx/
├── artifacts/
│   ├── api-server/               # Express 5 REST API
│   │   └── src/
│   │       ├── app.ts            # Express app + session middleware
│   │       ├── routes/           # All route handlers
│   │       │   ├── auth.ts       # Login / register / logout / me
│   │       │   ├── products.ts   # Product CRUD + featured
│   │       │   ├── categories.ts # Category listing
│   │       │   ├── cart.ts       # Cart management + validation
│   │       │   ├── orders.ts     # Order creation + tracking
│   │       │   ├── kyc.ts        # KYC submission
│   │       │   ├── licenses.ts   # License registry
│   │       │   ├── admin.ts      # Admin: users/kyc/licenses/orders
│   │       │   └── dashboard.ts  # Analytics endpoints
│   │       ├── middlewares/
│   │       │   └── auth.ts       # requireAuth + requireAdmin
│   │       └── lib/
│   │           └── audit.ts      # Audit log helper
│   │
│   └── armory/                   # React + Vite frontend
│       └── src/
│           ├── App.tsx           # Router + query client setup
│           ├── index.css         # Cyber-dark theme variables
│           ├── components/
│           │   ├── AgeGate.tsx   # Age verification modal
│           │   ├── AuthContext.tsx # Auth state provider
│           │   ├── MainLayout.tsx # Sidebar + nav + toaster
│           │   └── ui/           # shadcn/ui components
│           └── pages/
│               ├── Home.tsx      # Landing + featured products
│               ├── Products.tsx  # Catalog with filters
│               ├── ProductDetail.tsx # 3D viewer + add to cart
│               ├── Cart.tsx      # Payload management
│               ├── Checkout.tsx  # 3-step checkout protocol
│               ├── Orders.tsx    # Order history
│               ├── OrderDetail.tsx # Order tracking
│               ├── Kyc.tsx       # KYC submission form
│               ├── Licenses.tsx  # License registry
│               ├── Profile.tsx   # User dossier
│               ├── Login.tsx     # Authentication
│               ├── Register.tsx  # New operative registration
│               └── admin/
│                   ├── Dashboard.tsx    # Command center
│                   ├── AdminOrders.tsx  # Order management
│                   ├── AdminUsers.tsx   # User registry
│                   ├── AdminKyc.tsx     # KYC review queue
│                   └── AdminProducts.tsx # Inventory control
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml          # OpenAPI 3.1 contract (source of truth)
│   ├── api-client-react/
│   │   └── src/generated/api.ts  # Auto-generated React Query hooks
│   ├── api-zod/
│   │   └── src/generated/api.ts  # Auto-generated Zod schemas
│   └── db/
│       └── src/
│           ├── schema/           # Drizzle table definitions
│           └── index.ts          # DB connection + exports
│
└── scripts/                      # Utility scripts
```

---

## 🗄️ Database Schema

```sql
┌──────────────────────────────────────────────────────────────────┐
│ users                                                            │
│ id · email · password_hash · first_name · last_name             │
│ date_of_birth · role · kyc_status · is_age_verified             │
│ agreed_to_terms · created_at · updated_at                       │
└──────────────────────┬───────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│kyc_submissions│ │   licenses   │ │  cart_items  │
│  id · user_id │ │ id · user_id │ │id · user_id  │
│  status · doc │ │ license_type │ │product_id    │
│  address · …  │ │ status · exp │ │quantity      │
└──────────────┘ └──────────────┘ └──────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ products                                                         │
│ id · name · description · price · category_id · brand           │
│ type(firearm|ammunition|accessory) · caliber · stock_count       │
│ image_url · requires_license · restricted_jurisdictions          │
│ is_featured · rating · review_count · created_at                │
└──────────────────────┬───────────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   categories    │
              │ id · name · desc│
              └─────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ orders                                                           │
│ id · user_id · status · items(jsonb) · subtotal · total         │
│ shipping_address · consent_given · created_at · updated_at      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ audit_logs                                                       │
│ id · user_id · user_email · action · resource_type              │
│ resource_id · details · ip_address · created_at                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🌐 API Reference

### Authentication
```
POST   /api/auth/register    — Create new operative account
POST   /api/auth/login       — Authenticate + start session
POST   /api/auth/logout      — Terminate session
GET    /api/auth/me          — Get current session user
```

### Products
```
GET    /api/products          — List products (search, filter, paginate)
GET    /api/products/featured — Featured products (no auth required)
GET    /api/products/:id      — Product detail
POST   /api/products          — Create product [ADMIN]
PUT    /api/products/:id      — Update product [ADMIN]
DELETE /api/products/:id      — Delete product [ADMIN]
```

### Cart
```
GET    /api/cart              — Get current cart
POST   /api/cart              — Add item to cart
PUT    /api/cart/:id          — Update quantity
DELETE /api/cart/:id          — Remove item
DELETE /api/cart              — Clear entire cart
GET    /api/cart/validate     — Run compliance check on cart
```

### Orders
```
GET    /api/orders            — List user orders
POST   /api/orders            — Submit new order
GET    /api/orders/:id        — Order detail
```

### KYC & Licenses
```
GET    /api/kyc               — Get own KYC status
POST   /api/kyc               — Submit KYC documents
GET    /api/licenses          — List own licenses
POST   /api/licenses          — Submit new license
```

### Admin
```
GET    /api/admin/users           — List all users
PUT    /api/admin/users/:id/role  — Update user role
GET    /api/admin/kyc             — List KYC submissions
POST   /api/admin/kyc/:id/approve — Approve KYC
POST   /api/admin/kyc/:id/reject  — Reject KYC
GET    /api/admin/licenses        — List all licenses
POST   /api/admin/licenses/:id/approve
POST   /api/admin/licenses/:id/reject
GET    /api/admin/orders          — List all orders
PUT    /api/admin/orders/:id/status
```

### Dashboard (Admin)
```
GET    /api/dashboard/summary          — KPIs + growth metrics
GET    /api/dashboard/sales-trend      — Daily revenue (30 days)
GET    /api/dashboard/category-breakdown — Sales by category
GET    /api/dashboard/recent-activity  — Audit log stream
GET    /api/dashboard/user-stats       — User registration trend
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **PostgreSQL** 15+ (or use the built-in Replit database)

### Environment Variables

```bash
DATABASE_URL=postgresql://user:password@host:5432/armorx
SESSION_SECRET=your-super-secret-session-key-min-32-chars
PORT=8080           # API server (set by workflow)
BASE_PATH=/         # Frontend base path (set by workflow)
```

### Installation & Setup

```bash
# Install all workspace dependencies
pnpm install

# Push database schema to PostgreSQL
pnpm --filter @workspace/db run push

# Regenerate API client hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (separate terminal)
pnpm --filter @workspace/armory run dev
```

### Seed Demo Data

The database comes pre-seeded with:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| 👑 Admin | `admin@armorx.com` | `Admin@123` | `admin` |
| ✅ Verified Buyer | `buyer@armorx.com` | `Admin@123` | `verified_buyer` |
| 🔄 Pending | `pending@armorx.com` | `Admin@123` | `guest` |

**Seeded inventory:** 8 products across 3 categories (Firearms, Ammunition, Accessories)  
**Seeded orders:** 5 historical orders in various statuses  
**Seeded KYC:** 1 approved, 1 pending verification  

---

## 🎨 Design System

### Color Palette

```
Primary (Electric Blue)  ──  #00D4FF  ▓▓▓▓▓▓▓▓
Accent  (Violet)         ──  #8B5CF6  ▓▓▓▓▓▓▓▓
Neon    (Matrix Green)   ──  #00FF41  ▓▓▓▓▓▓▓▓
Danger  (Alert Red)      ──  #FF0040  ▓▓▓▓▓▓▓▓
Background               ──  #030712  ▓▓▓▓▓▓▓▓
Card Surface             ──  #0D1117  ▓▓▓▓▓▓▓▓
```

### Typography

```
Primary UI:   Orbitron  — futuristic monospace, ALL CAPS headings
Body Text:    Inter     — clean sans-serif, readable paragraphs
Code/Data:    monospace — labels, IDs, technical readouts
```

### Visual Language

- **Glassmorphism** cards with backdrop blur
- **Neon glow** border effects on interactive elements
- **Scan-line** and grid overlays for depth
- **Cyber-dark** base with electric blue accent lighting
- **Sharp right angles** — no rounded corners on structural elements
- **Badge system** — license requirements, status indicators, role badges

---

## 🔒 Security Model

| Layer | Mechanism |
|-------|-----------|
| **Password storage** | bcrypt (12 salt rounds) |
| **Session management** | Signed server-side sessions in PostgreSQL |
| **Route protection** | `requireAuth` + `requireAdmin` middleware |
| **Age verification** | Client-side gate + server-side date_of_birth check |
| **Compliance gating** | Cart validation before checkout |
| **Audit trail** | All significant actions logged to `audit_logs` table |
| **Role escalation** | Admin-only role updates with audit logging |

---

## 📈 Codegen Workflow

ArmorX uses a **contract-first** approach — the OpenAPI spec drives all code:

```
lib/api-spec/openapi.yaml
          │
          ▼ (pnpm --filter @workspace/api-spec run codegen)
          │
    ┌─────┴──────┐
    ▼             ▼
@workspace/     @workspace/
api-client-     api-zod/
react/          src/generated/
(RQ hooks)      (Zod schemas)
```

All React Query hooks (`useListProducts`, `useCreateOrder`, etc.) are auto-generated from the OpenAPI spec. Never write API client code by hand — update the spec and regenerate.

---

## 🧩 Key Design Decisions

**1. Session Auth over JWT**  
Server-side sessions stored in PostgreSQL provide instant revocation, no token refresh complexity, and auditability.

**2. OpenAPI-first codegen**  
Single source of truth eliminates client/server drift. Type-safe hooks match Zod-validated server responses.

**3. pnpm Monorepo**  
Shared libraries (`db`, `api-spec`, generated clients) are proper workspace packages — not copy-pasted code.

**4. React Three Fiber for 3D**  
Declarative Three.js in React's component model — same state/props patterns as the rest of the UI.

**5. Drizzle ORM**  
SQL-like TypeScript query builder that stays close to the metal — no magic, full type inference from schema.

---

## 📋 Order Status State Machine

```
pending ──────────────────► compliance_review
   │                               │
   │                        ┌──────┴──────┐
   │                        ▼             ▼
   │                    approved       rejected
   │                        │
   ▼                        ▼
cancelled              processing
                            │
                            ▼
                         shipped
                            │
                            ▼
                        delivered
```

---

<div align="center">

---

**ArmorX** — *Precision Commerce. Compliance First. No Exceptions.*

```
TARGET ACQUIRED. CLEARANCE VERIFIED. PROCEED.
```

![Made with React](https://img.shields.io/badge/Made_with-React-61DAFB?style=flat-square&logo=react)
![Powered by Express](https://img.shields.io/badge/Powered_by-Express_5-000000?style=flat-square&logo=express)
![Database](https://img.shields.io/badge/DB-PostgreSQL-336791?style=flat-square&logo=postgresql)
![Type Safe](https://img.shields.io/badge/100%25-Type_Safe-3178C6?style=flat-square&logo=typescript)

</div>
