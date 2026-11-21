-- Secure checkout for Off Track: server-calculated prices, stock reservation,
-- customer phone, private InstaPay proofs, and admin-managed shipping fees.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_phone text,
  ADD COLUMN IF NOT EXISTS stock_reserved boolean NOT NULL DEFAULT false;

-- Payment proofs must not live in the public category-images bucket.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-proofs', 'payment-proofs', false, 5242880,
        ARRAY['image/jpeg','image/png','image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp']::text[];

DROP POLICY IF EXISTS "Customers upload own payment proofs" ON storage.objects;
CREATE POLICY "Customers upload own payment proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Customers read own payment proofs" ON storage.objects;
CREATE POLICY "Customers read own payment proofs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Customers delete unused own payment proofs" ON storage.objects;
CREATE POLICY "Customers delete unused own payment proofs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND NOT EXISTS (
    SELECT 1 FROM public.orders
    WHERE payment_proof_image = storage.objects.name
  )
);

DROP POLICY IF EXISTS "Admins delete payment proofs" ON storage.objects;
CREATE POLICY "Admins delete payment proofs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- No customer-facing first-admin claim. Provision the first admin from the
-- Supabase dashboard / trusted service-role environment instead.
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_customer_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_payment_method text,
  p_payment_proof_path text,
  p_expected_subtotal numeric,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_line jsonb;
  v_product public.products%ROWTYPE;
  v_inventory public.inventory%ROWTYPE;
  v_base_price numeric;
  v_unit_price numeric;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_shipping numeric := 0; -- Shipping is quoted and entered manually by an admin.
  v_total numeric;
  v_qty integer;
  v_size text;
  v_color text;
  v_price_found boolean;
  v_discount public.discounts%ROWTYPE;
  v_discount_found boolean;
  v_items_snapshot jsonb := '[]'::jsonb;
  v_order_id uuid;
  v_has_inventory boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF length(trim(coalesce(p_customer_name, ''))) < 2 THEN
    RAISE EXCEPTION 'Enter a valid customer name';
  END IF;
  IF length(trim(coalesce(p_customer_email, ''))) < 5 OR position('@' IN p_customer_email) = 0 THEN
    RAISE EXCEPTION 'Enter a valid email address';
  END IF;
  IF length(regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g')) < 8 THEN
    RAISE EXCEPTION 'Enter a valid phone number';
  END IF;
  IF length(trim(coalesce(p_shipping_address, ''))) < 5 THEN
    RAISE EXCEPTION 'Enter a complete shipping address';
  END IF;
  IF p_payment_method NOT IN ('cod', 'instapay') THEN
    RAISE EXCEPTION 'Unsupported payment method';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Your cart is empty or contains too many items';
  END IF;
  IF p_payment_method = 'instapay' THEN
    IF p_payment_proof_path IS NULL
       OR (storage.foldername(p_payment_proof_path))[1] <> v_uid::text
       OR p_payment_proof_path !~ ('^' || v_uid::text || '/[A-Za-z0-9_-]+[.](jpg|jpeg|png|webp)$') THEN
      RAISE EXCEPTION 'A valid private InstaPay proof upload is required';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM storage.objects
      WHERE bucket_id = 'payment-proofs' AND name = p_payment_proof_path
    ) THEN
      RAISE EXCEPTION 'Payment proof was not found';
    END IF;
  ELSIF p_payment_proof_path IS NOT NULL THEN
    RAISE EXCEPTION 'Cash on delivery must not include a payment proof';
  END IF;

  FOR v_line IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF coalesce(v_line->>'id','') !~* '^[0-9a-f-]{36}$' THEN
      RAISE EXCEPTION 'Invalid product in cart';
    END IF;
    v_qty := (v_line->>'qty')::integer;
    v_size := coalesce(v_line->>'size', '');
    v_color := coalesce(v_line->>'color', '');
    IF v_qty < 1 OR v_qty > 20 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_line->>'id')::uuid AND active = true
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'A product in your cart is unavailable';
    END IF;

    IF cardinality(v_product.sizes) > 0 AND NOT (v_size = ANY(v_product.sizes)) THEN
      RAISE EXCEPTION 'Selected size is unavailable for %', v_product.name;
    END IF;
    IF cardinality(v_product.colors) > 0 AND NOT (v_color = ANY(v_product.colors)) THEN
      RAISE EXCEPTION 'Selected color is unavailable for %', v_product.name;
    END IF;

    SELECT amount INTO v_base_price
    FROM public.prices
    WHERE product_id = v_product.id AND active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now())
    ORDER BY created_at DESC
    LIMIT 1;
    v_price_found := FOUND;
    IF NOT v_price_found THEN
      v_base_price := v_product.price;
    END IF;
    IF v_base_price IS NULL OR v_base_price < 0 THEN
      RAISE EXCEPTION 'Invalid product price for %', v_product.name;
    END IF;

    v_unit_price := v_base_price;
    SELECT * INTO v_discount
    FROM public.discounts
    WHERE active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now())
      AND (product_id = v_product.id OR (product_id IS NULL AND category_slug = v_product.category))
    ORDER BY (product_id IS NOT NULL) DESC, created_at DESC
    LIMIT 1;
    v_discount_found := FOUND;
    IF v_discount_found THEN
      IF v_discount.percent_off IS NOT NULL THEN
        IF v_discount.percent_off < 0 OR v_discount.percent_off > 100 THEN
          RAISE EXCEPTION 'Invalid discount configuration';
        END IF;
        v_unit_price := v_unit_price * (1 - v_discount.percent_off / 100);
      ELSIF v_discount.amount_off IS NOT NULL THEN
        v_unit_price := greatest(0, v_unit_price - v_discount.amount_off);
      END IF;
    END IF;
    v_unit_price := round(v_unit_price, 2);
    v_line_total := v_unit_price * v_qty;

    SELECT * INTO v_inventory
    FROM public.inventory
    WHERE product_id = v_product.id AND size = v_size AND color = v_color
    FOR UPDATE;
    IF FOUND THEN
      IF v_inventory.quantity < v_qty THEN
        RAISE EXCEPTION 'Insufficient stock for % (% / %)', v_product.name, v_size, v_color;
      END IF;
      UPDATE public.inventory SET quantity = quantity - v_qty WHERE id = v_inventory.id;
    ELSE
      SELECT EXISTS(SELECT 1 FROM public.inventory WHERE product_id = v_product.id) INTO v_has_inventory;
      IF v_has_inventory THEN
        RAISE EXCEPTION 'Selected variant is not available for %', v_product.name;
      END IF;
      IF v_product.stock < v_qty THEN
        RAISE EXCEPTION 'Insufficient stock for %', v_product.name;
      END IF;
      UPDATE public.products SET stock = stock - v_qty WHERE id = v_product.id;
    END IF;

    v_subtotal := v_subtotal + v_line_total;
    v_items_snapshot := v_items_snapshot || jsonb_build_array(jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'image', v_product.image,
      'price', v_unit_price,
      'qty', v_qty,
      'size', v_size,
      'color', v_color
    ));
  END LOOP;

  v_subtotal := round(v_subtotal, 2);
  IF p_expected_subtotal IS NULL OR abs(v_subtotal - p_expected_subtotal) > 0.02 THEN
    RAISE EXCEPTION 'Product prices changed. Please review your cart and try again.';
  END IF;
  v_total := v_subtotal + v_shipping;
  INSERT INTO public.orders (
    user_id, customer_name, customer_email, customer_phone, shipping_address,
    items, subtotal, shipping, total, status, payment_method, payment_status,
    payment_proof_image, stock_reserved
  ) VALUES (
    v_uid, trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone),
    trim(p_shipping_address), v_items_snapshot, v_subtotal, v_shipping, v_total,
    CASE WHEN p_payment_method = 'instapay' THEN 'payment_review' ELSE 'pending' END,
    p_payment_method,
    CASE WHEN p_payment_method = 'instapay' THEN 'review' ELSE 'pending' END,
    p_payment_proof_path,
    true
  ) RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'subtotal', v_subtotal,
    'shipping', v_shipping,
    'total', v_total,
    'shipping_pending', true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_customer_order(text,text,text,text,text,text,numeric,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_customer_order(text,text,text,text,text,text,numeric,jsonb) TO authenticated;

-- Restore reserved stock once if an order is cancelled.
CREATE OR REPLACE FUNCTION public.restore_cancelled_order_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' AND NEW.stock_reserved THEN
    FOR v_item IN SELECT value FROM jsonb_array_elements(NEW.items)
    LOOP
      UPDATE public.inventory
      SET quantity = quantity + (v_item->>'qty')::integer
      WHERE product_id = (v_item->>'id')::uuid
        AND size = coalesce(v_item->>'size','')
        AND color = coalesce(v_item->>'color','');
      IF NOT FOUND THEN
        UPDATE public.products
        SET stock = stock + (v_item->>'qty')::integer
        WHERE id = (v_item->>'id')::uuid;
      END IF;
    END LOOP;
    NEW.stock_reserved := false;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS restore_order_stock_on_cancel ON public.orders;
CREATE TRIGGER restore_order_stock_on_cancel
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.restore_cancelled_order_stock();
REVOKE ALL ON FUNCTION public.restore_cancelled_order_stock() FROM PUBLIC, anon, authenticated;

-- Prevent customers from directly inserting or editing order totals/status/payment fields.
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT UPDATE (status, payment_status, shipping, total) ON public.orders TO authenticated;
