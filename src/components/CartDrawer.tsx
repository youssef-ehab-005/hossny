import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/currency";

export function CartDrawer() {
  const { cartOpen, setCartOpen, cartDetailed, cartTotal, updateQty, removeFromCart, cartCount } =
    useStore();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-2xl">
                <ShoppingBag className="h-5 w-5" /> Your Bag ({cartCount})
              </h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            {cartDetailed.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
                <p className="text-muted-foreground">Your bag is empty.</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="rounded-lg bg-foreground px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-background"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                  {cartDetailed.map((line) => (
                    <div key={line.key} className="flex gap-4">
                      <img
                        src={line.product.image}
                        alt={line.product.name}
                        className="h-28 w-22 rounded-lg object-cover"
                        width={88}
                        height={112}
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">
                              {line.product.brand}
                            </p>
                            <p className="text-sm font-medium">{line.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {line.size} · <span className="capitalize">{line.color}</span>
                            </p>
                          </div>
                          <button onClick={() => removeFromCart(line.key)} aria-label="Remove">
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-border">
                            <button
                              className="grid h-8 w-8 place-items-center"
                              onClick={() => updateQty(line.key, line.qty - 1)}
                              aria-label="Decrease"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm">{line.qty}</span>
                            <button
                              className="grid h-8 w-8 place-items-center"
                              onClick={() => updateQty(line.key, line.qty + 1)}
                              aria-label="Increase"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold">
                            {formatPrice(line.product.price * line.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-6 py-5">
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-display text-xl">{formatPrice(cartTotal)}</span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="block rounded-lg bg-foreground py-3.5 text-center text-xs font-medium uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-gold-foreground"
                  >
                    Checkout
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setCartOpen(false)}
                    className="mt-2 block py-2 text-center text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    View full bag
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
