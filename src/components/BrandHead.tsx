import { useEffect } from "react";
import { useBranding } from "@/lib/useSiteSettings";

const FALLBACK_NAME = "Off Track";

/**
 * Keeps the browser title and favicon in sync with the branding saved in
 * Store Settings, without hardcoding brand values in route metadata.
 */
export function BrandHead() {
  const { branding } = useBranding();
  const name = branding.brandName || FALLBACK_NAME;
  const favicon = branding.favicon || branding.logo;

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = document.title.replace(new RegExp(FALLBACK_NAME, "g"), name);
  }, [name]);

  useEffect(() => {
    if (typeof document === "undefined" || !favicon) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [favicon]);

  return null;
}
