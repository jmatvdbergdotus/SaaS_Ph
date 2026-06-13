-- Development seed data
INSERT INTO users (id, phone_number) VALUES
  ('00000000-0000-0000-0000-000000000001', '+639171234567');

INSERT INTO stores (id, owner_id, name, owner_name, address, contact_number, plan) VALUES
  ('00000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000001',
   'Maria Store', 'Maria Santos',
   '123 Kamuning Rd, Quezon City',
   '+639171234567', 'FREE');

UPDATE users SET store_id = '00000000-0000-0000-0000-000000000010'
WHERE id = '00000000-0000-0000-0000-000000000001';

INSERT INTO inventory (store_id, name, current_stock, restock_threshold, unit_price) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Lucky Me Pancit Canton', 4, 10, 15.00),
  ('00000000-0000-0000-0000-000000000010', 'Coca-Cola 1L', 18, 6, 55.00),
  ('00000000-0000-0000-0000-000000000010', 'Rice 5kg', 2, 5, 320.00);

INSERT INTO orders (store_id, customer_name, channel, items, total_amount, status) VALUES
  ('00000000-0000-0000-0000-000000000010',
   'Juana Dela Cruz', 'FACEBOOK',
   '[{"id":"item-1","name":"Lucky Me Pancit Canton","quantity":3,"unitPrice":15,"subtotal":45}]',
   45.00, 'PENDING_PAYMENT');
