export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage: string;
  rating: number;
  reviews: number;
  colors: string[];
  sizes: string[];
  stock: number;
  badges: ("new" | "bestseller" | "sale")[];
  description: string;
  active: boolean;
}

// Shape of a row coming back from the database `products` table.
export interface ProductRow {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number | string;
  old_price: number | string | null;
  image: string | null;
  hover_image: string | null;
  rating: number | string | null;
  reviews: number | null;
  colors: string[] | null;
  sizes: string[] | null;
  stock: number | null;
  badges: string[] | null;
  description: string | null;
  active: boolean | null;
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? "",
    category: row.category ?? "",
    price: Number(row.price ?? 0),
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    image: row.image ?? "",
    hoverImage: row.hover_image || row.image || "",
    rating: Number(row.rating ?? 5),
    reviews: row.reviews ?? 0,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    stock: row.stock ?? 0,
    badges: (row.badges ?? []) as Product["badges"],
    description: row.description ?? "",
    active: row.active ?? true,
  };
}
