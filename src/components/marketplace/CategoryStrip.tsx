import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";

export function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Shop by Category</h2>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          View All Categories
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <ul className="no-scrollbar flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-10 lg:gap-4 lg:overflow-visible lg:pb-0">
        {categories.map((cat) => (
          <li key={cat.id} className="shrink-0 lg:shrink">
            <Link
              to="/shop"
              search={{ category: cat.id }}
              className="group flex w-20 flex-col items-center gap-2 text-center lg:w-auto"
            >
              <span
                className={`grid size-16 place-items-center rounded-2xl transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-card ${cat.tint} ${cat.fg}`}
              >
                <cat.icon className="size-7" strokeWidth={1.8} />
              </span>
              <span className="text-[11px] font-medium leading-snug text-foreground">
                {cat.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
