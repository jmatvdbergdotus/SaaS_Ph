-- ── Message Threads ────────────────────────────────────────────────────────
CREATE TABLE message_threads (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id         UUID NOT NULL REFERENCES stores(id),
  channel          TEXT NOT NULL CHECK (channel IN ('FACEBOOK','TIKTOK','INSTAGRAM','GCASH','MAYA')),
  customer_name    TEXT,
  customer_id      TEXT,
  last_message     TEXT,
  last_message_at  TIMESTAMPTZ,
  unread_count     INTEGER NOT NULL DEFAULT 0,
  linked_order_id  UUID REFERENCES orders(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Messages ───────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id        UUID NOT NULL REFERENCES message_threads(id),
  store_id         UUID NOT NULL REFERENCES stores(id),
  channel          TEXT NOT NULL,
  direction        TEXT NOT NULL CHECK (direction IN ('INBOUND','OUTBOUND')),
  sender_name      TEXT,
  sender_id        TEXT,
  body             TEXT NOT NULL,
  attachments      JSONB DEFAULT '[]',
  is_read          BOOLEAN NOT NULL DEFAULT false,
  linked_order_id  UUID REFERENCES orders(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_store_id ON messages(store_id);
ALTER TABLE orders ADD CONSTRAINT fk_orders_thread FOREIGN KEY (message_thread_id) REFERENCES message_threads(id);
