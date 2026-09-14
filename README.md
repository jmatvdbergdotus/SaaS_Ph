# Sari-SaaS — Unified MSME Command Engine

A cross-platform commerce operating system for Filipino micro and small businesses.
Built for low-end Android devices, weak 3G networks, and non-technical merchants.

---

## What's Inside

```
sari-saas/
├── apps/
│   ├── mobile/   Expo React Native (Android + iOS)
│   ├── web/      Next.js 15 PWA (browser + installable)
│   └── api/      Fastify Node.js backend
└── packages/
    ├── core/     Shared types, business logic, utils
    ├── ui/       Shared design tokens
    └── db/       Supabase schema & migrations
```

---

## Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm@9`)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in Supabase, payment, and courier credentials
```

### 3. Run database migrations
```bash
pnpm db:migrate
pnpm db:seed   # optional sample data
```

### 4. Start development
```bash
pnpm dev              # all services in parallel
pnpm dev:web          # Next.js → http://localhost:3000
pnpm dev:api          # Fastify → http://localhost:3001
pnpm dev:mobile       # Expo → scan QR with Expo Go
```

---

## Core Features

| Feature | Status |
|---|---|
| Email magic-link authentication and onboarding | Implemented foundation |
| Dashboard, English/Tagalog UI, and inactivity sign-out | Implemented foundation |
| Facebook, Instagram, and TikTok Shop connections | Secure connection foundation |
| WooCommerce and Shopify connections | Secure connection foundation |
| Signed, deduplicated channel webhook intake | Implemented; event processing pending |
| Order management with state machine | Read/list foundation; full workflow pending |
| Inventory tracking with low-stock alerts | Add/edit, restock, corrections, history implemented; migration 013 required |
| Offline-first with IndexedDB sync | Data scaffold; end-to-end sync pending |
| GCash/Maya OCR screenshot reconciliation | Scaffold only |
| Xendit/Maya webhook integration | Scaffold only |
| Lalamove/GrabExpress/J&T/NinjaVan dispatch | Scaffold only |
| ITA-compliant receipt generation | Scaffold only |

The current development milestone is channel synchronization. Provider
authorization, encrypted credential storage, callback validation, and webhook
queueing are present. Provider events are not yet converted into local orders,
inventory movements, or message threads.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo + React Native |
| Web | Next.js 15 (PWA) |
| API | Fastify (Node.js) |
| Shared Logic | TypeScript (zero framework deps) |
| Database | Supabase PostgreSQL |
| Offline Storage | IndexedDB + Dexie.js |
| OCR | Tesseract.js (client-side) |
| Realtime | Supabase Realtime |
| Hosting | Cloudflare Pages + Fly.io |
| Monorepo | Turborepo + pnpm |

---

## Architecture Decisions

See `docs/adr/` for Architecture Decision Records explaining key choices:
- Why Turborepo
- Why Expo over bare React Native
- Why IndexedDB-first
- Why client-side OCR

See `docs/04_channel_integrations.md` for the Facebook, Instagram, TikTok Shop,
WooCommerce, and Shopify connection setup.

---

## Deployment

**API** → Fly.io (Singapore region, closest to PH)
```bash
fly deploy --config apps/api/fly.toml
```

**Web** → Cloudflare Pages
```bash
pnpm build
# Deploy apps/web/.next via Cloudflare Pages dashboard or wrangler
```

**Mobile** → Expo EAS Build
```bash
cd apps/mobile
eas build --platform android --profile preview
```

---

## License

Private. All rights reserved.
