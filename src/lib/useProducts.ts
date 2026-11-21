import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapProduct, type Product, type ProductRow } from "./products";

interface ProductImageRow {
  product_id: string;
  image_url: string;
  sort_order: number | null;
  is_primary: boolean | null;
}

interface InventoryRow {
  product_id: string;
  quantity: number | null;
}

interface PriceRow {
  product_id: string;
  amount: number | string;
  compare_at_amount: number | string | null;
  active: boolean | null;
  starts_at: string | null;
  ends_at: string | null;
}

interface DiscountRow {
  product_id: string | null;
  category_slug: string | null;
  percent_off: number | string | null;
  amount_off: number | string | null;
  active: boolean | null;
  starts_at: string | null;
  ends_at: string | null;
}

function isCurrentlyActive(row: { active?: boolean | null; starts_at?: string | null; ends_at?: string | null }) {
  if (row.active === false) return false;
  const now = Date.now();
  if (row.starts_at && new Date(row.starts_at).getTime() > now) return false;
  if (row.ends_at && new Date(row.ends_at).getTime() < now) return false;
  return true;
}

async function fetchProducts(includeInactive = false): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("created_at", { ascending: true });
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as ProductRow[];
  const ids = rows.map((row) => row.id);
  if (ids.length === 0) return [];

  const [imagesResult, inventoryResult, pricesResult, discountsResult] = await Promise.all([
    (supabase as any)
      .from("product_images")
      .select("product_id, image_url, sort_order, is_primary")
      .in("product_id", ids)
      .order("sort_order", { ascending: true }),
    (supabase as any)
      .from("inventory")
      .select("product_id, quantity")
      .in("product_id", ids),
    (supabase as any)
      .from("prices")
      .select("product_id, amount, compare_at_amount, active, starts_at, ends_at")
      .in("product_id", ids),
    (supabase as any)
      .from("discounts")
      .select("product_id, category_slug, percent_off, amount_off, active, starts_at, ends_at"),
  ]);

  if (imagesResult.error) throw imagesResult.error;
  if (inventoryResult.error) throw inventoryResult.error;
  if (pricesResult.error) throw pricesResult.error;
  if (discountsResult.error) throw discountsResult.error;

  const imagesByProduct = new Map<string, ProductImageRow[]>();
  for (const image of (imagesResult.data ?? []) as ProductImageRow[]) {
    const list = imagesByProduct.get(image.product_id) ?? [];
    list.push(image);
    imagesByProduct.set(image.product_id, list);
  }

  const inventoryByProduct = new Map<string, number>();
  for (const item of (inventoryResult.data ?? []) as InventoryRow[]) {
    inventoryByProduct.set(item.product_id, (inventoryByProduct.get(item.product_id) ?? 0) + Number(item.quantity ?? 0));
  }

  const pricesByProduct = new Map<string, PriceRow>();
  for (const price of ((pricesResult.data ?? []) as PriceRow[]).filter(isCurrentlyActive)) {
    if (!pricesByProduct.has(price.product_id)) pricesByProduct.set(price.product_id, price);
  }

  const discounts = ((discountsResult.data ?? []) as DiscountRow[]).filter(isCurrentlyActive);

  return rows.map((row) => {
    const merged: ProductRow = { ...row };
    const productImages = imagesByProduct.get(row.id) ?? [];
    if (productImages.length > 0) {
      const primary = productImages.find((image) => image.is_primary) ?? productImages[0];
      merged.image = primary.image_url;
      merged.hover_image = productImages.find((image) => image.image_url !== primary.image_url)?.image_url ?? primary.image_url;
    }

    if (inventoryByProduct.has(row.id)) {
      merged.stock = inventoryByProduct.get(row.id) ?? 0;
    }

    const activePrice = pricesByProduct.get(row.id);
    if (activePrice) {
      merged.price = activePrice.amount;
      merged.old_price = activePrice.compare_at_amount;
    }

    const basePrice = Number(merged.price ?? 0);
    const discount = discounts.find(
      (item) => item.product_id === row.id || (!!item.category_slug && item.category_slug === row.category),
    );
    if (discount && basePrice > 0) {
      const discounted = discount.percent_off != null
        ? basePrice * (1 - Number(discount.percent_off) / 100)
        : basePrice - Number(discount.amount_off ?? 0);
      if (discounted > 0 && discounted < basePrice) {
        merged.old_price = merged.old_price ?? basePrice;
        merged.price = Number(discounted.toFixed(2));
      }
    }

    return mapProduct(merged);
  });
}

export const productsQueryOptions = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: () => fetchProducts(false),
    staleTime: 30_000,
  });

export const adminProductsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "admin"],
    queryFn: () => fetchProducts(true),
    staleTime: 5_000,
  });

/** All active products for the storefront. */
export function useProducts() {
  const { data, isLoading } = useQuery(productsQueryOptions());
  return { products: data ?? [], isLoading };
}

export function useProduct(id: string) {
  const { products, isLoading } = useProducts();
  return { product: products.find((p) => p.id === id), isLoading };
}
