import { createFileRoute } from "@tanstack/react-router";
import { StoreCard } from "@/components/marketplace/StoreCard";
import { stores } from "@/data/stores";

export const Route = createFileRoute("/stores")({
  component: StoresPage,
  head: () => ({
    meta: [
      { title: "All Stores — Vendora" },
      { name: "description", content: "Meet the independent sellers on the Vendora marketplace." },
      { property: "og:title", content: "All Stores — Vendora" },
      {
        property: "og:description",
        content: "Meet the independent sellers on the Vendora marketplace.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function StoresPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">All Stores</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Meet the independent sellers behind Vendora.
      </p>
      <div className="mt-8 grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </section>
  );
}
