import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreCategory {
  id?: string;
  slug: string;
  label: string;
  sort_order?: number;
  image?: string | null;
}

/**
 * A representative image for a category from the database record.
 */
export function categoryImage(category: StoreCategory | string): string {
  if (typeof category === "string") return "";
  return category.image ?? "";
}

/** The storefront route for a category slug. */
export function categoryPath(slug: string): string {
  return `/category/${slug}`;
}

async function fetchCategories(): Promise<StoreCategory[]> {
  const { data, error } = await (supabase as any)
    .from("categories")
    .select("id, slug, label, sort_order, image")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as StoreCategory[];
}

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });

export function useCategories() {
  const { data, isLoading } = useQuery(categoriesQueryOptions());
  return { categories: data ?? [], isLoading };
}
