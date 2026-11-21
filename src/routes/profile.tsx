import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Account — Off Track" }] }),
  component: ProfilePage,
});

const tabs = [
  { key: "profile", label: "Profile", icon: User },
  { key: "orders", label: "Orders", icon: Package },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "cards", label: "Saved Cards", icon: CreditCard },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

const field = "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-gold";

function ProfilePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("profile");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">My Account</p>
        <h1 className="mt-1 font-display text-4xl">Hello, Amelia</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-border p-3">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                tab === key ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
          <Link to="/login" className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-destructive hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign out
          </Link>
        </aside>

        <section className="rounded-2xl border border-border p-6 md:p-8">
          {tab === "profile" && (
            <div>
              <h2 className="font-display text-2xl">Profile Details</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input defaultValue="Amelia" placeholder="First name" className={field} />
                <input defaultValue="Rossi" placeholder="Last name" className={field} />
                <input defaultValue="amelia@example.com" className={cn(field, "sm:col-span-2")} />
                <input defaultValue="+1 555 010 2030" className={cn(field, "sm:col-span-2")} />
              </div>
              <button className="mt-6 rounded-lg bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground">Save changes</button>
            </div>
          )}
          {tab === "orders" && (
            <div>
              <h2 className="font-display text-2xl">Recent Orders</h2>
              <div className="mt-6 space-y-3">
                {[
                  { id: "OT-284910", date: "Jul 2, 2026", total: 318, status: "Delivered" },
                  { id: "OT-284655", date: "Jun 18, 2026", total: 129, status: "In transit" },
                ].map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div>
                      <p className="font-medium">{o.id}</p>
                      <p className="text-xs text-muted-foreground">{o.date} · ${o.total}</p>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs", o.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600" : "bg-gold/10 text-gold")}>{o.status}</span>
                  </div>
                ))}
              </div>
              <Link to="/orders" className="mt-4 inline-block text-sm text-gold link-underline">View all orders</Link>
            </div>
          )}
          {tab === "wishlist" && (
            <div className="text-center">
              <h2 className="font-display text-2xl">Your Wishlist</h2>
              <p className="mt-2 text-sm text-muted-foreground">Your saved items live here.</p>
              <Link to="/wishlist" className="mt-4 inline-block rounded-lg bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-luxe text-background">Open wishlist</Link>
            </div>
          )}
          {tab === "addresses" && (
            <div>
              <h2 className="font-display text-2xl">Saved Addresses</h2>
              <div className="mt-6 rounded-xl border border-border p-4 text-sm">
                <p className="font-medium">Home</p>
                <p className="mt-1 text-muted-foreground">221B Baker Street, London, W1U 8ED, United Kingdom</p>
              </div>
              <button className="mt-4 rounded-lg border border-border px-6 py-3 text-xs font-medium uppercase tracking-luxe hover:border-gold">Add new address</button>
            </div>
          )}
          {tab === "cards" && (
            <div>
              <h2 className="font-display text-2xl">Saved Cards</h2>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-border p-4 text-sm">
                <CreditCard className="h-5 w-5 text-gold" />
                <span>Visa ending •••• 4242</span>
                <span className="ml-auto text-muted-foreground">12/28</span>
              </div>
            </div>
          )}
          {tab === "notifications" && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Notifications</h2>
              {["Order updates", "New arrivals", "Exclusive offers", "Price drops"].map((n) => (
                <label key={n} className="flex items-center justify-between rounded-xl border border-border p-4 text-sm">
                  {n}
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[oklch(0.735_0.086_82)]" />
                </label>
              ))}
            </div>
          )}
          {tab === "settings" && (
            <div>
              <h2 className="font-display text-2xl">Settings</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input placeholder="Current password" type="password" className={field} />
                <input placeholder="New password" type="password" className={cn(field, "sm:col-span-2")} />
              </div>
              <button className="mt-6 rounded-lg bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-luxe text-background">Update password</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
