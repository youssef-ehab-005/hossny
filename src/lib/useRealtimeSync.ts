import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to Supabase realtime changes on the storefront tables and
 * invalidates the matching React Query caches so the admin panel and the
 * storefront stay in sync without a manual refresh.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidateProducts = () => queryClient.invalidateQueries({ queryKey: ["products"] });
    const invalidateCategoriesAndProducts = () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    };

    const channel = supabase
      .channel("storefront-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        invalidateProducts,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        invalidateCategoriesAndProducts,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_images" },
        invalidateProducts,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory" },
        invalidateProducts,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prices" },
        invalidateProducts,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "discounts" },
        invalidateProducts,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "banners" },
        () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => queryClient.invalidateQueries({ queryKey: ["site_settings"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
