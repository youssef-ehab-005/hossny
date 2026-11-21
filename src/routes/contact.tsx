import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Off Track" },
      { name: "description", content: "Get in touch with the Off Track team. We're here to help with orders, styling and more." },
      { property: "og:title", content: "Contact — Off Track" },
      { property: "og:description", content: "Get in touch with the Off Track team." },
    ],
  }),
  component: ContactPage,
});

const field = "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-gold";

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <header className="mb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-luxe text-gold">We'd love to hear from you</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Get in Touch</h1>
      </header>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: "care@offtrack.com" },
            { icon: Phone, label: "Phone", value: "+1 (800) 555-0199" },
            { icon: MapPin, label: "Flagship", value: "12 Savile Row, London, UK" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-border p-5">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gold/10 text-gold"><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs uppercase tracking-luxe text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-border p-5">
            <p className="text-xs uppercase tracking-luxe text-muted-foreground">Support hours</p>
            <p className="mt-1 text-sm">Mon–Fri · 9am – 7pm GMT</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4 rounded-2xl border border-border p-6">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Name" className={field} />
            <input required type="email" placeholder="Email" className={field} />
          </div>
          <input required placeholder="Subject" className={field} />
          <textarea required placeholder="Your message" rows={5} className="w-full rounded-lg border border-border bg-background p-4 text-sm outline-none focus:border-gold" />
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-3.5 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground">
            <Send className="h-4 w-4" /> {sent ? "Message sent ✓" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
