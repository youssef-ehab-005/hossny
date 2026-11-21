import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Off Track" },
      { name: "description", content: "The terms and conditions governing your use of Off Track and purchases made with us." },
      { property: "og:title", content: "Terms & Conditions — Off Track" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <header className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl">Terms &amp; Conditions</h1>
        <p className="mt-2 text-xs uppercase tracking-luxe text-muted-foreground">Updated July 2026</p>
      </header>
      <div className="space-y-8">
        {([
          ["Acceptance of Terms", "By accessing and using Off Track, you agree to be bound by these terms and conditions and our privacy policy."],
          ["Orders & Pricing", "All orders are subject to availability and confirmation. We reserve the right to correct pricing errors and to refuse or cancel any order."],
          ["Shipping & Delivery", "Delivery times are estimates. Risk of loss passes to you upon delivery to the carrier. Duties and taxes may apply on international orders."],
          ["Returns & Refunds", "Eligible items may be returned within 30 days for a full refund. Refunds are processed to the original payment method within 5–10 business days."],
          ["Intellectual Property", "All content on this site — including images, text and logos — is the property of Off Track and may not be used without permission."],
          ["Limitation of Liability", "Off Track is not liable for indirect or consequential damages arising from the use of our products or website, to the extent permitted by law."],
        ] as [string, string][]).map(([h, p], i) => (
          <section key={h}>
            <h2 className="font-display text-2xl">{i + 1}. {h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
          </section>
        ))}
      </div>
    </div>
  ),
});
