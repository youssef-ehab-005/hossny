import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/ShopView";

export const Route = createFileRoute("/shoes")({
  head: () => ({
    meta: [
      { title: "Shoes — Off Track" },
      { name: "description", content: "Considered footwear, made to go the distance." },
      { property: "og:title", content: "Shoes — Off Track" },
      { property: "og:description", content: "Considered footwear, made to go the distance." },
    ],
  }),
  component: () => (
    <ShopView title="Shoes" subtitle="Considered footwear, made to go the distance." category="shoes" />
  ),
});
