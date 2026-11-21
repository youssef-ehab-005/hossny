import { createFileRoute } from "@tanstack/react-router";
import { ShopView } from "@/components/ShopView";
import { useCategories } from "@/lib/useCategories";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const label = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
    return {
      meta: [
        { title: `${label} — Off Track` },
        { name: "description", content: `Shop the ${label} collection at Off Track.` },
        { property: "og:title", content: `${label} — Off Track` },
        { property: "og:description", content: `Shop the ${label} collection at Off Track.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { categories } = useCategories();
  const match = categories.find((c) => c.slug === slug);
  const label = match?.label ?? slug.charAt(0).toUpperCase() + slug.slice(1);
  return <ShopView title={label} subtitle={`The ${label} collection.`} category={slug} />;
}
