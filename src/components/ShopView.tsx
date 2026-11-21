import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Star, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { type Product } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";

interface Props {
  title: string;
  subtitle?: string;
  source?: Product[];
  category?: string;
}

const sortOptions = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
] as const;

export function ShopView({ title, subtitle, source, category }: Props) {
  const { products, isLoading } = useProducts();
  const base = source ?? (category ? products.filter((p) => p.category === category) : products);
  const [openFilters, setOpenFilters] = useState(false);
  const [selBrands, setSelBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<(typeof sortOptions)[number]["key"]>("featured");

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const brandOptions = useMemo(
    () => Array.from(new Set(base.map((p) => p.brand).filter(Boolean))).sort(),
    [base],
  );
  const maxCatalogPrice = useMemo(() => Math.max(320, ...base.map((p) => p.price)), [base]);

  const filtered = useMemo(() => {
    let list = base.filter(
      (p) =>
        p.price <= maxPrice &&
        p.rating >= minRating &&
        (!inStockOnly || p.stock > 0) &&
        (selBrands.length === 0 || selBrands.includes(p.brand)),
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [base, selBrands, maxPrice, minRating, inStockOnly, sort]);

  const Filters = (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-luxe">Brand</p>
        <div className="space-y-2">
          {brandOptions.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selBrands.includes(b)}
                onChange={() => toggle(selBrands, b, setSelBrands)}
                className="h-4 w-4 accent-[oklch(0.735_0.086_82)]"
              />
              {b}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-luxe">
          Max Price · {formatPrice(maxPrice)}
        </p>
        <input
          type="range"
          min={40}
          max={maxCatalogPrice}
          value={Math.min(maxPrice, maxCatalogPrice)}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[oklch(0.735_0.086_82)]"
        />
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-luxe">Rating</p>
        <div className="flex flex-wrap gap-2">
          {[0, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={cn(
                "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs",
                minRating === r ? "border-gold bg-gold/10 text-gold" : "border-border",
              )}
            >
              {r === 0 ? "All" : <>{r}+ <Star className="h-3 w-3 fill-current" /></>}
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="h-4 w-4 accent-[oklch(0.735_0.086_82)]"
        />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">Off Track</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">{subtitle}</p>}
      </motion.header>

      <div className="flex items-center justify-between border-y border-border py-3">
        <button
          onClick={() => setOpenFilters(true)}
          className="flex items-center gap-2 text-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        <span className="hidden text-sm text-muted-foreground lg:block">
          {filtered.length} products
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          {sortOptions.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 flex gap-10">
        <aside className="hidden w-56 shrink-0 lg:block">{Filters}</aside>
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-2xl">No products found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters to see more.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {openFilters && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpenFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-2xl">Filters</span>
              <button onClick={() => setOpenFilters(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            {Filters}
            <button
              onClick={() => setOpenFilters(false)}
              className="mt-8 w-full rounded-lg bg-foreground py-3 text-xs font-medium uppercase tracking-luxe text-background"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
