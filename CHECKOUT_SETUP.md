# Off Track secure checkout setup

## Selected business rules

- Payment methods: Cash on Delivery (COD) and InstaPay proof review.
- Shipping: manually quoted by an admin after the order is placed.
- Checkout requires a signed-in customer.
- Customer-entered prices, totals, status and payment state are never accepted as authoritative.

## Apply the database migration

Run `supabase/migrations/20261121140000_secure_checkout_manual_shipping.sql` once in the Supabase SQL Editor for the Off Track project. It:

- Adds `customer_phone` and `stock_reserved` to orders.
- Creates a private `payment-proofs` bucket (5 MB limit; JPG/PNG/WEBP only).
- Adds owner-scoped upload/read policies and admin read/delete access.
- Revokes the public first-admin claim function.
- Adds `create_customer_order(...)`, which validates the signed-in user, cart, product status, variant, server-side active price/discount, expected subtotal, proof ownership, and stock; then reserves stock and creates an immutable item snapshot.
- Sets initial shipping to zero because the store will enter the fee manually.
- Restores reserved stock when an order is cancelled.
- Removes direct customer insert/update/delete privileges on orders; only the RPC can create orders, while RLS/admin policies control admin updates.

Do not rerun this migration after it succeeds. It is designed for the existing database state that was inspected during this project.

## Manual shipping workflow

1. Customer places order and sees product subtotal only.
2. Admin opens Admin > Orders and enters the shipping fee in EGP.
3. The admin screen saves `shipping` and sets `total = subtotal + shipping`.
4. For InstaPay, the current proof is for the product subtotal only. The store must communicate the shipping amount and arrange its collection separately. Do not mark payment as fully settled until the full amount has actually been received.

## Payment proof privacy

The database stores only the private Storage object path in `orders.payment_proof_image`, not a public URL. Admin order view requests a short-lived signed URL to display the proof. Never move these objects into the public `category-images` bucket.

## Important remaining release checks

- Test the migration in a staging Supabase project before production if this database contains real data.
- Create the first admin from a trusted Supabase Dashboard operation or a protected server-only service-role workflow. Never restore the public `claim_first_admin` grant.
- Confirm that the `SUPABASE_SERVICE_ROLE_KEY` exists only in server environment variables for admin user management; never expose it as `VITE_*`.
- Test COD and InstaPay with two concurrent orders for the final stock unit, invalid variants, changed prices, missing/foreign proof paths, cancellation/restock, and manual shipping updates.
- The current checkout requires login; guest checkout is not implemented.
- InstaPay proof is a customer-submitted image, not payment verification. An admin must verify the transaction independently.
