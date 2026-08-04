-- ── Inventory Items ────────────────────────────────────────────────────────
CREATE TABLE inventory (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id           UUID NOT NULL REFERENCES stores(id),
  name               TEXT NOT NULL,
  sku                TEXT,
  current_stock      INTEGER NOT NULL DEFAULT 0,
  restock_threshold  INTEGER NOT NULL DEFAULT 5,
  unit_price         NUMERIC(12,2),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_store_id ON inventory(store_id);

-- ── Stock Movements ────────────────────────────────────────────────────────
CREATE TABLE stock_movements (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID NOT NULL REFERENCES inventory(id),
  order_id          UUID REFERENCES orders(id),
  type              TEXT NOT NULL
    CHECK (type IN ('SALE','RESTOCK','ADJUSTMENT','RESERVATION','RESERVATION_RELEASED')),
  quantity          INTEGER NOT NULL,
  previous_stock    INTEGER NOT NULL,
  new_stock         INTEGER NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Sync Queue ─────────────────────────────────────────────────────────────
CREATE TABLE sync_queue (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id         UUID NOT NULL REFERENCES stores(id),
  event_type       TEXT NOT NULL,
  entity_id        TEXT NOT NULL,
  payload          JSONB NOT NULL,
  local_timestamp  TIMESTAMPTZ NOT NULL,
  synced           BOOLEAN NOT NULL DEFAULT false,
  attempts         INTEGER NOT NULL DEFAULT 0,
  last_attempt_at  TIMESTAMPTZ,
  error            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
