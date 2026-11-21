import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { useI18n } from "@/lib/i18n";
import { useCategories } from "@/lib/useCategories";
import { BrandMark, useBrandName } from "@/components/BrandMark";

const socials = ["instagram", "facebook", "twitter", "youtube"] as const;

function SocialIcon({ name }: { name: (typeof socials)[number] }) {
  const paths: Record<string, ReactElement> = {
    instagram: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </>
    ),
    facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    twitter: <path d="M4 4l16 16M20 4L4 20" />,
    youtube: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="m10 9 5 3-5 3z" fill="currentColor" />
      </>
    ),
  };
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const cols = [
  {
    titleKey: "footer.help",
    links: [
      { key: "footer.contact", to: "/contact" },
      { key: "footer.faq", to: "/faq" },
      { key: "footer.orderTracking", to: "/orders" },
      { key: "footer.shippingReturns", to: "/faq" },
    ],
  },
  {
    titleKey: "footer.company",
    links: [
      { key: "footer.about", to: "/about" },
      { key: "footer.privacy", to: "/privacy" },
      { key: "footer.terms", to: "/terms" },
      { key: "footer.careers", to: "/about" },
    ],
  },
] as const;


export function Footer() {
  const { categories } = useCategories();
  const { t, lang } = useI18n();
  const brandName = useBrandName();
  return (
    <footer className="border-t border-border bg-secondary/40">
      {/* newsletter */}
      <div className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-14 md:grid-cols-2 md:px-8">
          <div>
            <h3 className="font-display text-3xl md:text-4xl">{t("footer.join")}</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {t("footer.joinDesc")}
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md gap-2 md:ml-auto"
          >
            <input
              type="email"
              required
              placeholder={t("footer.emailPlaceholder")}
              className="h-12 flex-1 rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-gold"
            />
            <button className="h-12 rounded-lg bg-foreground px-6 text-xs font-medium uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-gold-foreground">
              {t("footer.subscribe")}
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-5 md:px-8">
        <div className="md:col-span-2">
          <Link to="/" className="font-display text-2xl font-semibold">
            <BrandMark className="font-display font-semibold" />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {t("footer.tagline")}
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map((name) => (
              <a
                key={name}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:border-gold hover:text-gold"
                aria-label={`${name} link`}
              >
                <SocialIcon name={name} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-[11px] font-medium uppercase tracking-luxe text-muted-foreground">
            {t("footer.shop")}
          </p>
          <ul className="space-y-2.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="text-sm text-foreground/80 hover:text-gold"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {cols.map((col) => (
          <div key={col.titleKey}>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-luxe text-muted-foreground">
              {t(col.titleKey)}
            </p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.key}>
                  <Link to={l.to} className="text-sm text-foreground/80 hover:text-gold">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} {brandName}. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <span>EGP</span>
            <span>·</span>
            <span>{lang === "ar" ? "العربية" : "English"}</span>
            <span>·</span>
            <span>{t("footer.secure")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
