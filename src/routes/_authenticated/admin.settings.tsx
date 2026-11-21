import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import {
  SETTING_KEYS,
  EGYPT_GOVERNORATES,
  shippingRatesFromSettings,
  useSaveSiteSettings,
  useSiteSettings,
} from "@/lib/useSiteSettings";
import { ACCEPTED_IMAGE_TYPES, uploadImageToStorage } from "@/lib/storage-upload";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Store Settings — Admin" }] }),
  component: AdminStoreSettings,
});

const field =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground";
const card = "rounded-2xl border border-border bg-background p-5 md:p-6";

function AdminStoreSettings() {
  const { settings, isLoading } = useSiteSettings();
  const save = useSaveSiteSettings();

  const [form, setForm] = useState({
    shipping_price: "",
    free_shipping_limit: "",
    instapay_name: "",
    instapay_number: "",
    instapay_instructions: "",
    brand_name: "",
    store_description: "",
  });
  const [shippingRates, setShippingRates] = useState<Record<string, string>>({});
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const faviconInput = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (isLoading || hydrated) return;
    setForm({
      shipping_price: settings[SETTING_KEYS.shippingPrice] ?? "",
      free_shipping_limit: settings[SETTING_KEYS.freeShippingLimit] ?? "",
      instapay_name: settings[SETTING_KEYS.instapayName] ?? "",
      instapay_number: settings[SETTING_KEYS.instapayNumber] ?? "",
      instapay_instructions: settings[SETTING_KEYS.instapayInstructions] ?? "",
      brand_name: settings[SETTING_KEYS.brandName] ?? "",
      store_description: settings[SETTING_KEYS.storeDescription] ?? "",
    });
    setShippingRates(Object.fromEntries(EGYPT_GOVERNORATES.map((g) => [g, String(shippingRatesFromSettings(settings)[g] ?? 0)])));
    setLogo(settings[SETTING_KEYS.brandLogo] ?? "");
    setFavicon(settings[SETTING_KEYS.brandFavicon] ?? "");
    setHydrated(true);
  }, [isLoading, hydrated, settings]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickImage =
    (setFile: (f: File) => void, setPreview: (url: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;
      if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
        toast.error("Only JPG, JPEG, PNG and WEBP images are allowed.");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (form.shipping_price.trim() !== "" && !Number.isFinite(Number(form.shipping_price))) {
      toast.error("Shipping price must be a number.");
      return;
    }
    if (form.free_shipping_limit.trim() !== "" && !Number.isFinite(Number(form.free_shipping_limit))) {
      toast.error("Free shipping minimum must be a number.");
      return;
    }
    setSaving(true);
    try {
      let logoUrl = logo;
      let faviconUrl = favicon;
      if (logoFile) logoUrl = await uploadImageToStorage(logoFile, "branding");
      if (faviconFile) faviconUrl = await uploadImageToStorage(faviconFile, "branding");
      await save.mutateAsync({
        [SETTING_KEYS.shippingPrice]: form.shipping_price.trim(),
        [SETTING_KEYS.shippingRates]: JSON.stringify(Object.fromEntries(EGYPT_GOVERNORATES.map((g) => [g, Math.max(0, Number(shippingRates[g] || 0))]))),
        [SETTING_KEYS.freeShippingLimit]: form.free_shipping_limit.trim(),
        [SETTING_KEYS.instapayName]: form.instapay_name.trim(),
        [SETTING_KEYS.instapayNumber]: form.instapay_number.trim(),
        [SETTING_KEYS.instapayInstructions]: form.instapay_instructions.trim(),
        [SETTING_KEYS.brandName]: form.brand_name.trim(),
        [SETTING_KEYS.storeDescription]: form.store_description.trim(),
        [SETTING_KEYS.brandLogo]: logoUrl,
        [SETTING_KEYS.brandFavicon]: faviconUrl,
      });
      setLogo(logoUrl);
      setFavicon(faviconUrl);
      setLogoFile(null);
      setFaviconFile(null);
      toast.success("Store settings saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Store Settings</h1>
        <p className="text-sm text-muted-foreground">
          Shipping, InstaPay and branding — used everywhere on the storefront.
        </p>
      </div>

      <section className={card}>
        <h2 className="mb-4 font-display text-xl">Shipping Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Shipping price (EGP)</label>
            <input type="number" min="0" step="0.01" value={form.shipping_price} onChange={set("shipping_price")} className={field} />
          </div>
          <div>
            <label className={label}>Free shipping minimum (optional)</label>
            <input type="number" min="0" step="0.01" value={form.free_shipping_limit} onChange={set("free_shipping_limit")} className={field} placeholder="Leave empty to disable" />
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-display text-xl">Shipping by Governorate</h2>
        <p className="mb-4 text-sm text-muted-foreground">Set a separate delivery fee for each Egyptian governorate. Customers will see the fee after choosing their governorate at checkout.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {EGYPT_GOVERNORATES.map((governorate) => (
            <div key={governorate}>
              <label className={label}>{governorate} — EGP</label>
              <input
                type="number"
                min="0"
                step="1"
                value={shippingRates[governorate] ?? "0"}
                onChange={(e) => setShippingRates((current) => ({ ...current, [governorate]: e.target.value }))}
                className={field}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-4 font-display text-xl">InstaPay Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Account name</label>
            <input value={form.instapay_name} onChange={set("instapay_name")} className={field} />
          </div>
          <div>
            <label className={label}>InstaPay / phone number</label>
            <input value={form.instapay_number} onChange={set("instapay_number")} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Payment instructions</label>
            <textarea
              value={form.instapay_instructions}
              onChange={set("instapay_instructions")}
              rows={4}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-gold"
            />
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-4 font-display text-xl">Branding</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Brand name</label>
            <input value={form.brand_name} onChange={set("brand_name")} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Store description (optional)</label>
            <textarea
              value={form.store_description}
              onChange={set("store_description")}
              rows={3}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className={label}>Logo image</label>
            <input ref={logoInput} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={pickImage(setLogoFile, setLogo)} />
            {logo ? (
              <div className="space-y-2">
                <div className="grid h-24 place-items-center rounded-lg border border-border bg-secondary/40 p-2">
                  <img src={logo} alt="Logo preview" className="max-h-20 object-contain" />
                </div>
                <button type="button" onClick={() => logoInput.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-luxe hover:border-gold hover:text-gold">
                  <ImagePlus className="h-4 w-4" /> Change logo
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => logoInput.current?.click()} className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 text-xs text-muted-foreground hover:border-gold hover:text-gold">
                <ImagePlus className="h-5 w-5" /> Select logo
              </button>
            )}
          </div>

          <div>
            <label className={label}>Favicon (optional)</label>
            <input ref={faviconInput} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={pickImage(setFaviconFile, setFavicon)} />
            {favicon ? (
              <div className="space-y-2">
                <div className="grid h-24 place-items-center rounded-lg border border-border bg-secondary/40 p-2">
                  <img src={favicon} alt="Favicon preview" className="max-h-16 object-contain" />
                </div>
                <button type="button" onClick={() => faviconInput.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-luxe hover:border-gold hover:text-gold">
                  <ImagePlus className="h-4 w-4" /> Change favicon
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => faviconInput.current?.click()} className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 text-xs text-muted-foreground hover:border-gold hover:text-gold">
                <ImagePlus className="h-5 w-5" /> Select favicon
              </button>
            )}
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save settings
      </button>
    </div>
  );
}
