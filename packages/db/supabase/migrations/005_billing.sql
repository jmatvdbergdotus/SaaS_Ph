-- ── Usage Events (per-order billing) ──────────────────────────────────────
CREATE TABLE usage_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id   UUID NOT NULL REFERENCES stores(id),
  order_id   UUID NOT NULL REFERENCES orders(id),
  event_type TEXT NOT NULL DEFAULT 'ORDER_FULFILLED',
  amount     NUMERIC(10,2) NOT NULL,
  currency   TEXT NOT NULL DEFAULT 'PHP',
  billed     BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Billing Records ────────────────────────────────────────────────────────
CREATE TABLE billing_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id         UUID NOT NULL REFERENCES stores(id),
  period_start     TIMESTAMPTZ NOT NULL,
  period_end       TIMESTAMPTZ NOT NULL,
  order_count      INTEGER NOT NULL,
  total_amount     NUMERIC(12,2) NOT NULL,
  payment_method   TEXT CHECK (payment_method IN ('GCASH','MAYA')),
  payment_status   TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (payment_status IN ('PENDING','PAID','FAILED')),
  payment_ref      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
