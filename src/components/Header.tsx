import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Moon, Search, Sun, User, X, Mic, LayoutDashboard, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { useProducts } from "@/lib/useProducts";
import { useCategories } from "@/lib/useCategories";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { BrandMark } from "@/components/BrandMark";
import { useShippingSettings } from "@/lib/useSiteSettings";

export function Header() {
  const { cartCount, setCartOpen, wishlist } = useStore();
  const { products } = useProducts();
  const { categories } = useCategories();
  const { user, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const { lang, toggleLang, t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const { shipping: shippingSettings } = useShippingSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const results = query
    ? products
        .filter((p) => (p.name + p.brand).toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6)
    : [];

  return (
    <>
      {/* announcement bar */}
      <div className="bg-foreground text-background">
        <div className="overflow-hidden whitespace-nowrap py-2 text-[11px] uppercase tracking-luxe">
          <div className="flex w-max animate-marquee">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="flex">
                {shippingSettings.freeShippingLimit !== null && (
                  <>
                    <span className="px-8">
                      Free shipping over {formatPrice(shippingSettings.freeShippingLimit)}
                    </span>
                    <span className="px-8 text-gold">·</span>
                  </>
                )}
                <span className="px-8">New Collection AW26 now live</span>
                <span className="px-8 text-gold">·</span>
                <span className="px-8">Complimentary returns within 30 days</span>
                <span className="px-8 text-gold">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled ? "glass shadow-sm" : "bg-background",
        )}
        onMouseLeave={() => setActive(null)}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <button
            className="lg:hidden"
            onClick={() => setMobile(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            {categories.map((item) => (
              <div key={item.slug} onMouseEnter={() => setActive(item.slug)}>
                <Link
                  to="/category/$slug"
                  params={{ slug: item.slug }}
                  className="link-underline text-xs font-medium uppercase tracking-wider"
                  activeProps={{ className: "text-gold" }}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>


          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 font-display text-2xl font-semibold tracking-tight md:text-[26px]"
          >
            <BrandMark className="font-display font-semibold" imgClassName="h-8 md:h-9 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setSearch(true)} aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button onClick={toggle} aria-label="Toggle theme" className="hidden sm:block">
              {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <button
              onClick={toggleLang}
              aria-label="Change language"
              title={lang === "en" ? "التبديل إلى العربية" : "Switch to English"}
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider hover:text-gold"
            >
              <Globe className="h-[18px] w-[18px]" />
              <span>{lang === "en" ? "AR" : "EN"}</span>
            </button>
            <Link to="/wishlist" className="relative" aria-label="Wishlist">
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-gold-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link to="/admin" aria-label="Admin dashboard" title="Admin">
                <LayoutDashboard className="h-[18px] w-[18px] text-gold" />
              </Link>
            )}
            <Link to={user ? "/profile" : "/login"} aria-label="Account">
              <User className="h-[18px] w-[18px]" />
            </Link>
            <button onClick={() => setCartOpen(true)} className="relative" aria-label="Open cart">
              <ShoppingBagIcon />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-gold-foreground">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* mega menu */}
        <AnimatePresence>
          {active && categories.some((c) => c.slug === active) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute inset-x-0 top-full hidden border-t border-border glass lg:block"
              onMouseEnter={() => setActive(active)}
            >
              {(() => {
                const activeCat = categories.find((c) => c.slug === active)!;
                const cols = Array.from(
                  new Set(
                    products
                      .filter((p) => p.category === activeCat.slug)
                      .map((p) => p.brand)
                      .filter(Boolean),
                  ),
                ).slice(0, 6);
                return (
                  <div className="mx-auto grid max-w-7xl grid-cols-4 gap-8 px-8 py-8">
                    <div className="col-span-1 space-y-3">
                      <p className="font-display text-3xl">{activeCat.label}</p>
                      <p className="text-sm text-muted-foreground">
                        Discover the {activeCat.label} collection — refined essentials for the modern wardrobe.
                      </p>
                      <Link
                        to="/category/$slug"
                        params={{ slug: activeCat.slug }}
                        className="inline-block text-xs font-medium uppercase tracking-luxe text-gold link-underline"
                      >
                        {t("header.shopAllCollection")}
                      </Link>
                    </div>
                    <div className="col-span-3 grid grid-cols-3 gap-y-2.5">
                      {cols.map((c) => (
                        <Link
                          key={c}
                          to="/category/$slug"
                          params={{ slug: activeCat.slug }}
                          className="text-sm text-muted-foreground transition-colors hover:text-gold"
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

        </AnimatePresence>
      </header>

      {/* search overlay */}
      <AnimatePresence>
        {search && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm"
            onClick={() => setSearch(false)}
          >
            <motion.div
              initial={{ y: -40 }}
              animate={{ y: 0 }}
              exit={{ y: -40 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-auto max-w-2xl bg-background p-6 shadow-xl md:mt-24 md:rounded-2xl"
            >
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("header.search")}
                  className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                />
                <button aria-label="Voice search" className="text-muted-foreground hover:text-gold">
                  <Mic className="h-5 w-5" />
                </button>
                <button onClick={() => setSearch(false)} aria-label="Close search">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {!query && (
                <div className="pt-4">
                  <p className="mb-2 text-[11px] uppercase tracking-luxe text-muted-foreground">
                    {t("header.popular")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(products.map((p) => p.name).filter(Boolean))).slice(0, 5).map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-gold hover:text-gold"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {results.length > 0 && (
                <div className="max-h-80 space-y-1 overflow-y-auto pt-3">
                  {results.map((p) => (
                    <Link
                      key={p.id}
                      to="/product/$id"
                      params={{ id: p.id }}
                      onClick={() => setSearch(false)}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
                    >
                      <img src={p.image} alt="" className="h-14 w-12 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">
                          {p.brand}
                        </p>
                        <p className="text-sm">{p.name}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mobile nav */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobile(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-[90] flex h-full w-80 max-w-[85%] flex-col bg-background p-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl">{t("header.menu")}</span>
                <button onClick={() => setMobile(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-6 flex flex-col gap-1">
                {categories.map((item) => (
                  <Link
                    key={item.slug}
                    to="/category/$slug"
                    params={{ slug: item.slug }}
                    onClick={() => setMobile(false)}
                    className="border-b border-border py-3 font-display text-2xl"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 flex flex-col gap-3 text-sm">
                <Link to="/shop" onClick={() => setMobile(false)}>{t("header.shopAll")}</Link>
                <Link to="/about" onClick={() => setMobile(false)}>{t("header.about")}</Link>
                <Link to="/contact" onClick={() => setMobile(false)}>{t("header.contact")}</Link>
                <Link to="/login" onClick={() => setMobile(false)}>{t("header.account")}</Link>
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-2 text-left"
                >
                  <Globe className="h-4 w-4" />
                  {lang === "en" ? "العربية" : "English"}
                </button>
                <button onClick={toggle} className="flex items-center gap-2 text-left">
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {dark ? t("header.lightMode") : t("header.darkMode")}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
