import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

interface OrderItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
}
interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  created_at: string;
  payment_method: string;
  payment_status: string;
  payment_proof_image: string | null;
}

const statuses = [
  "pending",
  "payment_review",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusLabel = (value: string) => value.replace(/_/g, " ");

const paymentMethodLabel = (value: string) =>
  value === "instapay" ? "InstaPay" : value === "cod" ? "Cash on Delivery" : value;

function AdminOrders() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((o) => ({
        ...o,
        items: (o.items as unknown as OrderItem[]) ?? [],
      })) as Order[];
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const { error } = await supabase
        .from("orders")
        .update(
          approve
            ? { payment_status: "approved", status: "paid" }
            : { payment_status: "rejected", status: "cancelled" },
        )
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success(vars.approve ? "Payment approved" : "Payment rejected");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Order status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="text-sm text-muted-foreground">Review orders and update their fulfilment status.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((o) => (
              <div key={o.id}>
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                  <button
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    className="flex items-center gap-2 text-left"
                  >
                    {expanded === o.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <div>
                      <p className="text-sm font-medium">OT-{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customer_name || "Guest"} · {new Date(o.created_at).toLocaleString()} ·{" "}
                        {paymentMethodLabel(o.payment_method)} · <span className="capitalize">{statusLabel(o.payment_status)}</span>
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatPrice(Number(o.total))}</span>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                      className={cn(
                        "rounded-lg border border-border bg-background px-3 py-1.5 text-xs capitalize outline-none",
                      )}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s} className="capitalize">{statusLabel(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {expanded === o.id && (
                  <div className="border-t border-border bg-secondary/30 px-4 py-4 text-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Customer</p>
                        <p>{o.customer_name || "—"}</p>
                        <p className="text-muted-foreground">{o.customer_email || "—"}</p>
                        <p className="mt-1 text-muted-foreground">{o.shipping_address || "—"}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Totals</p>
                        <p>Subtotal: {formatPrice(Number(o.subtotal))}</p>
                        <p>Shipping: {Number(o.shipping) === 0 ? "Free" : formatPrice(Number(o.shipping))}</p>
                        <p className="font-semibold">Total: {formatPrice(Number(o.total))}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Payment</p>
                      <p>Method: {paymentMethodLabel(o.payment_method)}</p>
                      <p className="capitalize">Status: {statusLabel(o.payment_status)}</p>
                      {o.payment_proof_image ? (
                        <a href={o.payment_proof_image} target="_blank" rel="noreferrer" className="mt-2 inline-block">
                          <img
                            src={o.payment_proof_image}
                            alt="Payment screenshot"
                            className="max-h-56 rounded-lg border border-border object-contain"
                          />
                        </a>
                      ) : (
                        <p className="text-muted-foreground">No payment screenshot uploaded.</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updatePayment.mutate({ id: o.id, approve: true })}
                          disabled={updatePayment.isPending}
                          className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
                        >
                          Approve payment
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePayment.mutate({ id: o.id, approve: false })}
                          disabled={updatePayment.isPending}
                          className="rounded-lg border border-border px-4 py-2 text-xs font-medium uppercase tracking-luxe hover:border-destructive hover:text-destructive disabled:opacity-60"
                        >
                          Reject payment
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Items</p>
                      <div className="space-y-2">
                        {o.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {it.image && <img src={it.image} alt="" className="h-12 w-10 rounded object-cover" />}
                            <div className="flex-1">
                              <p className="font-medium">{it.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {[it.size, it.color].filter(Boolean).join(" · ")} · Qty {it.qty}
                              </p>
                            </div>
                            <span>{formatPrice(Number(it.price) * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
