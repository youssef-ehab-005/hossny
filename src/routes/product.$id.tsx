import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { type Product } from "@/lib/products";
import { useProduct, useProducts } from "@/lib/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";

export const Route = createFileRoute("/product/$id")({
  head: () => ({ meta: [{ title: "Product — Off Track" }] }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { product, isLoading } = useProduct(id);
  const { products } = useProducts();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const [size, setSize] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-32 text-center">
        <h1 className="font-display text-3xl">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-sm text-gold link-underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const selSize = size ?? product.sizes[0];
  const selColor = color ?? product.colors[0];
  const images = [product.image, product.hoverImage, product.image];
  const fav = inWishlist(product.id);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);


  const handleAdd = () => {
    addToCart(product.id, { size: selSize, color: selColor, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Home</Link> /{" "}
        <Link to="/shop" className="hover:text-gold">Shop</Link> /{" "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "h-20 w-16 overflow-hidden rounded-lg border-2 transition-colors",
                  activeImg === i ? "border-gold" : "border-transparent",
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="group relative flex-1 overflow-hidden rounded-2xl bg-muted"
          >
            <img
              src={images[activeImg]}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-150"
            />
          </motion.div>
        </div>

        {/* info */}
        <div className="lg:pl-6">
          <p className="text-xs font-medium uppercase tracking-luxe text-gold">{product.brand}</p>
          <h1 className="mt-2 font-display text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn("h-4 w-4", i < Math.round(product.rating) && "fill-gold")}
                />
              ))}
            </div>
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="font-display text-3xl">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
                <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-gold-foreground">
                  Save {formatPrice(product.oldPrice - product.price)}
                </span>
              </>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {/* color */}
          <div className="mt-7">
            <p className="mb-2 text-xs font-medium uppercase tracking-luxe">
              Color: <span className="text-muted-foreground capitalize">{selColor}</span>
            </p>
            <div className="flex gap-2">
              {product.colors.map((c: string) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition-all",
                    selColor === c ? "border-gold ring-2 ring-gold/30" : "border-border",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* size */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-luxe">Size</p>
              <button className="text-xs text-muted-foreground link-underline">Size guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s: string) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-11 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    selSize === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* qty + stock */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className={cn("text-sm", product.stock > 0 ? "text-emerald-600" : "text-destructive")}>
              {product.stock > 0 ? `In stock · ${product.stock} left` : "Out of stock"}
            </span>
          </div>

          {/* actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground py-4 text-xs font-medium uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-40"
            >
              {added ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingBag className="h-4 w-4" /> Add to Bag</>}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
              className={cn(
                "grid h-[52px] w-[52px] place-items-center rounded-lg border transition-colors",
                fav ? "border-gold text-gold" : "border-border hover:border-foreground",
              )}
            >
              <Heart className={cn("h-5 w-5", fav && "fill-gold")} />
            </button>
          </div>

          {/* perks */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-6 text-center">
            {[
              { icon: Truck, label: "Free shipping" },
              { icon: RotateCcw, label: "30-day returns" },
              { icon: ShieldCheck, label: "Secure checkout" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* specs + reviews */}
      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">Specifications</h2>
          <dl className="mt-4 divide-y divide-border text-sm">
            {[
              ["Material", "Premium natural fibres"],
              ["Fit", "Regular / true to size"],
              ["Care", "Dry clean recommended"],
              ["SKU", product.id.toUpperCase()],
              ["Origin", "Ethically made in Portugal"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="font-display text-2xl">Reviews ({product.reviews})</h2>
          <div className="mt-4 space-y-4">
            {[
              { n: "Isabelle T.", r: 5, t: "Absolutely stunning quality. Exceeded my expectations." },
              { n: "Marcus L.", r: 4, t: "Great fit and beautiful fabric. Shipping was quick." },
            ].map((rv) => (
              <div key={rv.n} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{rv.n}</span>
                  <div className="flex text-gold">
                    {Array.from({ length: rv.r }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold" />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{rv.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 text-center font-display text-3xl">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {related.map((p: Product, i: number) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
