import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/ShopView";

export const Route = createFileRoute("/men")({
  head: () => ({
    meta: [
      { title: "Men — Off Track" },
      { name: "description", content: "Modern tailoring and everyday essentials." },
      { property: "og:title", content: "Men — Off Track" },
      { property: "og:description", content: "Modern tailoring and everyday essentials." },
    ],
  }),
  component: () => (
    <ShopView title="Men" subtitle="Modern tailoring and everyday essentials." category="men" />
  ),
});
