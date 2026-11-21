import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = Record<string, string>;

/** Well-known setting keys stored in the site_settings table. */
export const SETTING_KEYS = {
  heroImage: "hero_image",
  shippingPrice: "shipping_price",
  shippingRates: "shipping_rates",
  freeShippingLimit: "free_shipping_limit",
  instapayName: "instapay_name",
  instapayNumber: "instapay_number",
  instapayInstructions: "instapay_instructions",
  brandName: "brand_name",
  brandLogo: "brand_logo",
  brandFavicon: "brand_favicon",
  storeDescription: "store_description",
} as const;

async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await (supabase as any)
    .from("site_settings")
    .select("key, value");
  if (error || !data) return {};
  const map: SiteSettings = {};
  for (const row of data as { key: string; value: string | null }[]) {
    if (row.value) map[row.key] = row.value;
  }
  return map;
}

export const siteSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["site_settings"],
    queryFn: fetchSiteSettings,
    staleTime: 60_000,
  });

export function useSiteSettings() {
  const { data, isLoading } = useQuery(siteSettingsQueryOptions());
  return { settings: data ?? {}, isLoading };
}

/** Persist a batch of settings (empty values are stored as empty strings). */
export async function saveSiteSettings(values: Record<string, string>) {
  const rows = Object.entries(values).map(([key, value]) => ({ key, value }));
  if (rows.length === 0) return;
  const { error } = await (supabase as any)
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) throw error;
}

export function useSaveSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveSiteSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_settings"] }),
  });
}

export interface ShippingSettings {
  shippingPrice: number;
  freeShippingLimit: number | null;
}

export interface InstapaySettings {
  name: string;
  number: string;
  instructions: string;
}

export interface BrandingSettings {
  brandName: string;
  logo: string;
  favicon: string;
  description: string;
}

const toNumber = (value: string | undefined): number | null => {
  if (value === undefined || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export function shippingFromSettings(settings: SiteSettings): ShippingSettings {
  return {
    shippingPrice: toNumber(settings[SETTING_KEYS.shippingPrice]) ?? 0,
    freeShippingLimit: toNumber(settings[SETTING_KEYS.freeShippingLimit]),
  };
}

/** Shipping cost for a given subtotal, driven entirely by admin settings. */
export function shippingCostFor(subtotal: number, shipping: ShippingSettings): number {
  if (shipping.freeShippingLimit !== null && subtotal >= shipping.freeShippingLimit) return 0;
  return shipping.shippingPrice;
}

export function useShippingSettings() {
  const { settings, isLoading } = useSiteSettings();
  return { shipping: shippingFromSettings(settings), isLoading };
}

export function useInstapaySettings(): { instapay: InstapaySettings; isLoading: boolean } {
  const { settings, isLoading } = useSiteSettings();
  return {
    instapay: {
      name: settings[SETTING_KEYS.instapayName] ?? "",
      number: settings[SETTING_KEYS.instapayNumber] ?? "",
      instructions: settings[SETTING_KEYS.instapayInstructions] ?? "",
    },
    isLoading,
  };
}

export function useBranding(): { branding: BrandingSettings; isLoading: boolean } {
  const { settings, isLoading } = useSiteSettings();
  return {
    branding: {
      brandName: settings[SETTING_KEYS.brandName] ?? "",
      logo: settings[SETTING_KEYS.brandLogo] ?? "",
      favicon: settings[SETTING_KEYS.brandFavicon] ?? "",
      description: settings[SETTING_KEYS.storeDescription] ?? "",
    },
    isLoading,
  };
}


/** Per-governorate shipping prices saved by the admin as JSON in site_settings. */
export const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة",
  "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية",
  "الوادي الجديد", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج",
] as const;

export function shippingRatesFromSettings(settings: SiteSettings): Record<string, number> {
  try {
    const hasSavedRates = Boolean(settings[SETTING_KEYS.shippingRates]);
    const parsed = JSON.parse(settings[SETTING_KEYS.shippingRates] ?? "{}") as Record<string, unknown>;
    const fallback = toNumber(settings[SETTING_KEYS.shippingPrice]) ?? 0;
    return Object.fromEntries(
      EGYPT_GOVERNORATES.map((governorate) => {
        const raw = parsed[governorate];
        const value = raw === undefined && !hasSavedRates ? fallback : Number(raw ?? 0);
        return [governorate, Number.isFinite(value) && value >= 0 ? value : fallback];
      }),
    );
  } catch {
    return Object.fromEntries(EGYPT_GOVERNORATES.map((governorate) => [governorate, 0]));
  }
}
