import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Loader2, Tags, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQueryOptions, type StoreCategory } from "@/lib/useCategories";
import { useI18n } from "@/lib/i18n";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // 10 years

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

const field =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold";

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface FormState {
  id?: string;
  slug: string;
  label: string;
  sort_order: string;
  image: string;
}

const emptyForm: FormState = { slug: "", label: "", sort_order: "0", image: "" };

async function uploadCategoryImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `categories/${crypto.randomUUID()}.${ext}`;
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

function AdminCategories() {
  const qc = useQueryClient();
  const { t } = useI18n();
  const { data: categories, isLoading } = useQuery(categoriesQueryOptions());
  const [editing, setEditing] = useState<FormState | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openForm = (form: FormState) => {
    setFile(null);
    setPreview(form.image || null);
    setEditing(form);
  };

  const closeForm = () => {
    setEditing(null);
    setFile(null);
    setPreview(null);
  };

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

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const save = useMutation({
    mutationFn: async (form: FormState) => {
      let imageUrl = form.image;
      if (file) {
        imageUrl = await uploadCategoryImage(file);
      }
      const payload = {
        slug: form.slug ? slugify(form.slug) : slugify(form.label),
        label: form.label,
        sort_order: Number(form.sort_order) || 0,
        image: imageUrl,
      };
      if (form.id) {
        const { error } = await (supabase as any).from("categories").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      closeForm();
      toast.success(t("admin.cat.saved"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (category: StoreCategory) => {
      if (!category.id) throw new Error("Category not found.");
      const { count, error: countError } = await (supabase as any)
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category", category.slug);
      if (countError) throw countError;
      if ((count ?? 0) > 0) {
        throw new Error(`Move or delete ${count} product${count === 1 ? "" : "s"} before deleting this category.`);
      }
      const { error } = await (supabase as any).from("categories").delete().eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.cat.deleted"));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">{t("admin.cat.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.cat.subtitle")}</p>
        </div>
        <button
          onClick={() => openForm(emptyForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground"
        >
          <Plus className="h-4 w-4" /> {t("admin.cat.add")}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (categories ?? []).length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("admin.cat.empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t("admin.cat.label")}</th>
                  <th className="px-4 py-3">{t("admin.cat.slug")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(categories ?? []).map((c: StoreCategory) => (
                  <tr key={c.slug}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tags className="h-4 w-4 text-gold" />
                        <span className="font-medium">{c.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openForm({
                              id: c.id,
                              slug: c.slug,
                              label: c.label,
                              sort_order: String(c.sort_order ?? 0),
                              image: c.image ?? "",
                            })
                          }
                          disabled={!c.id}
                          className="rounded-lg border border-border p-2 hover:border-gold hover:text-gold disabled:opacity-40"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (c.id && confirm(t("admin.cat.confirmDelete"))) remove.mutate(c);
                          }}
                          disabled={!c.id}
                          className="rounded-lg border border-border p-2 hover:border-destructive hover:text-destructive disabled:opacity-40"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/40" onClick={closeForm} />
          <div className="relative h-full w-full max-w-md overflow-y-auto bg-background p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl">
                {editing.id ? t("admin.cat.edit") : t("admin.cat.add")}
              </h2>
              <button onClick={closeForm} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("admin.cat.label")}
                </label>
                <input
                  required
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className={field}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("admin.cat.image")}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={onPickFile}
                />
                {preview ? (
                  <div className="space-y-3">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border bg-secondary/40">
                      <img src={preview} alt="Category preview" className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-medium uppercase tracking-luxe hover:border-gold hover:text-gold"
                    >
                      <ImagePlus className="h-4 w-4" /> {t("admin.cat.changeImage")}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 text-sm text-muted-foreground hover:border-gold hover:text-gold"
                  >
                    <ImagePlus className="h-6 w-6" />
                    {t("admin.cat.selectImage")}
                  </button>
                )}
                {!preview && (
                  <p className="mt-1.5 text-xs text-destructive">{t("admin.cat.imageRequired")}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("admin.cat.slug")}
                </label>
                <input
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="auto"
                  className={field}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("admin.cat.order")}
                </label>
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })}
                  className={field}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={save.isPending || !preview}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
                >
                  {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
                  {save.isPending ? t("admin.cat.uploading") : t("common.save")}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-border px-5 text-xs font-medium uppercase tracking-luxe"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
