import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Off Track" },
      { name: "description", content: "How Off Track collects, uses and protects your personal data." },
      { property: "og:title", content: "Privacy Policy — Off Track" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      updated="Updated July 2026"
      sections={[
        ["Information We Collect", "We collect information you provide when creating an account, placing an order, or contacting us — including your name, email, shipping address and payment details. We also collect limited usage data to improve your experience."],
        ["How We Use Your Data", "Your data is used to process orders, provide support, personalise your experience, and — with your consent — send marketing communications. You can opt out at any time."],
        ["Cookies", "We use cookies to keep your bag, remember preferences, and understand how our store is used. You can control cookies through your browser settings."],
        ["Data Sharing", "We never sell your personal data. We share information only with trusted partners who help us operate our store, such as payment processors and shipping carriers."],
        ["Your Rights", "You may access, correct, or request deletion of your personal data at any time by contacting care@offtrack.com."],
        ["Security", "We use industry-standard encryption and security measures to protect your information throughout its lifecycle."],
      ]}
    />
  ),
});

function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: [string, string][] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <header className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
        <p className="mt-2 text-xs uppercase tracking-luxe text-muted-foreground">{updated}</p>
      </header>
      <div className="space-y-8">
        {sections.map(([h, p], i) => (
          <section key={h}>
            <h2 className="font-display text-2xl">{i + 1}. {h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
