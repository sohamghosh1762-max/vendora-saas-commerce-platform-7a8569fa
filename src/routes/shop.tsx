import { createFileRoute, Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

type ShopSearch = { q?: string; category?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop All Products — Vendora" },
      {
        name: "description",
        content: "Browse every product across all independent Vendora stores.",
      },
      { property: "og:title", content: "Shop All Products — Vendora" },
      {
        property: "og:description",
        content: "Browse every product across all independent Vendora stores.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ShopPage() {
  const { q, category } = Route.useSearch();
  const query = (q ?? "").trim().toLowerCase();

  let list = products;
  if (category) list = list.filter((p) => p.category === category);
  if (query) {
    list = list.filter((p) =>
      [p.name, p.storeName, p.category].some((f) => f.toLowerCase().includes(query)),
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Shop</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {query
          ? `Results for “${q}”`
          : category
            ? `Browsing ${categories.find((c) => c.id === category)?.label ?? category}`
            : "Every product from every independent store."}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/shop"
          search={{ q }}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
            !category
              ? "bg-primary text-primary-foreground"
              : "border text-muted-foreground hover:border-primary hover:text-primary",
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/shop"
            search={{ q, category: c.id }}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              category === c.id
                ? "bg-primary text-primary-foreground"
                : "border text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {list.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border bg-card p-12 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground">Try a different search or category.</p>
        </div>
      )}
    </section>
  );
}
