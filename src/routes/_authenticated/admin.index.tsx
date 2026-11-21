import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, DollarSign, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

interface OrderRow {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [{ count: productCount }, ordersRes] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("id, customer_name, total, status, created_at").order("created_at", { ascending: false }),
      ]);
      const orders = (ordersRes.data ?? []) as OrderRow[];
      const revenue = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + Number(o.total), 0);
      const pending = orders.filter((o) => o.status === "pending").length;
      return { productCount: productCount ?? 0, orders, revenue, pending };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const stats = [
    { label: "Products", value: data?.productCount ?? 0, icon: Package },
    { label: "Orders", value: data?.orders.length ?? 0, icon: ShoppingCart },
    { label: "Revenue", value: formatPrice(data?.revenue ?? 0), icon: DollarSign },
    { label: "Pending", value: data?.pending ?? 0, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of your store performance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-luxe text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-3 font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-medium">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs text-gold link-underline">View all</Link>
        </div>
        {(!data?.orders || data.orders.length === 0) ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.orders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">OT-{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.customer_name || "Guest"} · {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="capitalize text-muted-foreground">{o.status}</span>
                  <span className="font-semibold">${Number(o.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
