import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Check, Truck, Wallet, Lock, PartyPopper, Loader2, Smartphone, ImagePlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { useBrandName } from "@/components/BrandMark";
import {
  EGYPT_GOVERNORATES,
  useInstapaySettings,
  useShippingSettings,
  useSiteSettings,
  shippingRatesFromSettings,
} from "@/lib/useSiteSettings";
import { ACCEPTED_IMAGE_TYPES, uploadImageToStorage } from "@/lib/storage-upload";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Off Track" }] }),
  component: CheckoutPage,
});

type PaymentMethod = "cod" | "instapay";

function CheckoutPage() {
  const { cartDetailed, cartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const brandName = useBrandName();
  const { shipping: shippingSettings } = useShippingSettings();
  const { settings: siteSettings } = useSiteSettings();
  const [governorate, setGovernorate] = useState("");
  const shippingRates = shippingRatesFromSettings(siteSettings);
  const { instapay } = useInstapaySettings();

  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [done, setDone] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const proofInput = useRef<HTMLInputElement>(null);

  const shipping = governorate ? (shippingRates[governorate] ?? shippingSettings.shippingPrice) : 0;
  const total = cartTotal + shipping;

  const onPickProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      setError("Only JPG, JPEG, PNG and WEBP images are allowed.");
      return;
    }
    setError(null);
    setProofFile(selected);
    setProofPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (payment === "instapay" && !proofFile) {
      setError("Please upload a screenshot of your InstaPay payment.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const name = `${fd.get("firstName") ?? ""} ${fd.get("lastName") ?? ""}`.trim();
    const addr = [fd.get("address"), governorate].filter(Boolean).join(", ");
    const items = cartDetailed.map((l) => ({
      id: l.product.id,
      name: l.product.name,
      image: l.product.image,
      price: l.product.price,
      qty: l.qty,
      size: l.size,
      color: l.color,
    }));
    setSubmitting(true);
    try {
      let proofUrl: string | null = null;
      if (payment === "instapay" && proofFile) {
        proofUrl = await uploadImageToStorage(proofFile, "payment-proofs");
      }
      const { data, error: insertError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: name,
          customer_email: String(fd.get("email") ?? user.email ?? ""),
          shipping_address: addr,
          items,
          subtotal: cartTotal,
          shipping,
          total,
          status: payment === "instapay" ? "payment_review" : "pending",
          payment_method: payment,
          payment_status: payment === "instapay" ? "review" : "pending",
          payment_proof_image: proofUrl,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;
      setOrderNo(data.id.slice(0, 8).toUpperCase());
      clearCart();
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-lg px-4 py-28 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold/15 text-gold">
          <PartyPopper className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-4xl">Order Confirmed</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for shopping with {brandName}. Your order is being reviewed and prepared with care.
        </p>
        <p className="mt-4 text-sm">Order #OT-{orderNo}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/orders" className="rounded-lg bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground">Track order</Link>
          <Link to="/shop" className="rounded-lg border border-border px-6 py-3 text-xs font-medium uppercase tracking-luxe hover:border-gold">Keep shopping</Link>
        </div>
      </motion.div>
    );
  }

  if (cartDetailed.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-28 text-center">
        <h1 className="font-display text-3xl">Your bag is empty</h1>
        <Link to="/shop" className="mt-6 inline-block rounded-lg bg-foreground px-8 py-3.5 text-xs font-medium uppercase tracking-luxe text-background">Shop now</Link>
      </div>
    );
  }

  const field = "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-gold";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="mb-8 font-display text-4xl">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {error && (
            <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>
          )}
          {!user && (
            <p className="rounded-lg bg-gold/10 px-4 py-2.5 text-sm text-gold">
              Please <Link to="/login" className="link-underline font-medium">sign in</Link> to place your order.
            </p>
          )}
          {/* shipping */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-display text-2xl"><Truck className="h-5 w-5" /> Shipping Address</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required name="firstName" placeholder="First name" className={field} />
              <input required name="lastName" placeholder="Last name" className={field} />
              <input required name="email" type="email" placeholder="Email" className={cn(field, "sm:col-span-2")} />
              <input required name="address" placeholder="Address" className={cn(field, "sm:col-span-2")} />
              <select
                required
                name="city"
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className={cn(field, "sm:col-span-2")}
              >
                <option value="">Select governorate</option>
                {EGYPT_GOVERNORATES.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
              {governorate && (
                <p className="sm:col-span-2 text-sm text-muted-foreground">
                  Shipping to {governorate}: {formatPrice(shipping)}
                </p>
              )}
              <input required name="phone" placeholder="Phone" className={cn(field, "sm:col-span-2")} />
            </div>
          </section>

          {/* payment */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-display text-2xl"><Lock className="h-5 w-5" /> Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "cod", label: "Cash on Delivery", icon: Wallet },
                { key: "instapay", label: "InstaPay", icon: Smartphone },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPayment(key as PaymentMethod)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                    payment === key ? "border-gold bg-gold/5" : "border-border",
                  )}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            {payment === "cod" && (
              <p className="mt-4 rounded-lg bg-secondary/60 p-4 text-sm text-muted-foreground">
                Pay in cash when your order is delivered.
              </p>
            )}

            {payment === "instapay" && (
              <div className="mt-5 space-y-4 rounded-2xl border border-border bg-secondary/40 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Account name</p>
                    <p className="mt-1 text-sm font-medium">{instapay.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">InstaPay number</p>
                    <p className="mt-1 text-sm font-medium">{instapay.number || "—"}</p>
                  </div>
                </div>
                {instapay.instructions && (
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{instapay.instructions}</p>
                )}
                <p className="text-sm">
                  Amount to pay: <span className="font-display text-xl">{formatPrice(total)}</span>
                </p>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Payment screenshot (required)
                  </p>
                  <input
                    ref={proofInput}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={onPickProof}
                  />
                  {proofPreview ? (
                    <div className="space-y-2">
                      <img src={proofPreview} alt="Payment proof preview" className="max-h-56 rounded-lg border border-border object-contain" />
                      <button type="button" onClick={() => proofInput.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-luxe hover:border-gold hover:text-gold">
                        <ImagePlus className="h-4 w-4" /> Change screenshot
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => proofInput.current?.click()} className="flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-xs text-muted-foreground hover:border-gold hover:text-gold">
                      <ImagePlus className="h-5 w-5" /> Upload payment screenshot
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* summary */}
        <aside className="h-fit rounded-2xl border border-border bg-secondary/40 p-6">
          <h2 className="mb-4 font-display text-2xl">Order Summary</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {cartDetailed.map((l) => (
              <div key={l.key} className="flex gap-3">
                <img src={l.product.image} alt="" className="h-16 w-14 rounded object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{l.product.name}</p>
                  <p className="text-xs text-muted-foreground">{l.size} · Qty {l.qty}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(l.product.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd className="font-display text-xl">{formatPrice(total)}</dd></div>
          </dl>
          <button type="submit" disabled={submitting} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-3.5 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Place Order
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><Lock className="h-3 w-3" /> Secure checkout with {brandName}</p>
        </aside>
      </form>
    </div>
  );
}
