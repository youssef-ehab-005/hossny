import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { siteSettingsQueryOptions, SETTING_KEYS } from "@/lib/useSiteSettings";
import { useI18n } from "@/lib/i18n";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // 10 years

export const Route = createFileRoute("/_authenticated/admin/appearance")({
  component: AdminAppearance,
});

async function uploadHeroImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `hero/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("category-images")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase.storage
    .from("category-images")
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not create image URL");
  return data.signedUrl;
}

function AdminAppearance() {
  const qc = useQueryClient();
  const { t } = useI18n();
  const { data: settings, isLoading } = useQuery(siteSettingsQueryOptions());
  const currentHero = settings?.[SETTING_KEYS.heroImage] ?? "";

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shownImage = preview ?? currentHero ?? null;

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error("Only JPG, JPEG, PNG and WEBP images are allowed.");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error(t("admin.appearance.heroRequired"));
      const imageUrl = await uploadHeroImage(file);
      const { error } = await (supabase as any)
        .from("site_settings")
        .upsert({ key: SETTING_KEYS.heroImage, value: imageUrl }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      setFile(null);
      setPreview(null);
      toast.success(t("admin.appearance.saved"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">{t("admin.appearance.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.appearance.subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-border bg-background p-6">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("admin.appearance.heroImage")}
        </label>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={onPickFile}
            />
            {shownImage ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-secondary/40">
                  <img src={shownImage} alt="Hero preview" className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-medium uppercase tracking-luxe hover:border-gold hover:text-gold"
                >
                  <ImagePlus className="h-4 w-4" /> {t("admin.appearance.changeImage")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 text-sm text-muted-foreground hover:border-gold hover:text-gold"
              >
                <ImagePlus className="h-6 w-6" />
                {t("admin.appearance.selectImage")}
              </button>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => save.mutate()}
                disabled={save.isPending || !file}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
              >
                {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
                {save.isPending ? t("admin.appearance.uploading") : t("common.save")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
