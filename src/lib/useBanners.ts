import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link_url: string;
  cta_label: string;
  placement: string;
  sort_order: number;
  active: boolean;
}

async function fetchBanners(): Promise<StoreBanner[]> {
  const { data, error } = await (supabase as any)
    .from("banners")
    .select("id, title, subtitle, image, link_url, cta_label, placement, sort_order, active")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StoreBanner[];
}

export const bannersQueryOptions = () =>
  queryOptions({
    queryKey: ["banners"],
    queryFn: fetchBanners,
    staleTime: 30_000,
  });

export function useBanners(placement?: string) {
  const { data, isLoading } = useQuery(bannersQueryOptions());
  const banners = placement ? (data ?? []).filter((banner) => banner.placement === placement) : (data ?? []);
  return { banners, isLoading };
}