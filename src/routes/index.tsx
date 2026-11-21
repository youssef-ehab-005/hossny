import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Star } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { ProductCard } from "@/components/ProductCard";
import { type Product } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";
import { useCategories, categoryImage } from "@/lib/useCategories";
import { useSiteSettings, SETTING_KEYS } from "@/lib/useSiteSettings";
import { useBanners } from "@/lib/useBanners";

export const Route = createFileRoute("/")({
  component: Index,
});

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

function Index() {
  const { products } = useProducts();
  const featured = products.slice(0, 4);
  const bestSellers = products.slice(4, 8);
  
  return (
    <div>
      <Hero />
      <Marquee />
      <CategoryGrid />
      <ProductSection eyebrow="Just In" title="New Collection" items={featured} to="/shop" />
      <FlashSale />
      <ProductSection
        eyebrow="Most Loved"
        title="Best Sellers"
        items={bestSellers}
        to="/shop"
        tone="muted"
      />
      <BrandStory />
      
      <Testimonials />
      <InstagramGallery />
    </div>
  );
}

function Hero() {
  const { settings } = useSiteSettings();
  const { banners } = useBanners("home");
  const heroBanner = banners[0];
  const src = heroBanner?.image || settings[SETTING_KEYS.heroImage] || heroImg;
  return (
    <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden">
      <img
        src={src}
        alt="Off Track autumn winter campaign"
        width={1600}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 md:px-8">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-medium uppercase tracking-luxe text-gold"
          >
            {heroBanner?.subtitle || "Autumn / Winter 2026"}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-4 font-display text-5xl leading-[0.95] md:text-7xl"
          >
            {heroBanner?.title || (
              <>
                Effortless
                <br />
                <span className="italic text-gradient-gold">Modern Luxury</span>
              </>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-5 max-w-md text-base text-foreground/80"
          >
            {heroBanner?.subtitle ||
              "Considered essentials crafted from premium materials. Timeless silhouettes designed to be worn, and loved, season after season."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href={heroBanner?.link_url || "/shop"}
              className="group inline-flex items-center gap-2 rounded-lg bg-foreground px-7 py-3.5 text-xs font-medium uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-gold-foreground"
            >
              {heroBanner?.cta_label || "Shop Collection"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    { icon: Truck, label: "Free shipping over 150 EGP" },
    { icon: RotateCcw, label: "30-day free returns" },
    { icon: ShieldCheck, label: "Secure payments" },
    { icon: Star, label: "50k+ 5-star reviews" },
  ];
  return (
    <section className="border-y border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center justify-center gap-3 px-4 py-5 text-center">
            <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryGrid() {
  const { categories: storeCategories } = useCategories();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <motion.div {...fadeUp} className="mb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">Explore</p>
        <h2 className="mt-2 font-display text-4xl md:text-5xl">Shop by Category</h2>
      </motion.div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {storeCategories.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="group relative block aspect-[3/4] overflow-hidden rounded-xl"
            >
              <img
                src={categoryImage(cat)}
                alt={cat.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-2xl text-background">{cat.label}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-luxe text-background/80">
                  Shop now <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}


function ProductSection({
  eyebrow,
  title,
  items,
  to,
  tone,
}: {
  eyebrow: string;
  title: string;
  items: Product[];
  to: string;
  tone?: "muted";
}) {
  return (
    <section className={tone === "muted" ? "bg-secondary/40 py-16 md:py-24" : "py-16 md:py-24"}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div {...fadeUp} className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-luxe text-gold">{eyebrow}</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">{title}</h2>
          </div>
          <Link
            to={to}
            className="hidden items-center gap-1 text-xs font-medium uppercase tracking-luxe link-underline md:inline-flex"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FlashSale() {
  const [time, setTime] = useState({ h: 8, m: 42, s: 17 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <section className="bg-foreground py-16 text-background md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-xs font-medium uppercase tracking-luxe text-gold">Limited Time</p>
          <h2 className="font-display text-4xl md:text-6xl">Flash Sale — Up to 40% Off</h2>
          <div className="flex gap-3">
            {[
              { v: time.h, l: "Hours" },
              { v: time.m, l: "Mins" },
              { v: time.s, l: "Secs" },
            ].map((t) => (
              <div
                key={t.l}
                className="glass-dark w-20 rounded-xl px-3 py-3 text-background"
              >
                <div className="font-display text-3xl tabular-nums">{pad(t.v)}</div>
                <div className="text-[10px] uppercase tracking-luxe text-background/70">{t.l}</div>
              </div>
            ))}
          </div>
          <Link
            to="/shop"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-luxe text-gold-foreground transition-transform hover:scale-105"
          >
            Shop the Sale <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  const { categories } = useCategories();
  const firstCategory = categories.find((category) => category.image);
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
      <motion.div {...fadeUp} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        {firstCategory ? (
          <img
            src={categoryImage(firstCategory)}
            alt="Off Track atelier"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
      </motion.div>
      <motion.div {...fadeUp}>
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">Our Story</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Crafted with intention</h2>
        <p className="mt-5 text-muted-foreground">
          Off Track began with a simple belief — that luxury should feel effortless. We partner with
          heritage mills and skilled artisans to create pieces that transcend trends, using only the
          finest natural materials.
        </p>
        <p className="mt-4 text-muted-foreground">
          Every garment is designed in-house and made to last, because true style is never disposable.
        </p>
        <Link
          to="/about"
          className="mt-7 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-luxe link-underline"
        >
          Discover the brand <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      quote:
        "The quality is exceptional — this coat has become the centerpiece of my wardrobe. Worth every penny.",
      name: "Amelia R.",
      role: "Verified Buyer",
    },
    {
      quote:
        "Beautifully made, ships fast, and the fit is perfect. Off Track has completely won me over.",
      name: "Daniel K.",
      role: "Verified Buyer",
    },
    {
      quote:
        "Understated elegance done right. I get compliments every single time I wear their pieces.",
      name: "Sofia M.",
      role: "Verified Buyer",
    },
  ];
  return (
    <section className="bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-luxe text-gold">Testimonials</p>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">Loved by Thousands</h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-background p-8 hover-lift"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-gold" />
                ))}
              </div>
              <p className="mt-4 font-display text-xl leading-snug">“{t.quote}”</p>
              <footer className="mt-6">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstagramGallery() {
  const { categories } = useCategories();
  const imgs = categories.filter((category) => category.image).slice(0, 6);
  if (imgs.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
      <motion.div {...fadeUp} className="mb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">@offtrack</p>
        <h2 className="mt-2 font-display text-4xl md:text-5xl">Follow the Style</h2>
      </motion.div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {imgs.map((c, i) => (
          <a
            key={i}
            href="#"
            className="group relative aspect-square overflow-hidden rounded-lg"
          >
            <img
              src={categoryImage(c)}
              alt={c.label}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-foreground/0 transition-colors group-hover:bg-foreground/20" />
          </a>
        ))}
      </div>
    </section>
  );
}
