import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Product } from "./products";
import { useProducts } from "./useProducts";

export interface CartLine {
  id: string;
  size: string;
  color: string;
  qty: number;
}

interface StoreState {
  cart: CartLine[];
  wishlist: string[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addToCart: (id: string, opts?: { size?: string; color?: string; qty?: number }) => void;
  removeFromCart: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  cartCount: number;
  cartTotal: number;
  cartDetailed: (CartLine & { product: Product; key: string })[];
}

const StoreContext = createContext<StoreState | null>(null);

const lineKey = (l: CartLine) => `${l.id}__${l.size}__${l.color}`;

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(load<CartLine[]>("uw_cart", []));
    setWishlist(load<string[]>("uw_wishlist", []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem("uw_cart", JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) window.localStorage.setItem("uw_wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const value = useMemo<StoreState>(() => {
    const cartDetailed = cart
      .map((l) => {
        const product = products.find((p) => p.id === l.id);
        return product ? { ...l, product, key: lineKey(l) } : null;
      })
      .filter(Boolean) as (CartLine & { product: Product; key: string })[];

    return {
      cart,
      wishlist,
      cartOpen,
      setCartOpen,
      cartDetailed,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      cartTotal: cartDetailed.reduce((s, l) => s + l.product.price * l.qty, 0),
      addToCart: (id, opts) => {
        const product = products.find((p) => p.id === id);
        if (!product) return;
        const size = opts?.size ?? product.sizes[0];
        const color = opts?.color ?? product.colors[0];
        const qty = opts?.qty ?? 1;
        setCart((prev) => {
          const key = `${id}__${size}__${color}`;
          const existing = prev.find((l) => lineKey(l) === key);
          if (existing) {
            return prev.map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + qty } : l));
          }
          return [...prev, { id, size, color, qty }];
        });
        setCartOpen(true);
      },
      removeFromCart: (key) => setCart((prev) => prev.filter((l) => lineKey(l) !== key)),
      updateQty: (key, qty) =>
        setCart((prev) =>
          prev
            .map((l) => (lineKey(l) === key ? { ...l, qty: Math.max(1, qty) } : l))
            .filter((l) => l.qty > 0),
        ),
      clearCart: () => setCart([]),
      toggleWishlist: (id) =>
        setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      inWishlist: (id) => wishlist.includes(id),
    };
  }, [cart, wishlist, cartOpen, products]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
