import { useBranding } from "@/lib/useSiteSettings";
import { cn } from "@/lib/utils";

const FALLBACK_NAME = "Off Track";

/**
 * Renders the store brand: the uploaded logo when one exists, otherwise the
 * brand name from Store Settings. Never hardcodes brand content beyond a
 * neutral fallback name used before settings are configured.
 */
export function BrandMark({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  const { branding } = useBranding();
  const name = branding.brandName || FALLBACK_NAME;

  if (branding.logo) {
    return <img src={branding.logo} alt={name} className={cn("h-8 w-auto object-contain", imgClassName)} />;
  }

  const [first, ...rest] = name.split(" ");
  return (
    <span className={className}>
      {first?.toUpperCase()}
      {rest.length > 0 && <span className="text-gradient-gold">{rest.join(" ").toUpperCase()}</span>}
    </span>
  );
}

/** Brand name only (for text contexts like titles and copy). */
export function useBrandName() {
  const { branding } = useBranding();
  return branding.brandName || FALLBACK_NAME;
}
