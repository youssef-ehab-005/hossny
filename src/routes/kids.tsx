import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/ShopView";

export const Route = createFileRoute("/kids")({
  head: () => ({
    meta: [
      { title: "Kids — Off Track" },
      { name: "description", content: "Soft, durable and beautifully made for little ones." },
      { property: "og:title", content: "Kids — Off Track" },
      { property: "og:description", content: "Soft, durable and beautifully made for little ones." },
    ],
  }),
  component: () => (
    <ShopView title="Kids" subtitle="Soft, durable and beautifully made for little ones." category="kids" />
  ),
});
