# Sari-SaaS — Unified MSME Command Engine

A cross-platform commerce operating system for Filipino micro and small businesses.
Built for low-end Android devices, weak 3G networks, and non-technical merchants.

---

## What's Inside

```
sari-saas/
├── apps/
│   ├── mobile/   Expo React Native (Android + iOS)
│   ├── web/      Next.js 14 PWA (browser + installable)
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
| OTP login (SMS / GCash) | 🚧 Scaffold ready |
| Unified social commerce inbox (FB/TT/IG) | 🚧 Scaffold ready |
| GCash/Maya OCR screenshot reconciliation | 🚧 Scaffold ready |
| Order management with state machine | 🚧 Scaffold ready |
| Inventory tracking with low-stock alerts | 🚧 Scaffold ready |
| Offline-first with IndexedDB sync | 🚧 Scaffold ready |
| Xendit/Maya webhook integration | 🚧 Scaffold ready |
| Lalamove/GrabExpress/J&T/NinjaVan dispatch | 🚧 Scaffold ready |
| ITA-compliant receipt generation | 🚧 Scaffold ready |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo + React Native |
| Web | Next.js 14 (PWA) |
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
