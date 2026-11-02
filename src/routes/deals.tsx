import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { products } from "@/data/products";
import { discountPercent } from "@/lib/format";

export const Route = createFileRoute("/deals")({
  component: DealsPage,
  head: () => ({
    meta: [
      { title: "Deals — Vendora" },
      { name: "description", content: "The biggest discounts across the Vendora marketplace." },
      { property: "og:title", content: "Deals — Vendora" },
      {
        property: "og:description",
        content: "The biggest discounts across the Vendora marketplace.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function DealsPage() {
  const list = [...products].sort(
    (a, b) => discountPercent(b.price, b.originalPrice) - discountPercent(a.price, a.originalPrice),
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Deals</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mega sale — up to 50% off top products from your favourite stores.
      </p>
      <div className="mt-8 grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
