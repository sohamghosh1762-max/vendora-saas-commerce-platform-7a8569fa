import { createFileRoute, notFound } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { getStore } from "@/data/stores";
import { products } from "@/data/products";

export const Route = createFileRoute("/store/$id")({
  loader: ({ params }) => {
    const store = getStore(params.id);
    if (!store) throw notFound();
    return { store };
  },
  component: StoreDetailPage,
  head: () => ({
    meta: [
      { title: "Store — Vendora" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function StoreDetailPage() {
  const { store } = Route.useLoaderData();
  const storeProducts = products.filter((p) => p.storeId === store.id);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border bg-muted">
        {store.cover ? (
          <img
            src={store.cover}
            alt={`${store.name} storefront`}
            width={1024}
            height={1024}
            className="h-44 w-full object-cover sm:h-56"
          />
        ) : (
          <div className="bg-hero-gradient h-44 w-full sm:h-56" />
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 bg-gradient-to-t from-foreground/70 to-transparent p-5">
          <span
            className={`grid size-14 place-items-center rounded-2xl border-4 border-card text-xl font-extrabold text-primary-foreground ${store.tint}`}
          >
            {store.name.charAt(0)}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-primary-foreground">{store.name}</h1>
            <p className="text-xs text-primary-foreground/80">{store.tagline}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="flex items-center gap-1.5">
          <Star className="size-4 fill-gold text-gold" />
          <span className="text-sm font-bold">{store.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({store.reviews.toLocaleString("en-IN")} reviews)
          </span>
        </span>
        <span className="text-sm text-muted-foreground">{store.productCount} products</span>
        <p className="w-full max-w-xl text-sm text-muted-foreground">{store.description}</p>
      </div>

      <h2 className="mt-10 text-xl font-bold text-foreground">Products from {store.name}</h2>
      {storeProducts.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {storeProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          This store's full catalogue is coming soon.
        </p>
      )}
    </section>
  );
}
