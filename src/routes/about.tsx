import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import heroImg from "@/assets/cat-women.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Off Track" },
      { name: "description", content: "The Off Track story: modern luxury, crafted with intention using premium natural materials." },
      { property: "og:title", content: "About — Off Track" },
      { property: "og:description", content: "Modern luxury, crafted with intention." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="relative flex h-[50vh] min-h-80 items-center justify-center overflow-hidden text-center">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/40" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-background">
          <p className="text-xs font-medium uppercase tracking-luxe text-gold">Our Story</p>
          <h1 className="mt-2 font-display text-5xl md:text-6xl">Modern Luxury, Reimagined</h1>
        </motion.div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <p className="font-display text-2xl leading-relaxed md:text-3xl">
          Off Track was founded on a simple belief — that luxury should feel effortless, and beautiful things should last.
        </p>
        <p className="mt-6 text-muted-foreground">
          We partner with heritage mills and skilled artisans across Europe to create timeless pieces from the finest natural materials. Every garment is designed in-house, refined over countless fittings, and made to be worn for years — never seasons.
        </p>
        <p className="mt-4 text-muted-foreground">
          Sustainability isn't an afterthought; it's built into how we work. From responsible sourcing to considered production, we make less, but better.
        </p>
      </section>

      <section className="border-y border-border bg-secondary/40 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 text-center md:grid-cols-4">
          {[
            ["2016", "Founded"],
            ["45+", "Countries shipped"],
            ["120k+", "Happy customers"],
            ["100%", "Natural fibres"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-4xl text-gold md:text-5xl">{n}</p>
              <p className="mt-1 text-xs uppercase tracking-luxe text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
