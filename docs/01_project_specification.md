# Sari-SaaS — Unified MSME Command Engine
### Project Specification v1.1 · May 2026

---

## 1. Executive Summary

**Sari-SaaS** is a cross-platform, mobile-first commerce operating system purpose-built for Filipino micro, small, and medium enterprises (MSMEs). It unifies social commerce messaging, payment reconciliation, logistics orchestration, and compliance-ready transaction workflows into a single lightweight application accessible on both web browsers and Android/iOS mobile devices.

The platform is engineered around one core constraint: it must work reliably on a ₱4,000 Android phone with prepaid mobile data and intermittent connectivity — because that is the reality of 77% of its target users.

---

## 2. Market Context & Rationale

### 2.1 The Opportunity

| Metric | Value |
|---|---|
| Philippine digital economy size | $40 billion |
| Digital payment share of retail transactions | 57.4% monthly |
| Projected social commerce volume | $28.77 billion |
| MSMEs wanting digital tools | 77% |
| MSMEs actually implementing them | **16%** |

The gap between intent and adoption is the business. Sari-SaaS closes it.

### 2.2 The SME Investment Paradox

Filipino merchants are selling through Facebook Live, TikTok Shop, and Instagram DMs in large numbers — but managing orders in notebooks, confirming payments by manually reading GCash screenshots, and booking riders through separate apps. The cost is not money; it is time, errors, and missed orders.

Structural barriers preventing adoption of existing tools:

- Complex software learning curves designed for desktop, not thumbs
- Low credit card penetration making Western SaaS billing inaccessible
- Fragmented multi-channel order management with no single source of truth
- Manual payment screenshot verification that does not scale past 20 orders/day
- Uncoordinated logistics requiring separate app switching per courier

### 2.3 Regulatory Tailwind

The Internet Transactions Act (ITA) now mandates merchant accountability, consumer transparency, and digital transaction traceability. This creates a compliance forcing function: merchants who do not digitize face legal exposure. Sari-SaaS makes ITA compliance automatic, not an added burden.

---

## 3. Product Vision

> **Sari-SaaS is not a dashboard. It is the operating system for the next generation of Filipino social commerce merchants — from the sari-sari store owner in Cavite to the TikTok Live seller in Cebu.**

The platform succeeds not by replacing the infrastructure merchants already use (GCash, Lalamove, Facebook Messenger), but by orchestrating it into a single coherent workflow that runs on the phone already in their pocket.

---

## 4. Technical & Environmental Constraints

These are non-negotiable design boundaries, not aspirational targets.

### 4.1 Performance Budget

| Constraint | Requirement |
|---|---|
| Maximum initial bundle size | 80 KB |
| Target device | 3 GB RAM Android (e.g. Realme C-series) |
| Network environment | Weak 3G / unstable prepaid data |
| Maximum API response time | 300 ms average |
| Maximum local write latency | 15 ms (IndexedDB) |
| OCR parsing time | ≤ 150 ms on-device |
| UI animation ceiling | 150 ms max transition |

### 4.2 Offline-First Mandate

The application must be fully operational without a network connection. Connectivity is an enhancement, not a requirement.

- All state writes go to **IndexedDB first**
- A sync queue batches pending changes in the background
- Auto-recovery triggers when network state improves from `cellular-weak` → `stable`
- Delta synchronization (not full-state upload) conserves bandwidth

### 4.3 UI/UX Hard Constraints

- **No custom web fonts.** System fonts only: `system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
- **No glassmorphism, no heavy drop shadows, no animated transitions > 150 ms**
- **No heavy component UI libraries** (no MUI, no Chakra)
- **Text-first interface.** Icons supplement; they do not replace labels
- Minimum touch target: **48 px** for links, **56 px** for primary action buttons
- High-contrast palette for outdoor/bright-screen readability

---

## 5. Core Functional Requirements

### 5.1 Module 1 — Multi-Channel Social Commerce Sync

**Goal:** One inbox. All channels. Zero tab-switching.

Aggregate customer conversations from:
- Facebook Messenger (Meta Webhooks)
- TikTok Shop (TikTok API)
- Instagram Direct Messages (Meta Graph API)

Into a single unified vertical feed ordered by recency and urgency.

**Localization:** Embed an AI assistant trained to produce Taglish quick-replies, conversational sales prompts, and delivery coordination responses.

> Example auto-draft: *"Available pa po, Ma'am! Deliver via Lalamove today? 🛵"*

**Compliance:** Auto-generate ITA-compliant digital receipts per transaction, including merchant registry details, transaction summary, and consumer disclosure.

---

### 5.2 Module 2 — Zero-Leakage Payment Reconciliation

**Goal:** Eliminate the GCash screenshot verification bottleneck entirely.

**Client-Side OCR Engine (Tesseract.js)**
1. Merchant uploads or shares a GCash / Maya payment screenshot
2. On-device OCR extracts: transaction amount, timestamp, reference number
3. System fuzzy-matches against open orders
4. Order status auto-updates to **Paid**
5. Fulfillment API trigger fires automatically

All OCR processing executes locally — no server round-trip, no cloud compute cost, no data privacy risk from uploading customer payment screenshots.

**Webhook Path (for direct integrations):**
- Xendit / Maya webhooks provide signed payment events
- Server validates signature → parses payload → matches open order → triggers fulfillment

---

### 5.3 Module 3 — Hyper-Local Logistics Integrated Checkout

**Goal:** Book a rider without leaving the app.

Embed dynamic shipping calculators directly in shareable checkout links:
- Real-time delivery quotes from multiple couriers
- Traffic-aware pricing
- Multi-rider dispatch
- Inter-island routing

**Supported logistics categories:** motorcycle fleets (Lalamove, GrabExpress), intra-city couriers, provincial logistics (J&T Express, Ninja Van).

**Courier booking automation:**
1. Order marked Paid
2. Fetch quotes from all available couriers
3. Present cheapest / fastest to merchant (or auto-select by preset rule)
4. Book rider
5. Push tracking updates to unified feed

---

## 6. Platform Architecture

### 6.1 Cross-Platform Approach

Sari-SaaS ships on three surfaces from a single monorepo:

| Surface | Technology | Notes |
|---|---|---|
| Mobile (Android/iOS) | Expo React Native | Primary surface; offline-first; camera access for OCR |
| Web (PWA) | Next.js | Full feature parity; installable; works on desktop browsers |
| Backend API | Fastify (Node.js) | Stateless; edge-deployed; <300ms response target |

### 6.2 Integration Ecosystem

| Category | Provider | Purpose |
|---|---|---|
| Payment Gateway | Xendit, Brankas | GCash / Maya / QR Ph webhook aggregation |
| Wallet Billing | Maya Business Manager | Cardless subscription + auto-deduction |
| Same-Day Courier | Lalamove, GrabExpress | Intra-city fulfillment |
| Provincial Courier | J&T Express, Ninja Van | Inter-island logistics + waybill generation |
| Compliance | DTI E-Commerce Trustmark | Merchant onboarding + ITA readiness |
| Compliance | BIR e-Invoicing | Receipt generation hooks |

### 6.3 Infrastructure Stack

| Layer | Technology |
|---|---|
| Edge Hosting | Cloudflare Pages + Workers |
| API Runtime | Fly.io (primary) / Cloudflare Workers |
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime (WebSockets) |
| Object Storage | Cloudflare R2 |
| Cache / Queues | Redis (Upstash) |
| Monitoring | Grafana + Loki |
| CDN | Cloudflare |

### 6.4 Authentication

OTP-only authentication — no passwords.
- OTP via SMS
- OTP via GCash-linked phone number
- JWT session tokens with refresh rotation
- Device session revocation support

---

## 7. Data Architecture

### 7.1 Storage Layers

| Layer | Technology | Purpose |
|---|---|---|
| Client Offline | IndexedDB + Dexie.js | All local writes; sync queue |
| Relational | Supabase PostgreSQL | Transactions, orders, inventory |
| Cache | Redis (Upstash) | Sessions, realtime queues |
| Object Storage | Cloudflare R2 | Receipt screenshots, export files |

### 7.2 Core Database Schema (Simplified)

```
users           → Merchant profiles + auth
stores          → Business records + DTI metadata
orders          → Commerce transactions + state machine
payments        → Reconciliation states + references
messages        → Unified chat records (all channels)
inventory       → Stock levels + velocity thresholds
shipments       → Logistics tracking + waybills
sync_queue      → Offline mutation log
```

### 7.3 Order State Machine

```
NEW ORDER → PENDING PAYMENT → PAID → DISPATCHED → COMPLETED
                                  ↘ CANCELLED
```

---

## 8. Security Architecture

- JWT authentication with signed tokens
- Encrypted payment reference fields at rest
- Signed webhook validation (HMAC-SHA256)
- Device session revocation
- Rate-limited APIs (per merchant, per endpoint)
- No payment screenshot data transmitted to servers (client-side OCR only)

### 8.1 Compliance Targets

- DTI E-Commerce Trustmark onboarding flow
- ITA transaction transparency (auto-generated receipts)
- BIR e-invoicing readiness hooks

---

## 9. Monetization Strategy

### 9.1 Why Western SaaS Billing Fails Here

| Problem | Impact |
|---|---|
| Credit card required for subscription | Excludes ~70% of target merchants |
| Monthly billing friction | Increases churn among informal sellers |
| Fixed monthly fee regardless of sales | Creates perceived risk for new adopters |

### 9.2 Recommended Model: Hybrid Usage-Based

| Tier | Eligibility | Price |
|---|---|---|
| **Free** | < 50 fulfilled orders/month | ₱0 |
| **Growth** | 50–500 orders/month | ₱5–10 per fulfilled order |
| **Scale** | > 500 orders/month | Negotiated flat monthly (auto-deducted via Maya/GCash) |

Billing mechanism: GCash auto-deduction or Maya wallet — no card required.

---

## 10. Implementation Roadmap

### Phase 1 — Core System (Months 1–3)
- Offline-first web + mobile application shell
- Local OCR parsing engine (Tesseract.js)
- Unified social commerce inbox (Facebook, TikTok, Instagram)
- IndexedDB sync engine
- Basic order management + inventory tracking
- OTP authentication

### Phase 2 — Infrastructure Integration (Months 4–5)
- Xendit webhook integration
- Maya Business billing integration
- Lalamove + GrabExpress dispatch APIs
- J&T + Ninja Van shipment APIs
- ITA receipt generation
- DTI Trustmark onboarding flow

### Phase 3 — Regional Go-To-Market (Month 6)
- Partner with DTI regional offices
- Digital literacy caravan participation
- Merchant cluster batch onboarding
- Performance monitoring + cost optimization pass

---

## 11. Competitive Differentiation

Sari-SaaS does not compete with enterprise ERP systems. It competes with the merchant's current workflow: notebooks, separate apps, and manual GCash reading. Against that baseline:

| Capability | Current (Manual) | Sari-SaaS |
|---|---|---|
| Order confirmation | Screenshot + chat | Automated OCR + webhook |
| Payment verification | Manual reading | < 150 ms on-device |
| Rider booking | Separate app | In-app, auto-quoted |
| ITA compliance | Manual receipts | Auto-generated |
| Multi-channel inbox | 3–5 separate apps | Unified feed |
| Offline capability | N/A | Full offline-first |

---

## 12. Strategic Conclusion

Sari-SaaS earns its position by doing one thing its competitors cannot: it is designed from the ground up for the device, the network, the language, and the payment infrastructure of the Filipino MSME. Every constraint in this document is a feature, not a limitation — because removing those constraints would mean building something that does not work for the people who need it most.

The long-term strategic path is to become the **commerce operating layer** for Filipino social commerce — the invisible infrastructure that makes a sari-sari store run as smoothly as a Shopify merchant without any of the Shopify prerequisites.
