-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users (merchants) ──────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number  TEXT UNIQUE NOT NULL,
  store_id      UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- ── Stores ─────────────────────────────────────────────────────────────────
CREATE TABLE stores (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                UUID NOT NULL REFERENCES users(id),
  name                    TEXT NOT NULL,
  owner_name              TEXT NOT NULL,
  address                 TEXT,
  contact_number          TEXT NOT NULL,
  dti_registration_number TEXT,
  bir_tin                 TEXT,
  trustmark_verified      BOOLEAN NOT NULL DEFAULT false,
  trustmark_badge_url     TEXT,
  plan                    TEXT NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'GROWTH', 'SCALE')),
  monthly_order_count     INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD CONSTRAINT fk_users_store FOREIGN KEY (store_id) REFERENCES stores(id);

-- ── Orders ─────────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id             UUID NOT NULL REFERENCES stores(id),
  customer_name        TEXT,
  customer_contact     TEXT,
  channel              TEXT NOT NULL CHECK (channel IN ('FACEBOOK','TIKTOK','INSTAGRAM','DIRECT','WALK_IN')),
  items                JSONB NOT NULL DEFAULT '[]',
  total_amount         NUMERIC(12,2) NOT NULL,
  status               TEXT NOT NULL DEFAULT 'NEW'
    CHECK (status IN ('NEW','PENDING_PAYMENT','PAID','DISPATCHED','COMPLETED','CANCELLED')),
  payment_method       TEXT CHECK (payment_method IN ('GCASH','MAYA','CASH','QR_PH','OTHER')),
  payment_reference    TEXT,
  payment_verified_at  TIMESTAMPTZ,
  message_thread_id    UUID,
  shipment_id          UUID,
  receipt_url          TEXT,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ── Payments ───────────────────────────────────────────────────────────────
CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID REFERENCES orders(id),
  store_id         UUID NOT NULL REFERENCES stores(id),
  provider         TEXT NOT NULL CHECK (provider IN ('XENDIT','MAYA','GCASH_DIRECT','CASH')),
  reference_number TEXT,
  amount           NUMERIC(12,2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'PHP',
  status           TEXT NOT NULL CHECK (status IN ('PENDING','VERIFIED','REJECTED')),
  webhook_payload  JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
