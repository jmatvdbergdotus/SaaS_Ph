-- ── Shipments ──────────────────────────────────────────────────────────────
CREATE TABLE shipments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id),
  provider            TEXT NOT NULL CHECK (provider IN ('LALAMOVE','GRABEXPRESS','JNT','NINJAVAN')),
  tracking_number     TEXT NOT NULL,
  waybill_url         TEXT,
  status              TEXT NOT NULL DEFAULT 'BOOKED'
    CHECK (status IN ('PENDING','BOOKED','PICKED_UP','IN_TRANSIT','DELIVERED','FAILED')),
  price               NUMERIC(12,2) NOT NULL,
  estimated_delivery  TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orders ADD CONSTRAINT fk_orders_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id);
