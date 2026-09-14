ALTER TABLE public.stock_movements ADD COLUMN note text;

CREATE FUNCTION public.save_inventory_item(
  p_store_id uuid, p_item_id uuid, p_name text, p_sku text,
  p_price numeric, p_threshold integer, p_stock integer,
  p_kind text, p_note text, p_expected_updated_at timestamptz
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  item public.inventory;
  previous integer := 0;
  target integer;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.stores WHERE id = p_store_id AND owner_id = auth.uid()
  ) THEN RAISE EXCEPTION 'Store access denied'; END IF;
  IF p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 1 AND 160
    OR length(coalesce(p_sku, '')) > 80 OR length(coalesce(p_note, '')) > 500
    OR p_price IS NULL OR p_price < 0 OR p_price > 9999999999.99
    OR p_price <> round(p_price, 2) OR p_threshold IS NULL OR p_threshold < 0
    OR p_stock IS NULL OR p_kind IS NULL OR p_kind NOT IN ('DETAILS','RESTOCK','ADJUSTMENT')
  THEN RAISE EXCEPTION 'Invalid product values'; END IF;

  IF p_item_id IS NOT NULL THEN
    SELECT * INTO item FROM public.inventory
      WHERE id = p_item_id AND store_id = p_store_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product not found'; END IF;
    IF p_expected_updated_at IS DISTINCT FROM item.updated_at THEN
      RAISE EXCEPTION 'Product changed. Reload inventory before saving.';
    END IF;
    previous := item.current_stock;
    target := CASE WHEN p_kind = 'DETAILS' THEN previous
      WHEN p_kind = 'RESTOCK' THEN previous + p_stock ELSE p_stock END;
  ELSE
    IF p_kind <> 'DETAILS' THEN RAISE EXCEPTION 'Invalid initial stock action'; END IF;
    target := p_stock;
  END IF;
  IF target < 0 OR (p_kind = 'RESTOCK' AND p_stock <= 0) THEN
    RAISE EXCEPTION 'Stock cannot be negative; restock must be positive';
  END IF;
  IF p_item_id IS NULL THEN
    INSERT INTO public.inventory(store_id,name,sku,unit_price,restock_threshold,current_stock)
    VALUES(p_store_id,trim(p_name),nullif(trim(p_sku),''),p_price,p_threshold,target)
    RETURNING * INTO item;
  ELSE
    UPDATE public.inventory SET name=trim(p_name),sku=nullif(trim(p_sku),''),
      unit_price=p_price,restock_threshold=p_threshold,current_stock=target,
      updated_at=clock_timestamp() WHERE id=item.id RETURNING * INTO item;
  END IF;
  IF target <> previous THEN
    INSERT INTO public.stock_movements(inventory_item_id,type,quantity,previous_stock,new_stock,note)
    VALUES(item.id,CASE WHEN p_kind='RESTOCK' THEN 'RESTOCK' ELSE 'ADJUSTMENT' END,
      target-previous,previous,target,nullif(trim(p_note),''));
  END IF;
  RETURN item.id;
END;
$$;
REVOKE ALL ON FUNCTION public.save_inventory_item(uuid,uuid,text,text,numeric,integer,integer,text,text,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_inventory_item(uuid,uuid,text,text,numeric,integer,integer,text,text,timestamptz) TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.inventory FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.stock_movements FROM anon, authenticated;
