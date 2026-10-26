import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { Store } from "@/data/stores";
import { getStoreInitial } from "@/lib/store-utils";

export function StoreCard({ store }: { store: Store }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-shadow duration-200 hover:shadow-lift">
      <div className="relative h-32 overflow-hidden bg-muted">
        {store.cover ? (
          <img
            src={store.cover}
            alt={`${store.name} storefront`}
            loading="lazy"
            width={1024}
            height={1024}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="bg-hero-gradient h-full w-full" />
        )}
      </div>

      <div className="relative flex flex-1 flex-col items-center gap-1 px-4 pb-4 text-center">
        <span
          className={`-mt-6 grid size-12 place-items-center rounded-full border-4 border-card text-lg font-extrabold text-primary-foreground ${store.tint}`}
        >
          {getStoreInitial(store.name)}
        </span>
        <Link
          to="/store/$id"
          params={{ id: store.id }}
          className="text-sm font-bold text-foreground transition-colors hover:text-primary"
        >
          {store.name}
        </Link>
        <p className="text-xs text-muted-foreground">{store.tagline}</p>
        <div className="flex items-center gap-1">
          <Star className="size-3.5 fill-gold text-gold" />
          <span className="text-xs font-semibold text-foreground">{store.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({store.reviews.toLocaleString("en-IN")} products)
          </span>
        </div>
        <Link
          to="/store/$id"
          params={{ id: store.id }}
          className="mt-auto block w-full rounded-lg border border-primary py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          View Store
        </Link>
      </div>
    </div>
  );
}
