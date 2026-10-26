import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { StoreCard } from "./StoreCard";
import { stores } from "@/data/stores";

export function TopRatedStores() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Top Rated Stores</h2>
        <Link
          to="/stores"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          View All Stores
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </section>
  );
}
