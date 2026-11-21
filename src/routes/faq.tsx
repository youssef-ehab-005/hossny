import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Off Track" },
      { name: "description", content: "Frequently asked questions about Off Track shipping, returns, sizing and orders." },
      { property: "og:title", content: "FAQ — Off Track" },
      { property: "og:description", content: "Answers to common questions." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  ["How long does shipping take?", "Standard shipping takes 3–5 business days. Express options are available at checkout, and orders over 150 EGP ship free."],
  ["What is your return policy?", "We offer complimentary returns within 30 days of delivery. Items must be unworn with original tags attached."],
  ["How do I track my order?", "Once your order ships, you'll receive an email with tracking. You can also track it anytime from the My Orders page."],
  ["Do you ship internationally?", "Yes — we ship to over 45 countries. Duties and taxes are calculated at checkout for a seamless experience."],
  ["How do I find my size?", "Each product page includes a detailed size guide. Our pieces are true to size; when in doubt, size up for a relaxed fit."],
  ["Which payment methods do you accept?", "We accept all major credit cards, PayPal, and cash on delivery in select regions."],
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <header className="mb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">Help Center</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Frequently Asked Questions</h1>
      </header>
      <div className="divide-y divide-border border-y border-border">
        {faqs.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
              <span className="font-medium">{q}</span>
              {open === i ? <Minus className="h-4 w-4 shrink-0 text-gold" /> : <Plus className="h-4 w-4 shrink-0" />}
            </button>
            <div className={cn("overflow-hidden text-sm text-muted-foreground transition-all", open === i ? "max-h-40 pb-5" : "max-h-0")}>
              {a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
