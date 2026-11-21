import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const [hover, setHover] = useState(false);
  const fav = inWishlist(product.id);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06 }}
      className="group relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1000}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all duration-700",
              hover ? "scale-105 opacity-0" : "opacity-100",
            )}
          />
          <img
            src={product.hoverImage}
            alt=""
            aria-hidden
            loading="lazy"
            width={800}
            height={1000}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all duration-700",
              hover ? "scale-105 opacity-100" : "opacity-0",
            )}
          />

          {/* badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.badges.includes("new") && (
              <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-medium uppercase tracking-luxe text-background">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Sold out
              </span>
            )}
          </div>

          {/* wishlist */}
          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass transition-transform hover:scale-110"
          >
            <Heart className={cn("h-4 w-4", fav ? "fill-gold text-gold" : "text-foreground")} />
          </button>

          {/* hover actions */}
          <div className="absolute inset-x-3 bottom-3 flex translate-y-4 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (product.stock > 0) addToCart(product.id);
              }}
              disabled={product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-xs font-medium uppercase tracking-wider text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-40"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add
            </button>
            <span className="grid h-10 w-10 place-items-center rounded-lg glass text-foreground">
              <Eye className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-[11px] uppercase tracking-luxe text-muted-foreground">{product.brand}</p>
          <h3 className="truncate text-sm font-medium text-foreground">{product.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="font-medium text-foreground">{product.rating}</span>
            <span>({product.reviews})</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
