import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/ShopView";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — Off Track" },
      { name: "description", content: "Browse the full Off Track collection of luxury clothing, shoes and accessories." },
      { property: "og:title", content: "Shop All — Off Track" },
      { property: "og:description", content: "Browse the full Off Track collection." },
    ],
  }),
  component: () => (
    <ShopView title="Shop All" subtitle="The complete collection — refined essentials for every occasion." />
  ),
});
