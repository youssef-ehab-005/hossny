import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X, Loader2, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminProductsQueryOptions } from "@/lib/useProducts";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { fileToCompressedDataUrl } from "@/lib/image-upload";
import { useCategories } from "@/lib/useCategories";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

const field =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-gold";

interface FormState {
  id?: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  old_price: string;
  image: string;
  hover_image: string;
  stock: string;
  colors: string;
  sizes: string;
  badges: string;
  description: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: "",
  brand: "",
  category: "women",
  price: "",
  old_price: "",
  image: "",
  hover_image: "",
  stock: "0",
  colors: "",
  sizes: "",
  badges: "",
  description: "",
  active: true,
};

function toForm(p: Product): FormState {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: String(p.price),
    old_price: p.oldPrice != null ? String(p.oldPrice) : "",
    image: p.image,
    hover_image: p.hoverImage,
    stock: String(p.stock),
    colors: p.colors.join(", "),
    sizes: p.sizes.join(", "),
    badges: p.badges.join(", "),
    description: p.description,
    active: p.active,
  };
}

function AdminProducts() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useQuery(adminProductsQueryOptions());
  const [editing, setEditing] = useState<FormState | null>(null);
  const [query, setQuery] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const save = useMutation({
    mutationFn: async (form: FormState) => {
      const payload = {
        name: form.name,
        brand: form.brand,
        category: form.category,
        price: Number(form.price) || 0,
        old_price: form.old_price ? Number(form.old_price) : null,
        image: form.image,
        hover_image: form.hover_image || form.image,
        stock: Number(form.stock) || 0,
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        badges: form.badges.split(",").map((s) => s.trim()).filter(Boolean),
        description: form.description,
        active: form.active,
      };
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success("Product saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Product deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (products ?? []).filter((p) =>
    (p.name + p.brand + p.category).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground">Add, edit and remove items from your catalog.</p>
        </div>
        <button
          onClick={() => setEditing(emptyForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className={cn(field, "pl-9")}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image && <img src={p.image} alt="" className="h-11 w-9 rounded object-cover" />}
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(p.stock === 0 && "text-destructive")}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          p.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {p.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(toForm(p))}
                          className="rounded-lg border border-border p-2 hover:border-gold hover:text-gold"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${p.name}"?`)) remove.mutate(p.id);
                          }}
                          className="rounded-lg border border-border p-2 hover:border-destructive hover:text-destructive"
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
        <ProductForm
          form={editing}
          saving={save.isPending}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSubmit={() => save.mutate(editing)}
        />
      )}
    </div>
  );
}

function ProductForm({
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  form: FormState;
  saving: boolean;
  onChange: (f: FormState) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { categories } = useCategories();
  const set = (patch: Partial<FormState>) => onChange({ ...form, ...patch });
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-background p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl">{form.id ? "Edit product" : "Add product"}</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</label>
            <input required value={form.name} onChange={(e) => set({ name: e.target.value })} className={field} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Brand</label>
              <input value={form.brand} onChange={(e) => set({ brand: e.target.value })} className={field} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => set({ category: e.target.value })} className={field}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug} className="capitalize">{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => set({ price: e.target.value })} className={field} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Old price (optional)</label>
              <input type="number" min="0" step="0.01" value={form.old_price} onChange={(e) => set({ old_price: e.target.value })} className={field} />
            </div>
          </div>
          <ImageField
            label="Product image"
            value={form.image}
            onChange={(v) => set({ image: v })}
            placeholder="Upload or paste an image URL"
          />
          <ImageField
            label="Hover image (optional)"
            value={form.hover_image}
            onChange={(v) => set({ hover_image: v })}
            placeholder="Upload or paste an image URL"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => set({ stock: e.target.value })} className={field} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Badges</label>
              <input value={form.badges} onChange={(e) => set({ badges: e.target.value })} placeholder="new, sale, bestseller" className={field} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Colors (comma separated)</label>
            <input value={form.colors} onChange={(e) => set({ colors: e.target.value })} placeholder="#111111, #C8A95A" className={field} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Sizes (comma separated)</label>
            <input value={form.sizes} onChange={(e) => set({ sizes: e.target.value })} placeholder="XS, S, M, L, XL" className={field} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} className={cn(field, "h-auto py-2")} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => set({ active: e.target.checked })} className="h-4 w-4 accent-[oklch(0.735_0.086_82)]" />
            Active (visible on store)
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save product
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-5 text-xs font-medium uppercase tracking-luxe">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="flex items-start gap-3">
        {value ? (
          <img src={value} alt="" className="h-24 w-20 shrink-0 rounded object-cover" />
        ) : (
          <div className="grid h-24 w-20 shrink-0 place-items-center rounded border border-dashed border-border text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:border-gold hover:text-gold disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload from computer
          </button>
          <input
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={field}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
