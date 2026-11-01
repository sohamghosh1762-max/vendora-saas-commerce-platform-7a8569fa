import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { featuredProducts, products } from "@/data/products";
import { cn } from "@/lib/utils";

const filters = [
  { id: "all", label: "All" },
  { id: "fashion", label: "Fashion" },
  { id: "electronics", label: "Electronics" },
  { id: "home-living", label: "Home & Living" },
  { id: "beauty", label: "Beauty" },
  { id: "sports", label: "Sports" },
];

export function FeaturedProducts() {
  const [active, setActive] = useState("all");

  const list = active === "all" ? featuredProducts : products.filter((p) => p.category === active);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Products</h2>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              aria-pressed={active === f.id}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                active === f.id
                  ? "bg-primary text-primary-foreground"
                  : "border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {f.label}
            </button>
          ))}
          <Link
            to="/shop"
            className="ml-1 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {list.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((product) => (
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
