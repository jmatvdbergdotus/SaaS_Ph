# Sari-SaaS — Cross-Platform Monorepo Scaffold
### Project Directory Tree v1.0

---

## Overview

This is a **Turborepo monorepo** with three application surfaces (mobile, web, API) and three shared packages. Code sharing is maximized through `packages/` — business logic, types, and API clients are written once and consumed everywhere.

```
Architecture:
  apps/mobile     → Expo React Native (Android + iOS)
  apps/web        → Next.js 14 PWA (browser + installable)
  apps/api        → Fastify (Node.js backend)
  
  packages/core   → Shared business logic, types, constants
  packages/ui     → Shared React/RN component primitives
  packages/db     → Supabase schema, migrations, generated types
```

---

## Full Directory Tree

```
sari-saas/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint + test on PR
│   │   ├── deploy-web.yml            # Deploy web to Cloudflare Pages
│   │   ├── deploy-api.yml            # Deploy API to Fly.io
│   │   └── deploy-mobile.yml         # EAS Build trigger
│   └── PULL_REQUEST_TEMPLATE.md
│
├── apps/
│   │
│   ├── mobile/                       # Expo React Native app
│   │   ├── app/                      # Expo Router v3 file-based routing
│   │   │   ├── (auth)/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── login.tsx         # OTP phone number entry
│   │   │   │   └── verify.tsx        # OTP code verification
│   │   │   ├── (app)/
│   │   │   │   ├── _layout.tsx       # Tab navigator (Home/Orders/Chat/Inventory)
│   │   │   │   ├── index.tsx         # Dashboard (status cards + quick actions)
│   │   │   │   ├── orders/
│   │   │   │   │   ├── index.tsx     # Order list with status filter
│   │   │   │   │   └── [id].tsx      # Order detail view
│   │   │   │   ├── chat/
│   │   │   │   │   ├── index.tsx     # Unified multi-channel feed
│   │   │   │   │   └── [threadId].tsx # Individual conversation thread
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── index.tsx     # Inventory table
│   │   │   │   │   └── [id].tsx      # Item detail/edit
│   │   │   │   └── settings/
│   │   │   │       ├── index.tsx     # Settings hub
│   │   │   │       ├── store.tsx     # Store profile
│   │   │   │       └── billing.tsx   # Plan + billing history
│   │   │   └── +not-found.tsx
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── StatusCard.tsx    # Operational status card widget
│   │   │   │   ├── QuickActions.tsx  # Quick action zone bar
│   │   │   │   └── SyncIndicator.tsx # Network/sync status header element
│   │   │   ├── orders/
│   │   │   │   ├── OrderCard.tsx
│   │   │   │   ├── OrderStatusBadge.tsx
│   │   │   │   └── PaymentMethodTag.tsx
│   │   │   ├── chat/
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── ChannelBadge.tsx  # FB/TT/IG/GCash indicator
│   │   │   │   └── QuickReplyBar.tsx # AI suggestion chips
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryRow.tsx
│   │   │   │   └── StockStatusPill.tsx
│   │   │   └── shared/
│   │   │       ├── AppHeader.tsx
│   │   │       ├── BottomTabBar.tsx
│   │   │       └── OfflineBanner.tsx
│   │   ├── features/
│   │   │   ├── ocr/
│   │   │   │   ├── useOcrScanner.ts  # Camera/gallery → Tesseract pipeline
│   │   │   │   └── OcrConfirmSheet.tsx # Confirm extracted fields
│   │   │   ├── reconciliation/
│   │   │   │   ├── useReconcile.ts   # Match payment to open orders
│   │   │   │   └── ReconcileMatchCard.tsx
│   │   │   ├── logistics/
│   │   │   │   ├── useCourierQuotes.ts
│   │   │   │   └── CourierQuoteSheet.tsx
│   │   │   └── newSale/
│   │   │       └── NewSaleSheet.tsx  # "Bagong Benta" bottom sheet
│   │   ├── hooks/
│   │   │   ├── useNetworkState.ts    # Online/offline detection
│   │   │   ├── useSync.ts            # Sync queue trigger
│   │   │   └── useAuth.ts            # JWT session management
│   │   ├── store/                    # Zustand global state
│   │   │   ├── authStore.ts
│   │   │   ├── ordersStore.ts
│   │   │   ├── inventoryStore.ts
│   │   │   └── syncStore.ts          # Pending sync queue state
│   │   ├── assets/
│   │   │   ├── fonts/                # (empty — system fonts only)
│   │   │   └── images/
│   │   │       └── logo.png
│   │   ├── constants/
│   │   │   └── theme.ts              # Design tokens (colors, spacing, typography)
│   │   ├── app.json                  # Expo config
│   │   ├── eas.json                  # EAS Build config
│   │   ├── babel.config.js
│   │   ├── metro.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── web/                          # Next.js 14 PWA
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── verify/
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx        # Sidebar + header shell
│   │   │   │   ├── page.tsx          # Dashboard home
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── chat/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [threadId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── inventory/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   ├── api/
│   │   │   │   └── health/
│   │   │   │       └── route.ts      # Health check endpoint
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── manifest.ts           # PWA manifest
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── StatusCard.tsx
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   └── SyncIndicator.tsx
│   │   │   ├── orders/
│   │   │   │   ├── OrderTable.tsx
│   │   │   │   └── OrderDetailPanel.tsx
│   │   │   ├── chat/
│   │   │   │   ├── MessageFeed.tsx
│   │   │   │   └── ThreadView.tsx
│   │   │   ├── inventory/
│   │   │   │   └── InventoryTable.tsx
│   │   │   └── layout/
│   │   │       ├── AppShell.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── TopBar.tsx
│   │   ├── features/                 # Mirrors mobile features (web-adapted)
│   │   │   ├── ocr/
│   │   │   │   └── OcrDropzone.tsx   # Drag-and-drop screenshot upload
│   │   │   ├── reconciliation/
│   │   │   └── logistics/
│   │   ├── hooks/                    # Web-specific hooks
│   │   │   ├── useNetworkState.ts
│   │   │   └── useSync.ts
│   │   ├── store/                    # Zustand (mirrors mobile)
│   │   │   ├── authStore.ts
│   │   │   ├── ordersStore.ts
│   │   │   └── syncStore.ts
│   │   ├── lib/
│   │   │   ├── indexeddb.ts          # Dexie.js setup
│   │   │   └── sw.ts                 # Service worker (offline PWA)
│   │   ├── public/
│   │   │   ├── icons/
│   │   │   │   ├── icon-192.png
│   │   │   │   └── icon-512.png
│   │   │   └── robots.txt
│   │   ├── styles/
│   │   │   └── globals.css           # CSS custom properties (design tokens)
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                          # Fastify backend
│       ├── src/
│       │   ├── index.ts              # Server entry point
│       │   ├── config.ts             # Env vars + validation (zod)
│       │   ├── plugins/
│       │   │   ├── auth.ts           # JWT validation plugin
│       │   │   ├── cors.ts
│       │   │   ├── rateLimit.ts
│       │   │   └── websocket.ts      # Supabase Realtime bridge
│       │   ├── routes/
│       │   │   ├── auth/
│       │   │   │   ├── index.ts      # POST /auth/otp/request
│       │   │   │   └── verify.ts     # POST /auth/otp/verify
│       │   │   ├── orders/
│       │   │   │   ├── index.ts      # GET /orders, POST /orders
│       │   │   │   └── [id].ts       # GET/PATCH /orders/:id
│       │   │   ├── payments/
│       │   │   │   ├── reconcile.ts  # POST /payments/reconcile
│       │   │   │   ├── xendit-webhook.ts  # POST /webhooks/xendit
│       │   │   │   └── maya-webhook.ts    # POST /webhooks/maya
│       │   │   ├── messages/
│       │   │   │   ├── index.ts      # GET /messages (aggregated feed)
│       │   │   │   └── reply.ts      # POST /messages/:threadId/reply
│       │   │   ├── inventory/
│       │   │   │   └── index.ts      # CRUD /inventory
│       │   │   ├── logistics/
│       │   │   │   ├── quotes.ts     # POST /logistics/quotes
│       │   │   │   └── book.ts       # POST /logistics/book
│       │   │   ├── receipts/
│       │   │   │   └── generate.ts   # POST /receipts/generate
│       │   │   └── sync/
│       │   │       └── delta.ts      # POST /sync/delta (batch sync upload)
│       │   ├── services/
│       │   │   ├── authService.ts    # OTP generation + SMS dispatch
│       │   │   ├── orderService.ts   # Order state machine logic
│       │   │   ├── paymentService.ts # Webhook processing + matching
│       │   │   ├── messageService.ts # Multi-channel message normalization
│       │   │   ├── logisticsService.ts  # Courier quote aggregation
│       │   │   ├── receiptService.ts    # ITA receipt generation
│       │   │   └── syncService.ts    # Delta merge logic
│       │   ├── integrations/
│       │   │   ├── xendit/
│       │   │   │   ├── client.ts
│       │   │   │   └── webhookValidator.ts
│       │   │   ├── maya/
│       │   │   │   ├── client.ts
│       │   │   │   └── webhookValidator.ts
│       │   │   ├── lalamove/
│       │   │   │   └── client.ts
│       │   │   ├── grabexpress/
│       │   │   │   └── client.ts
│       │   │   ├── jnt/
│       │   │   │   └── client.ts
│       │   │   ├── ninjavan/
│       │   │   │   └── client.ts
│       │   │   ├── facebook/
│       │   │   │   └── webhookHandler.ts
│       │   │   ├── tiktok/
│       │   │   │   └── webhookHandler.ts
│       │   │   └── instagram/
│       │   │       └── webhookHandler.ts
│       │   └── middleware/
│       │       ├── jwtVerify.ts
│       │       └── webhookSignature.ts
│       ├── Dockerfile
│       ├── fly.toml                  # Fly.io deployment config
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   │
│   ├── core/                         # Shared business logic (framework-agnostic)
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── order.ts          # Order, OrderStatus, OrderItem types
│   │   │   │   ├── payment.ts        # Payment, PaymentMethod types
│   │   │   │   ├── message.ts        # Message, Channel, Thread types
│   │   │   │   ├── inventory.ts      # InventoryItem, StockStatus types
│   │   │   │   ├── merchant.ts       # Store, MerchantProfile types
│   │   │   │   ├── logistics.ts      # CourierQuote, Shipment types
│   │   │   │   └── sync.ts           # SyncEvent, SyncQueue types
│   │   │   ├── constants/
│   │   │   │   ├── orderStatuses.ts
│   │   │   │   ├── channels.ts       # FACEBOOK | TIKTOK | INSTAGRAM | GCASH | MAYA
│   │   │   │   ├── couriers.ts       # LALAMOVE | GRABEXPRESS | JNT | NINJAVAN
│   │   │   │   └── colors.ts         # Design token color values
│   │   │   ├── utils/
│   │   │   │   ├── formatCurrency.ts # PHP peso formatting
│   │   │   │   ├── formatDate.ts     # PH timezone-aware date formatting
│   │   │   │   ├── orderMatcher.ts   # Fuzzy order-to-payment matching logic
│   │   │   │   ├── receiptBuilder.ts # ITA receipt object construction
│   │   │   │   └── validators.ts     # Zod schemas for all core types
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/                           # Shared primitive components
│   │   ├── src/
│   │   │   ├── tokens/
│   │   │   │   ├── colors.ts         # Design token exports
│   │   │   │   ├── spacing.ts
│   │   │   │   └── typography.ts
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx        # Primary, Secondary, Ghost variants
│   │   │   │   ├── Badge.tsx         # Status badge (Critical/Warning/Success/Neutral)
│   │   │   │   ├── Card.tsx          # Base card container
│   │   │   │   ├── Table.tsx         # High-contrast data table
│   │   │   │   ├── TextInput.tsx     # Accessible form input
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── db/                           # Supabase schema + generated types
│       ├── migrations/
│       │   ├── 001_initial_schema.sql    # users, stores, orders, payments
│       │   ├── 002_messages.sql          # messages, threads
│       │   ├── 003_inventory.sql         # inventory, sync_queue
│       │   ├── 004_shipments.sql         # shipments, waybills
│       │   └── 005_billing.sql           # usage_events, billing_records
│       ├── seed/
│       │   └── dev_seed.sql              # Sample merchant + orders for dev
│       ├── types/
│       │   └── database.ts               # Auto-generated Supabase types
│       ├── schema.ts                     # Drizzle ORM schema (optional)
│       ├── tsconfig.json
│       └── package.json
│
├── tooling/
│   ├── eslint/
│   │   └── index.js                  # Shared ESLint config
│   ├── typescript/
│   │   ├── base.json                 # Base tsconfig
│   │   ├── nextjs.json               # Next.js tsconfig extends base
│   │   └── react-native.json         # RN tsconfig extends base
│   └── jest/
│       └── base.config.ts            # Shared Jest config
│
├── docs/
│   ├── 01_project_specification.md   # ← This project's spec
│   ├── 02_scrum_agile_planning.md    # ← Scrum backlog
│   ├── 03_scaffold.md                # ← This file
│   ├── api/
│   │   └── openapi.yaml              # OpenAPI 3.1 spec
│   └── adr/                          # Architecture Decision Records
│       ├── 001-monorepo-turborepo.md
│       ├── 002-expo-for-mobile.md
│       ├── 003-offline-first-indexeddb.md
│       └── 004-client-side-ocr.md
│
├── .env.example                      # All required env vars documented
├── .gitignore
├── .nvmrc                            # Node version pin
├── turbo.json                        # Turborepo pipeline config
├── package.json                      # Root workspace package.json
├── pnpm-workspace.yaml               # pnpm workspace config
└── README.md
```

---

## Key Configuration Files

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

### Root `package.json`
```json
{
  "name": "sari-saas",
  "private": true,
  "scripts": {
    "dev:web": "turbo run dev --filter=web",
    "dev:api": "turbo run dev --filter=api",
    "dev:mobile": "turbo run dev --filter=mobile",
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:migrate": "pnpm --filter=db migrate",
    "db:seed": "pnpm --filter=db seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### `.env.example`
```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Authentication
JWT_SECRET=
OTP_EXPIRY_SECONDS=300

# Payment Integrations
XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_TOKEN=
MAYA_SECRET_KEY=
MAYA_WEBHOOK_SECRET=

# Courier Integrations
LALAMOVE_API_KEY=
LALAMOVE_SECRET=
GRABEXPRESS_API_KEY=
JNT_API_KEY=
NINJAVAN_CLIENT_ID=
NINJAVAN_CLIENT_SECRET=

# Social Commerce
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_VERIFY_TOKEN=
TIKTOK_APP_KEY=
TIKTOK_APP_SECRET=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=

# SMS (OTP)
SMS_PROVIDER=semaphore     # or vonage, twilio
SEMAPHORE_API_KEY=

# Infrastructure
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
REDIS_URL=
```

---

## Getting Started

### Prerequisites
```bash
node >= 20.0.0
pnpm >= 9.0.0
```

### 1. Clone and install
```bash
git clone https://github.com/your-org/sari-saas.git
cd sari-saas
pnpm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your Supabase + integration credentials
```

### 3. Run database migrations
```bash
pnpm db:migrate
pnpm db:seed   # Optional: load sample data
```

### 4. Start development servers
```bash
# All services in parallel
pnpm dev

# Or individually
pnpm dev:web      # Next.js on http://localhost:3000
pnpm dev:api      # Fastify on http://localhost:3001
pnpm dev:mobile   # Expo on http://localhost:8081 + QR code
```

### 5. Mobile development (Expo)
```bash
# Install Expo Go on your test device (or Android emulator)
cd apps/mobile
npx expo start
# Scan QR code with Expo Go
```

---

## Design Token Reference

```typescript
// packages/core/src/constants/colors.ts
export const colors = {
  // Brand
  navy:        '#0F172A',   // App header background
  slate:       '#F8FAFC',   // Page background (minimizes glare)
  
  // Status
  critical:    '#DC2626',   // Stock depletion, urgent alerts
  warning:     '#D97706',   // Unverified payments
  success:     '#16A34A',   // Completed logistics, paid orders
  neutral:     '#64748B',   // Informational content
  
  // Borders
  border:      '#E2E8F0',   // Table borders, card outlines
  
  // Text
  textPrimary:  '#0F172A',
  textSecondary:'#64748B',
  textInverse:  '#F8FAFC',
}

// Minimum touch targets
export const spacing = {
  touchMin:    48,          // Standard links
  touchButton: 56,          // Primary action buttons
}
```

---

## Module Dependency Graph

```
apps/mobile ──────────────────────┐
apps/web   ────────────────────── ├──→ packages/core
apps/api   ─────→ packages/db ───┘       ↑
                                    packages/ui
```

- `packages/core` has **zero framework dependencies** — pure TypeScript
- `packages/ui` uses React primitives compatible with both React Native and React DOM
- `packages/db` is consumed only by `apps/api` (server-side only)
- Both `apps/mobile` and `apps/web` import from `packages/core` and `packages/ui`
