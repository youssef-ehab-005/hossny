import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/currency";
import { shippingCostFor, useShippingSettings } from "@/lib/useSiteSettings";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Shopping Bag — Off Track" }] }),
  component: CartPage,
});

function CartPage() {
  const { cartDetailed, cartTotal, updateQty, removeFromCart } = useStore();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const { shipping: shippingSettings } = useShippingSettings();

  const discount = applied ? cartTotal * 0.1 : 0;
  const shipping = cartTotal === 0 ? 0 : shippingCostFor(cartTotal, shippingSettings);
  const total = cartTotal - discount + shipping;

  if (cartDetailed.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-28 text-center">
        <ShoppingBag className="mx-auto h-14 w-14 text-muted-foreground" strokeWidth={1} />
        <h1 className="mt-6 font-display text-4xl">Your bag is empty</h1>
        <p className="mt-2 text-muted-foreground">Discover our latest arrivals and find something you love.</p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground px-8 py-3.5 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground"
        >
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="mb-8 font-display text-4xl">Shopping Bag</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y divide-border border-y border-border">
            {cartDetailed.map((line) => (
              <div key={line.key} className="flex gap-4 py-5">
                <Link to="/product/$id" params={{ id: line.product.id }}>
                  <img src={line.product.image} alt={line.product.name} className="h-32 w-26 rounded-lg object-cover" width={104} height={128} />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">{line.product.brand}</p>
                      <Link to="/product/$id" params={{ id: line.product.id }} className="font-medium hover:text-gold">
                        {line.product.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">Size {line.size} · <span className="capitalize">{line.color}</span></p>
                    </div>
                    <button onClick={() => removeFromCart(line.key)} aria-label="Remove">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-border">
                      <button className="grid h-9 w-9 place-items-center" onClick={() => updateQty(line.key, line.qty - 1)} aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-7 text-center text-sm">{line.qty}</span>
                      <button className="grid h-9 w-9 place-items-center" onClick={() => updateQty(line.key, line.qty + 1)} aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <span className="font-semibold">{formatPrice(line.product.price * line.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* summary */}
        <aside className="h-fit rounded-2xl border border-border bg-secondary/40 p-6">
          <h2 className="font-display text-2xl">Order Summary</h2>

          <div className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider">Coupon code</label>
              <div className="flex gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="OFFTRACK10" className="h-11 w-full bg-transparent text-sm outline-none" />
                </div>
                <button onClick={() => setApplied(coupon.trim().length > 0)} className="rounded-lg bg-foreground px-4 text-xs font-medium uppercase text-background">Apply</button>
              </div>
              {applied && <p className="mt-1.5 text-xs text-emerald-600">Coupon applied — 10% off</p>}
            </div>
            {shippingSettings.freeShippingLimit !== null && (
              <p className="self-end text-xs text-muted-foreground">
                Free shipping on orders over {formatPrice(shippingSettings.freeShippingLimit)}.
              </p>
            )}
          </div>

          <dl className="mt-6 space-y-2.5 border-t border-border pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-emerald-600"><dt>Discount</dt><dd>-{formatPrice(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd className="font-display text-xl">{formatPrice(total)}</dd></div>
          </dl>

          <Link to="/checkout" className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-foreground py-3.5 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground">
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
