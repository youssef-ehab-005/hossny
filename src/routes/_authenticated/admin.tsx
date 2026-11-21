import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  Moon,
  Sun,
  Store,
  Loader2,
  ShieldCheck,
  Tags,
  Users,
  Image,
  Settings,
} from "lucide-react";
import { Toaster } from "sonner";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/BrandMark";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Off Track" }] }),
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Dashboard", key: "admin.nav.dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", key: "admin.nav.products", icon: Package, exact: false },
  { to: "/admin/categories", label: "Categories", key: "admin.nav.categories", icon: Tags, exact: false },
  { to: "/admin/orders", label: "Orders", key: "admin.nav.orders", icon: ShoppingCart, exact: false },
  { to: "/admin/appearance", label: "Appearance", key: "admin.nav.appearance", icon: Image, exact: false },
  { to: "/admin/settings", label: "Store Settings", key: "admin.nav.settings", icon: Settings, exact: false },
  { to: "/admin/users", label: "Admins", key: "admin.nav.users", icon: Users, exact: false },
] as const;

function AdminLayout() {
  const { isAdmin, loading, user, refreshRole, signOut } = useAuth();
  const { t } = useI18n();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAdmin) {
    const claim = async () => {
      setClaiming(true);
      const { data, error } = await supabase.rpc("claim_first_admin");
      setClaiming(false);
      if (!error && data) {
        await refreshRole();
      } else {
        alert("An admin already exists. Ask the store owner to grant you access.");
      }
    };
    return (
      <div className="mx-auto max-w-md px-4 py-28 text-center">
        <ShieldCheck className="mx-auto h-14 w-14 text-gold" strokeWidth={1.2} />
        <h1 className="mt-6 font-display text-3xl">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You're signed in as {user?.email}, but this account isn't an administrator yet.
        </p>
        <button
          onClick={claim}
          disabled={claiming}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
        >
          {claiming && <Loader2 className="h-4 w-4 animate-spin" />} Become the store admin
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          This only works for the first owner while no admin exists.
        </p>
        <div className="mt-6">
          <Link to="/" className="text-sm text-gold link-underline">Back to store</Link>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login", replace: true });
  };

  const SidebarContent = (
    <nav className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2 border-b border-border px-5 py-4 font-display text-xl">
        <Store className="h-5 w-5 text-gold" /> <BrandMark className="font-display font-semibold" imgClassName="h-7 w-auto object-contain" />
      </Link>
      <div className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active ? "bg-gold/15 font-medium text-gold" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="h-4 w-4" /> {t(item.key)}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-border p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
        >
          <Store className="h-4 w-4" /> {t("admin.viewStore")}
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> {t("admin.signOut")}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <Toaster position="top-right" richColors />
      <aside className="hidden w-60 shrink-0 border-r border-border bg-background lg:block">
        {SidebarContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-background">{SidebarContent}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display text-lg">{t("admin.dashboard")}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <span className="hidden text-sm text-muted-foreground sm:block">{user?.email}</span>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-gold/20 text-xs font-semibold text-gold">
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
