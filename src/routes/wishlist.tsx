import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/useProducts";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Off Track" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const { products } = useProducts();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <header className="mb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">Saved for later</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Your Wishlist</h1>
      </header>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <Heart className="mx-auto h-14 w-14 text-muted-foreground" strokeWidth={1} />
          <p className="mt-6 font-display text-2xl">No favorites yet</p>
          <p className="mt-2 text-muted-foreground">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-lg bg-foreground px-8 py-3.5 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
