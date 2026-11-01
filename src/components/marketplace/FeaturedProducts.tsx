import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { featuredProducts, products } from "@/data/products";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

export function FeaturedProducts() {
  const [active, setActive] = useState("all");

  const categoryFilters = [
    { id: "all", label: "All" },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ];

  const list = active === "all" ? featuredProducts : products.filter((p) => p.category === active);

  const displayList = list.slice(0, 10);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Products</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Top curated picks from verified independent stores across India.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              aria-pressed={active === f.id}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active === f.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border bg-card text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {f.label}
            </button>
          ))}
          <Link
            to="/shop"
            search={active !== "all" ? { category: active } : undefined}
            className="ml-1 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {displayList.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {displayList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No featured picks in this category yet —{" "}
          <Link to="/shop" className="font-semibold text-primary">
            browse all products
          </Link>
          .
        </p>
      )}
    </section>
  );
}
