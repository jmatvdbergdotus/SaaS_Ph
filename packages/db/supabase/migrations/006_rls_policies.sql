-- Row Level Security policies
--
-- These policies assume public.users.id is created with the same UUID as auth.users.id.
-- When creating a profile row after signup, insert users.id = auth.uid().

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;

-- Users
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
CREATE POLICY "users_select_own_profile"
ON public.users
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON public.users;
CREATE POLICY "users_insert_own_profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
CREATE POLICY "users_update_own_profile"
ON public.users
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK (
  (SELECT auth.uid()) = id
  AND (
    store_id IS NULL
    OR store_id IN (
      SELECT stores.id
      FROM public.stores
      WHERE stores.owner_id = (SELECT auth.uid())
    )
  )
);

-- Stores
DROP POLICY IF EXISTS "stores_select_owned" ON public.stores;
CREATE POLICY "stores_select_owned"
ON public.stores
FOR SELECT
TO authenticated
USING (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "stores_insert_owned" ON public.stores;
CREATE POLICY "stores_insert_owned"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "stores_update_owned" ON public.stores;
CREATE POLICY "stores_update_owned"
ON public.stores
FOR UPDATE
TO authenticated
USING (owner_id = (SELECT auth.uid()))
WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "stores_delete_owned" ON public.stores;
CREATE POLICY "stores_delete_owned"
ON public.stores
FOR DELETE
TO authenticated
USING (owner_id = (SELECT auth.uid()));

-- Orders
DROP POLICY IF EXISTS "orders_select_owned_store" ON public.orders;
CREATE POLICY "orders_select_owned_store"
ON public.orders
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "orders_insert_owned_store" ON public.orders;
CREATE POLICY "orders_insert_owned_store"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "orders_update_owned_store" ON public.orders;
CREATE POLICY "orders_update_owned_store"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "orders_delete_owned_store" ON public.orders;
CREATE POLICY "orders_delete_owned_store"
ON public.orders
FOR DELETE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

-- Payments
DROP POLICY IF EXISTS "payments_select_owned_store" ON public.payments;
CREATE POLICY "payments_select_owned_store"
ON public.payments
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "payments_insert_owned_store" ON public.payments;
CREATE POLICY "payments_insert_owned_store"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "payments_update_owned_store" ON public.payments;
CREATE POLICY "payments_update_owned_store"
ON public.payments
FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

-- Message Threads
DROP POLICY IF EXISTS "message_threads_select_owned_store" ON public.message_threads;
CREATE POLICY "message_threads_select_owned_store"
ON public.message_threads
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "message_threads_insert_owned_store" ON public.message_threads;
CREATE POLICY "message_threads_insert_owned_store"
ON public.message_threads
FOR INSERT
TO authenticated
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "message_threads_update_owned_store" ON public.message_threads;
CREATE POLICY "message_threads_update_owned_store"
ON public.message_threads
FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "message_threads_delete_owned_store" ON public.message_threads;
CREATE POLICY "message_threads_delete_owned_store"
ON public.message_threads
FOR DELETE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

-- Messages
DROP POLICY IF EXISTS "messages_select_owned_store" ON public.messages;
CREATE POLICY "messages_select_owned_store"
ON public.messages
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "messages_insert_owned_store" ON public.messages;
CREATE POLICY "messages_insert_owned_store"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "messages_update_owned_store" ON public.messages;
CREATE POLICY "messages_update_owned_store"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "messages_delete_owned_store" ON public.messages;
CREATE POLICY "messages_delete_owned_store"
ON public.messages
FOR DELETE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

-- Inventory
DROP POLICY IF EXISTS "inventory_select_owned_store" ON public.inventory;
CREATE POLICY "inventory_select_owned_store"
ON public.inventory
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "inventory_insert_owned_store" ON public.inventory;
CREATE POLICY "inventory_insert_owned_store"
ON public.inventory
FOR INSERT
TO authenticated
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "inventory_update_owned_store" ON public.inventory;
CREATE POLICY "inventory_update_owned_store"
ON public.inventory
FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "inventory_delete_owned_store" ON public.inventory;
CREATE POLICY "inventory_delete_owned_store"
ON public.inventory
FOR DELETE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

-- Stock Movements
DROP POLICY IF EXISTS "stock_movements_select_owned_store" ON public.stock_movements;
CREATE POLICY "stock_movements_select_owned_store"
ON public.stock_movements
FOR SELECT
TO authenticated
USING (
  inventory_item_id IN (
    SELECT inventory.id
    FROM public.inventory
    WHERE inventory.store_id IN (
      SELECT stores.id
      FROM public.stores
      WHERE stores.owner_id = (SELECT auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "stock_movements_insert_owned_store" ON public.stock_movements;
CREATE POLICY "stock_movements_insert_owned_store"
ON public.stock_movements
FOR INSERT
TO authenticated
WITH CHECK (
  inventory_item_id IN (
    SELECT inventory.id
    FROM public.inventory
    WHERE inventory.store_id IN (
      SELECT stores.id
      FROM public.stores
      WHERE stores.owner_id = (SELECT auth.uid())
    )
  )
);

-- Sync Queue
DROP POLICY IF EXISTS "sync_queue_select_owned_store" ON public.sync_queue;
CREATE POLICY "sync_queue_select_owned_store"
ON public.sync_queue
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "sync_queue_insert_owned_store" ON public.sync_queue;
CREATE POLICY "sync_queue_insert_owned_store"
ON public.sync_queue
FOR INSERT
TO authenticated
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "sync_queue_update_owned_store" ON public.sync_queue;
CREATE POLICY "sync_queue_update_owned_store"
ON public.sync_queue
FOR UPDATE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "sync_queue_delete_owned_store" ON public.sync_queue;
CREATE POLICY "sync_queue_delete_owned_store"
ON public.sync_queue
FOR DELETE
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

-- Shipments
DROP POLICY IF EXISTS "shipments_select_owned_store" ON public.shipments;
CREATE POLICY "shipments_select_owned_store"
ON public.shipments
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT orders.id
    FROM public.orders
    WHERE orders.store_id IN (
      SELECT stores.id
      FROM public.stores
      WHERE stores.owner_id = (SELECT auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "shipments_insert_owned_store" ON public.shipments;
CREATE POLICY "shipments_insert_owned_store"
ON public.shipments
FOR INSERT
TO authenticated
WITH CHECK (
  order_id IN (
    SELECT orders.id
    FROM public.orders
    WHERE orders.store_id IN (
      SELECT stores.id
      FROM public.stores
      WHERE stores.owner_id = (SELECT auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "shipments_update_owned_store" ON public.shipments;
CREATE POLICY "shipments_update_owned_store"
ON public.shipments
FOR UPDATE
TO authenticated
USING (
  order_id IN (
    SELECT orders.id
    FROM public.orders
    WHERE orders.store_id IN (
      SELECT stores.id
      FROM public.stores
      WHERE stores.owner_id = (SELECT auth.uid())
    )
  )
)
WITH CHECK (
  order_id IN (
    SELECT orders.id
    FROM public.orders
    WHERE orders.store_id IN (
      SELECT stores.id
      FROM public.stores
      WHERE stores.owner_id = (SELECT auth.uid())
    )
  )
);

-- Usage Events
DROP POLICY IF EXISTS "usage_events_select_owned_store" ON public.usage_events;
CREATE POLICY "usage_events_select_owned_store"
ON public.usage_events
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);

-- Billing Records
DROP POLICY IF EXISTS "billing_records_select_owned_store" ON public.billing_records;
CREATE POLICY "billing_records_select_owned_store"
ON public.billing_records
FOR SELECT
TO authenticated
USING (
  store_id IN (
    SELECT stores.id
    FROM public.stores
    WHERE stores.owner_id = (SELECT auth.uid())
  )
);
