import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Check, Truck, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "My Orders — Off Track" }] }),
  component: OrdersPage,
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
  created_at: string;
  total: number;
  status: string;
  items: OrderItem[];
}

const steps = ["Ordered", "Processing", "Shipped", "Delivered"];
const statusStep: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 0,
};

function OrdersPage() {
  const { user, loading } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total, status, items")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((o) => ({
        ...o,
        total: Number(o.total),
        items: (o.items as unknown as OrderItem[]) ?? [],
      })) as Order[];
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-28 text-center">
        <Package className="mx-auto h-14 w-14 text-muted-foreground" strokeWidth={1} />
        <h1 className="mt-6 font-display text-4xl">Sign in to view orders</h1>
        <p className="mt-2 text-muted-foreground">Track your purchases and order history.</p>
        <Link
          to="/login"
          className="mt-8 inline-block rounded-lg bg-foreground px-8 py-3.5 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">Order History</p>
        <h1 className="mt-1 font-display text-4xl">My Orders</h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="rounded-2xl border border-border py-24 text-center">
          <p className="font-display text-2xl">No orders yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Your future orders will appear here.</p>
          <Link to="/shop" className="mt-6 inline-block text-sm text-gold link-underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => {
            const step = statusStep[o.status] ?? 0;
            return (
              <div key={o.id} className="rounded-2xl border border-border p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      <Package className="h-4 w-4" /> OT-{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Placed {new Date(o.created_at).toLocaleDateString()} · Total {formatPrice(o.total)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium capitalize",
                      o.status === "delivered"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : o.status === "shipped"
                          ? "bg-gold/10 text-gold"
                          : o.status === "cancelled"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground",
                    )}
                  >
                    {o.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                      {it.image && <img src={it.image} alt="" className="h-14 w-12 rounded object-cover" />}
                      <div className="pr-2 text-xs">
                        <p className="font-medium">{it.name}</p>
                        <p className="text-muted-foreground">Qty {it.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {o.status !== "cancelled" && (
                  <div className="mt-6 flex items-center">
                    {steps.map((s, i) => (
                      <div key={s} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "grid h-8 w-8 place-items-center rounded-full text-xs",
                              i <= step ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground",
                            )}
                          >
                            {i < step ? (
                              <Check className="h-4 w-4" />
                            ) : i === 2 ? (
                              <Truck className="h-4 w-4" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className="mt-1.5 text-[10px] text-muted-foreground">{s}</span>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={cn("mx-1 h-0.5 flex-1", i < step ? "bg-gold" : "bg-border")} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Link to="/shop" className="mt-8 inline-block text-sm text-gold link-underline">
        Continue shopping
      </Link>
    </div>
  );
}
