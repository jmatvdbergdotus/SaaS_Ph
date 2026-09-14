-- Run only in an empty disposable PostgreSQL database using psql -v ON_ERROR_STOP=1.
CREATE EXTENSION "uuid-ossp";
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
$$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE TABLE public.stores(id uuid PRIMARY KEY, owner_id uuid);
CREATE TABLE public.orders(id uuid PRIMARY KEY);
\ir ../supabase/migrations/003_inventory.sql
\ir ../supabase/migrations/013_inventory_management.sql
INSERT INTO stores VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002');
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false);
DO $$
DECLARE product uuid; stamp timestamptz; count_rows integer; stock integer;
BEGIN
  product := public.save_inventory_item('00000000-0000-0000-0000-000000000001',null,'Rice','RICE',50,5,10,'DETAILS','Opening',null);
  SELECT updated_at INTO stamp FROM inventory WHERE id=product;
  PERFORM public.save_inventory_item('00000000-0000-0000-0000-000000000001',product,'Rice','RICE',50,5,3,'RESTOCK','Delivery',stamp);
  SELECT current_stock INTO stock FROM inventory WHERE id=product;
  IF stock <> 13 THEN RAISE EXCEPTION 'Restock failed'; END IF;
  BEGIN
    PERFORM public.save_inventory_item('00000000-0000-0000-0000-000000000001',product,'Rice','RICE',50,5,3,'RESTOCK','Retry',stamp);
    RAISE EXCEPTION 'Stale write accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE 'Product changed.%' THEN RAISE; END IF;
  END;
  SELECT updated_at INTO stamp FROM inventory WHERE id=product;
  PERFORM public.save_inventory_item('00000000-0000-0000-0000-000000000001',product,'Rice','RICE',50,5,7,'ADJUSTMENT','Count correction',stamp);
  SELECT count(*) INTO count_rows FROM stock_movements WHERE inventory_item_id=product;
  IF count_rows <> 3 THEN RAISE EXCEPTION 'Missing history'; END IF;
  SELECT updated_at INTO stamp FROM inventory WHERE id=product;
  BEGIN
    PERFORM public.save_inventory_item('00000000-0000-0000-0000-000000000001',product,'Rice','RICE',50,5,-1,'ADJUSTMENT','Invalid',stamp);
    RAISE EXCEPTION 'Negative stock accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE 'Stock cannot%' THEN RAISE; END IF;
  END;
  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000099',true);
  BEGIN
    PERFORM public.save_inventory_item('00000000-0000-0000-0000-000000000001',product,'Stolen','',1,0,0,'DETAILS','',stamp);
    RAISE EXCEPTION 'Cross-store access accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'Store access denied' THEN RAISE; END IF;
  END;
  IF has_table_privilege('authenticated','public.inventory','UPDATE')
     OR has_table_privilege('authenticated','public.stock_movements','INSERT')
     OR has_function_privilege('anon','public.save_inventory_item(uuid,uuid,text,text,numeric,integer,integer,text,text,timestamptz)','EXECUTE')
  THEN RAISE EXCEPTION 'Unexpected direct access'; END IF;
END $$;
SELECT 'Inventory transaction and authorization checks passed' AS result;
