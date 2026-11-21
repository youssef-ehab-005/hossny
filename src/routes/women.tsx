import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/ShopView";

export const Route = createFileRoute("/women")({
  head: () => ({
    meta: [
      { title: "Women — Off Track" },
      { name: "description", content: "Refined womenswear crafted from premium materials." },
      { property: "og:title", content: "Women — Off Track" },
      { property: "og:description", content: "Refined womenswear crafted from premium materials." },
    ],
  }),
  component: () => (
    <ShopView title="Women" subtitle="Refined womenswear crafted from premium materials." category="women" />
  ),
});
