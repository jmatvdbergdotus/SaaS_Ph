# Sari-SaaS — Scrum Agile Planning & User Stories
### Sprint Backlog v1.0 · May 2026

---

## 1. Scrum Team Structure

| Role | Responsibility |
|---|---|
| **Product Owner** | Prioritizes backlog; owns roadmap and merchant-facing decisions |
| **Scrum Master** | Removes blockers; facilitates ceremonies; tracks velocity |
| **Frontend Engineer(s)** | Expo (mobile) + Next.js (web); shared UI components |
| **Backend Engineer(s)** | Fastify API; Supabase schema; webhook integrations |
| **Full-Stack Engineer(s)** | Offline sync engine; OCR pipeline; cross-cutting concerns |
| **QA Engineer** | Test coverage; device matrix testing; regression |
| **Designer** | UI/UX; high-contrast design system; Taglish copy |

---

## 2. Scrum Ceremonies

| Ceremony | Cadence | Duration |
|---|---|---|
| Sprint Planning | Start of each 2-week sprint | 2 hours |
| Daily Stand-up | Every working day | 15 minutes |
| Sprint Review | End of each sprint | 1 hour |
| Sprint Retrospective | End of each sprint | 45 minutes |
| Backlog Refinement | Mid-sprint | 1 hour |

**Sprint Length:** 2 weeks  
**Velocity Target (initial):** 40 story points per sprint  
**Definition of Done:** Feature tested on a 3GB Android device + Chrome browser; offline mode verified; no console errors; design system compliant

---

## 3. Epics Overview

| # | Epic | Phase | Priority |
|---|---|---|---|
| E1 | Authentication & Onboarding | Phase 1 | P0 |
| E2 | Offline-First Data Engine | Phase 1 | P0 |
| E3 | Unified Social Commerce Inbox | Phase 1 | P0 |
| E4 | Payment Reconciliation (OCR) | Phase 1 | P0 |
| E5 | Order Management | Phase 1 | P0 |
| E6 | Inventory Management | Phase 1 | P1 |
| E7 | Dashboard & Operational Status | Phase 1 | P1 |
| E8 | Webhook Payment Integration | Phase 2 | P1 |
| E9 | Logistics Orchestration | Phase 2 | P1 |
| E10 | ITA Compliance & Receipts | Phase 2 | P1 |
| E11 | Monetization & Billing | Phase 2 | P2 |
| E12 | DTI Trustmark & Merchant Profile | Phase 2 | P2 |
| E13 | AI Quick-Reply Assistant | Phase 2 | P2 |
| E14 | Analytics & Reporting | Phase 3 | P3 |

---

## 4. User Personas

### Persona A — Maria, Sari-Sari Store Owner
- Age 38, Cavite. Sells via Facebook Messenger and GCash.
- Uses a Realme C35 (3GB RAM). Prepaid Smart SIM.
- Pain points: Manually reads GCash screenshots to verify payments. Forgets to reply to DMs. No stock tracking system.

### Persona B — Nico, TikTok Live Seller
- Age 24, Cebu. Runs live selling sessions 3×/week. Uses Maya for payments.
- Pain points: Orders come in during live streams faster than he can track. Needs to book Lalamove after each session. No receipt generation.

### Persona C — Ate Leng, Home-Based Ulam Seller
- Age 45, Quezon City. Sells via Instagram DMs and Facebook.
- Pain points: Takes orders by hand in a notebook. No digital record. Worried about ITA compliance now that her neighbor got fined.

---

## 5. User Stories by Epic

---

### EPIC E1 — Authentication & Onboarding

**E1-US01** — OTP Login via SMS
> As **Maria**, I want to log in using my mobile number and a one-time PIN so that I never have to remember a password.

- Acceptance Criteria:
  - [ ] Enter 11-digit PH mobile number
  - [ ] Receive 6-digit OTP via SMS within 30 seconds
  - [ ] OTP expires after 5 minutes
  - [ ] JWT session created on successful validation
  - [ ] Works offline after first login (cached session)
- Story Points: 5
- Sprint: 1

**E1-US02** — OTP Login via GCash-Linked Number
> As **Nico**, I want to log in using my GCash-registered number so that I can use the same number I use for payments.

- Acceptance Criteria:
  - [ ] GCash number resolves via Xendit/Maya identity layer
  - [ ] Same OTP flow as SMS
  - [ ] Displayed as separate login option with GCash branding hint
- Story Points: 3
- Sprint: 1

**E1-US03** — Progressive Onboarding (Contextual Guided Tour)
> As **Ate Leng**, I want to be guided through my first actions in Taglish so that I know what to do without reading a manual.

- Acceptance Criteria:
  - [ ] First-time user sees inline Taglish prompts at each empty state
  - [ ] Prompts appear inline (not modal popups)
  - [ ] Example: *"Subukan natin: Pindutin ito para mag-add ng unang paninda mo."*
  - [ ] Advanced features (accounting) are hidden until 20 successful sales
  - [ ] Onboarding state persists in IndexedDB; survives app restart
- Story Points: 5
- Sprint: 2

**E1-US04** — Store Profile Setup
> As **Maria**, I want to register my store name and contact details during onboarding so that my receipts and compliance records are correct.

- Acceptance Criteria:
  - [ ] Fields: Store name, owner name, address, contact number, BIR TIN (optional at onboarding)
  - [ ] Data stored locally first; synced to server
  - [ ] Merchant can edit profile at any time from Settings
- Story Points: 3
- Sprint: 1

---

### EPIC E2 — Offline-First Data Engine

**E2-US01** — Local-First Write with IndexedDB
> As a **merchant**, I want all my actions (new orders, stock updates, chat replies) to be saved immediately even without internet so that I never lose data due to poor signal.

- Acceptance Criteria:
  - [ ] All writes go to IndexedDB first (<15ms latency target)
  - [ ] No network request blocks any user action
  - [ ] UI shows action as completed immediately after local write
- Story Points: 8
- Sprint: 1

**E2-US02** — Sync Queue with Background Retry
> As **Nico**, I want my changes to sync to the cloud automatically when my signal improves so that I don't have to manually push updates.

- Acceptance Criteria:
  - [ ] Sync queue batches all pending changes
  - [ ] Background service monitors network state (online/offline events)
  - [ ] Auto-triggers delta sync when network becomes stable
  - [ ] Sync status shown in app header (synced / syncing / offline)
  - [ ] Conflicts resolved with last-write-wins + timestamp
- Story Points: 8
- Sprint: 1

**E2-US03** — Network Status Indicator
> As **Maria**, I want to see a clear indicator in the app header when I'm offline so that I know my changes are being saved locally.

- Acceptance Criteria:
  - [ ] Header displays: 🟢 Synced / 🔄 Syncing / 🔴 Offline
  - [ ] Tapping indicator shows pending sync count
  - [ ] No disruptive banners; indicator is non-blocking
- Story Points: 2
- Sprint: 2

---

### EPIC E3 — Unified Social Commerce Inbox

**E3-US01** — Unified Multi-Channel Message Feed
> As **Nico**, I want to see all my Facebook, TikTok, and Instagram messages in one feed so that I stop missing orders while switching between apps.

- Acceptance Criteria:
  - [ ] Messages from Facebook Messenger, TikTok Shop, and Instagram DMs appear in one chronological stream
  - [ ] Each message shows channel badge (FB / TT / IG)
  - [ ] Unread count visible per channel and total
  - [ ] Feed refreshes in real-time when online; shows cached messages offline
  - [ ] Lazy-loaded (no virtualization library); smooth scroll on 3GB device
- Story Points: 13
- Sprint: 3

**E3-US02** — Reply to Customer from Unified Inbox
> As **Ate Leng**, I want to reply to a customer message directly from the app without opening Facebook or Instagram so that I save time.

- Acceptance Criteria:
  - [ ] Tap any message to open thread view
  - [ ] Text field + send button visible
  - [ ] Reply dispatched via appropriate channel API
  - [ ] Sent messages appear in thread with delivery confirmation
- Story Points: 8
- Sprint: 3

**E3-US03** — AI Taglish Quick Reply Suggestions
> As **Nico**, I want the app to suggest a quick Taglish reply based on the customer's message so that I can respond faster during live selling sessions.

- Acceptance Criteria:
  - [ ] 3 quick-reply suggestions shown below each unread message
  - [ ] Suggestions are context-aware (e.g., availability question → stock status + delivery offer)
  - [ ] One-tap to send; merchant can edit before sending
  - [ ] Works offline using cached templates; AI-enhanced when online
  - [ ] Example: *"Available pa po! Gusto mo po bang mag-order ngayon? 😊"*
- Story Points: 8
- Sprint: 5

**E3-US04** — Convert Conversation to Order
> As **Maria**, I want to create an order directly from a customer conversation so that I link the chat to the transaction.

- Acceptance Criteria:
  - [ ] "New Order" button visible in thread view
  - [ ] Pre-fills customer name from message sender
  - [ ] Order linked to original message thread
  - [ ] Customer receives auto-confirmation message (optional toggle)
- Story Points: 5
- Sprint: 4

---

### EPIC E4 — Payment Reconciliation (OCR)

**E4-US01** — Scan GCash / Maya Screenshot
> As **Maria**, I want to upload a GCash payment screenshot and have the app automatically find the matching order so that I stop manually reading reference numbers.

- Acceptance Criteria:
  - [ ] "Scan Screenshot" button accessible from Quick Action Zone and order detail
  - [ ] Opens device gallery or camera
  - [ ] Client-side Tesseract.js OCR extracts: amount, reference number, timestamp
  - [ ] Extraction completes within 150ms on target device
  - [ ] App shows extracted fields for confirmation before matching
  - [ ] All processing done on-device; no image transmitted to server
- Story Points: 13
- Sprint: 2

**E4-US02** — Auto-Match Payment to Open Order
> As **Maria**, I want the app to automatically match a scanned payment to the right open order so that I don't have to search manually.

- Acceptance Criteria:
  - [ ] Fuzzy match on amount + reference number against open orders
  - [ ] Shows top 3 best-guess matches if exact match not found
  - [ ] Merchant confirms match with one tap
  - [ ] Order status updates to "Paid" on confirmation
  - [ ] Fulfillment trigger fires (courier booking prompt)
- Story Points: 8
- Sprint: 2

**E4-US03** — Manual Payment Marking
> As **Ate Leng**, I want to manually mark an order as paid with a cash note so that I can track offline/in-person transactions too.

- Acceptance Criteria:
  - [ ] "Mark as Paid" option on any Pending order
  - [ ] Payment method dropdown: GCash / Maya / Cash / Other
  - [ ] Optional reference number field
  - [ ] Audit log entry created with timestamp and method
- Story Points: 3
- Sprint: 2

---

### EPIC E5 — Order Management

**E5-US01** — Create New Sale / Order Manually
> As **Ate Leng**, I want to enter a new sale quickly from the home screen so that I can log an order even when a customer orders by voice.

- Acceptance Criteria:
  - [ ] "Bagong Benta" quick action on home screen
  - [ ] Fields: Item(s), quantity, price, customer name (optional), payment method
  - [ ] Saves to local ledger in <1 second
  - [ ] Order appears in Orders list with status "Pending Payment"
- Story Points: 5
- Sprint: 2

**E5-US02** — View Order List with Status Filters
> As **Nico**, I want to filter my orders by status (Pending, Paid, Dispatched, Completed) so that I know exactly what needs action right now.

- Acceptance Criteria:
  - [ ] Orders tab with status filter pills at top
  - [ ] Default view: Pending Payment (highest urgency)
  - [ ] Each order card shows: customer name, amount, channel, elapsed time, status badge
  - [ ] Loads from local IndexedDB; no network required
- Story Points: 5
- Sprint: 2

**E5-US03** — Order Detail View
> As **Maria**, I want to open an order and see all its details, payment status, and linked messages so that I have full context in one place.

- Acceptance Criteria:
  - [ ] Order detail shows: items, total, timestamps, payment info, linked messages, shipment status
  - [ ] Actions available based on state: Mark Paid / Book Rider / Generate Receipt / Mark Complete
  - [ ] State transitions update both local and remote state
- Story Points: 5
- Sprint: 3

**E5-US04** — Auto-Generate ITA-Compliant Receipt
> As **Ate Leng**, I want a digital receipt to be automatically generated when an order is marked paid so that I'm ITA-compliant without extra work.

- Acceptance Criteria:
  - [ ] Receipt auto-generated on "Paid" state transition
  - [ ] Contains: merchant name, DTI registration, transaction amount, reference number, timestamp, item list, consumer disclosure
  - [ ] Shareable as image or PDF
  - [ ] Optionally sent to customer via chat channel
- Story Points: 8
- Sprint: 5

---

### EPIC E6 — Inventory Management

**E6-US01** — Add Inventory Item
> As **Maria**, I want to add items to my inventory with stock levels so that the app can warn me before I run out.

- Acceptance Criteria:
  - [ ] Add item: name, current stock, restock threshold
  - [ ] No image upload required (text-first)
  - [ ] Saves locally first
- Story Points: 3
- Sprint: 3

**E6-US02** — View Inventory as High-Contrast Table
> As **Maria**, I want to see all my stock levels in a simple table with color-coded status so that I can check it in seconds.

- Acceptance Criteria:
  - [ ] Table columns: Item Name, Current Stock, Buffer Status
  - [ ] Status colors: 🔴 Critical (<threshold), 🟡 Restock Soon (≤2x threshold), 🟢 Stable
  - [ ] No thumbnails; text-only rows
  - [ ] Loads from IndexedDB; instant render
- Story Points: 3
- Sprint: 3

**E6-US03** — Automatic Stock Deduction on Order
> As **Nico**, I want my stock levels to decrease automatically when an order is created so that my inventory is always accurate.

- Acceptance Criteria:
  - [ ] Order creation triggers inventory reservation
  - [ ] Reservation confirmed on "Paid" → stock deducted
  - [ ] Reservation released on "Cancelled"
  - [ ] Low stock warning badge appears on dashboard card when any item hits threshold
- Story Points: 5
- Sprint: 4

**E6-US04** — Low Stock Dashboard Alert
> As **Maria**, I want to see a prominent warning on my home screen when any item is critically low so that I can restock before I run out.

- Acceptance Criteria:
  - [ ] "Low Stock Warning" operational status card on dashboard
  - [ ] Shows count of critical items
  - [ ] "View →" taps directly to filtered inventory list
  - [ ] Alert persists until stock is updated
- Story Points: 2
- Sprint: 4

---

### EPIC E7 — Dashboard & Operational Status

**E7-US01** — Home Dashboard with Operational Status Cards
> As **Nico**, I want to see the most urgent tasks the moment I open the app so that I never miss a pending payment or low-stock warning.

- Acceptance Criteria:
  - [ ] Dashboard renders in <2 seconds from IndexedDB
  - [ ] Status cards show: Pending Reconciliation count, Low Stock count, Active Shipments
  - [ ] Each card has a "Fix Now" or "View" CTA
  - [ ] Cards update in real-time when online; from cache when offline
- Story Points: 8
- Sprint: 2

**E7-US02** — Daily Sales Summary
> As **Ate Leng**, I want to see how much I've sold today at a glance so that I know if it's been a good day.

- Acceptance Criteria:
  - [ ] Today's total revenue (Paid orders) shown at top of dashboard
  - [ ] Order count for the day
  - [ ] Comparison to yesterday (optional, Phase 3)
- Story Points: 3
- Sprint: 4

---

### EPIC E8 — Webhook Payment Integration

**E8-US01** — Xendit Webhook Integration for GCash / Maya
> As a **developer**, I want to receive signed Xendit payment webhooks so that payments are confirmed in real-time without merchant action.

- Acceptance Criteria:
  - [ ] Webhook endpoint accepts Xendit HMAC-signed payloads
  - [ ] Signature validation rejects unsigned requests
  - [ ] Parsed: amount, reference, merchant ID, payment method
  - [ ] Matched against open orders; triggers state transition to "Paid"
  - [ ] Idempotent: duplicate webhook ignored if order already Paid
- Story Points: 8
- Sprint: 6

**E8-US02** — Maya Business Webhook Integration
> As a **developer**, I want Maya Business webhooks to process Maya wallet payments identically to GCash so merchants have one consistent reconciliation flow.

- Acceptance Criteria:
  - [ ] Maya webhook endpoint with separate signing secret
  - [ ] Same order-matching and state-transition logic as Xendit
  - [ ] Merchant dashboard shows payment channel badge (GCash / Maya)
- Story Points: 5
- Sprint: 6

---

### EPIC E9 — Logistics Orchestration

**E9-US01** — Fetch Real-Time Courier Quotes
> As **Nico**, I want to see delivery price quotes from Lalamove and GrabExpress before booking so that I can choose the best option.

- Acceptance Criteria:
  - [ ] "Book Rider" button on Paid order
  - [ ] Fetches quotes from Lalamove API + GrabExpress API in parallel
  - [ ] Shows: courier name, ETA, price, vehicle type
  - [ ] Results returned in <3 seconds
- Story Points: 8
- Sprint: 7

**E9-US02** — Book Rider with One Tap
> As **Maria**, I want to confirm a rider booking with one tap so that I can dispatch orders quickly.

- Acceptance Criteria:
  - [ ] Select courier from quote list → tap "Confirm Booking"
  - [ ] Booking confirmation and tracking number returned
  - [ ] Order status updates to "Dispatched"
  - [ ] Tracking link added to order detail
- Story Points: 5
- Sprint: 7

**E9-US03** — Provincial Courier Booking (J&T / Ninja Van)
> As **Ate Leng**, I want to book J&T Express for provincial deliveries and get a waybill so that I can ship outside Metro Manila.

- Acceptance Criteria:
  - [ ] J&T and Ninja Van appear in courier options for non-Metro addresses
  - [ ] Waybill generated as PDF
  - [ ] Shareable waybill from order detail
- Story Points: 8
- Sprint: 7

---

### EPIC E10 — ITA Compliance & Receipts

**E10-US01** — DTI Trustmark Merchant Onboarding
> As **Ate Leng**, I want to submit my business registration details during setup so that I can get a DTI Trustmark badge on my checkout links.

- Acceptance Criteria:
  - [ ] Onboarding step for: DTI registration number, business address, business type
  - [ ] Trustmark verification API integration
  - [ ] Badge displayed on public checkout link once verified
- Story Points: 8
- Sprint: 8

**E10-US02** — BIR e-Invoice Ready Receipt Hook
> As a **merchant**, I want my receipts to be formatted for BIR e-invoicing compliance so that I'm ready for full digital tax reporting.

- Acceptance Criteria:
  - [ ] Receipt template includes TIN field (optional at onboarding, required at Scale tier)
  - [ ] Receipt format follows BIR e-invoice schema
  - [ ] Exportable as JSON for BIR submission
- Story Points: 5
- Sprint: 8

---

### EPIC E11 — Monetization & Billing

**E11-US01** — Usage-Based Billing via Maya Wallet
> As a **merchant on the Growth tier**, I want my per-order fee to be automatically deducted from my Maya wallet so that I never miss a payment and don't need a credit card.

- Acceptance Criteria:
  - [ ] Maya Business auto-deduction configured on account creation
  - [ ] Fee deducted per fulfilled order at current rate
  - [ ] Billing history visible in Settings > Billing
  - [ ] Low-balance warning when wallet falls below 3 orders' worth of fees
- Story Points: 8
- Sprint: 8

**E11-US02** — Free Tier Enforcement (50 Order Cap)
> As a **merchant on the Free tier**, I want to see how many of my 50 free orders I've used so that I can plan my upgrade.

- Acceptance Criteria:
  - [ ] Usage counter visible in Settings > Plan
  - [ ] Warning at 40 orders: "10 free orders remaining"
  - [ ] At 50 orders: prompt to upgrade; new orders blocked until upgrade or next month
  - [ ] Counter resets on 1st of each month
- Story Points: 3
- Sprint: 9

---

### EPIC E12 — Analytics & Reporting (Phase 3)

**E12-US01** — Weekly Sales Summary
> As **Nico**, I want to see a weekly summary of my sales, top items, and top channels so that I can make better decisions about where to focus.

- Acceptance Criteria:
  - [ ] Sales total by day (bar chart)
  - [ ] Top 5 items by revenue
  - [ ] Revenue by channel (Facebook / TikTok / Instagram / Direct)
  - [ ] Exportable as CSV
- Story Points: 8
- Sprint: 10

---

## 6. Sprint Plan (6-Month Roadmap)

### Phase 1 — Core System (Sprints 1–6, Months 1–3)

| Sprint | Focus | Key Stories | Points |
|---|---|---|---|
| **Sprint 1** | Foundation | E2-US01, E2-US02, E1-US01, E1-US04 | 24 |
| **Sprint 2** | OCR + Orders | E4-US01, E4-US02, E4-US03, E5-US01, E5-US02, E2-US03, E7-US01 | 41 |
| **Sprint 3** | Inbox + Inventory | E3-US01, E3-US02, E5-US03, E6-US01, E6-US02 | 37 |
| **Sprint 4** | Inventory Logic + Dashboard | E6-US03, E6-US04, E3-US04, E7-US02 | 15 |
| **Sprint 5** | AI Replies + Receipts | E3-US03, E5-US04, E1-US03 | 21 |
| **Sprint 6** | Payment Webhooks | E8-US01, E8-US02 | 13 |

### Phase 2 — Infrastructure Integration (Sprints 7–9, Months 4–5)

| Sprint | Focus | Key Stories | Points |
|---|---|---|---|
| **Sprint 7** | Logistics | E9-US01, E9-US02, E9-US03 | 21 |
| **Sprint 8** | Compliance + Billing | E10-US01, E10-US02, E11-US01 | 21 |
| **Sprint 9** | Billing Polish | E11-US02 + bug fixes + performance | 20 |

### Phase 3 — GTM + Analytics (Sprints 10–12, Month 6)

| Sprint | Focus | Key Stories | Points |
|---|---|---|---|
| **Sprint 10** | Analytics | E12-US01 | 15 |
| **Sprint 11** | Performance pass | Load testing, A/B onboarding, low-end device QA | 20 |
| **Sprint 12** | GTM Readiness | DTI partnership flow, batch onboarding tools | 15 |

---

## 7. Non-Functional Requirements (NFRs) as Acceptance Criteria

These apply to every story across all sprints:

| NFR | Requirement | Verification |
|---|---|---|
| Performance | Initial load < 80KB; renders in <2s on 3GB Android | Lighthouse CI on each PR |
| Offline | All core workflows usable without network | Automated offline test suite |
| Accessibility | Touch targets ≥ 48px; contrast ratio ≥ 4.5:1 | axe-core in CI |
| Localization | All merchant-facing copy in Filipino/Taglish available | i18n key audit per sprint |
| Security | No payment screenshots stored on server | OCR integration test + network log audit |
| Device QA | Each sprint tested on Realme C35 or equivalent | Manual device test checklist |
