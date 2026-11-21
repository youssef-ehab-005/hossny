import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/ShopView";

export const Route = createFileRoute("/accessories")({
  head: () => ({
    meta: [
      { title: "Accessories — Off Track" },
      { name: "description", content: "The finishing touches — bags, jewelry and more." },
      { property: "og:title", content: "Accessories — Off Track" },
      { property: "og:description", content: "The finishing touches — bags, jewelry and more." },
    ],
  }),
  component: () => (
    <ShopView title="Accessories" subtitle="The finishing touches — bags, jewelry and more." category="accessories" />
  ),
});
