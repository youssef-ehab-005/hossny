import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCategories, categoryImage } from "@/lib/useCategories";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Off Track" },
      { name: "description", content: "Explore Off Track categories: women, men, kids, shoes and accessories." },
      { property: "og:title", content: "Categories — Off Track" },
      { property: "og:description", content: "Explore all Off Track categories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories } = useCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <header className="mb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">Explore</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Shop by Category</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((cat, i) => (
          <motion.div key={cat.slug} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            <Link to="/category/$slug" params={{ slug: cat.slug }} className="group relative block aspect-[16/10] overflow-hidden rounded-2xl">
              <img src={categoryImage(cat)} alt={cat.label} loading="lazy" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h2 className="font-display text-3xl text-background">{cat.label}</h2>
                <span className="mt-1 inline-flex items-center gap-1 text-xs uppercase tracking-luxe text-background/80">Shop now <ArrowRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
