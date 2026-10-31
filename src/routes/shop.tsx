import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, RotateCcw, Search, SearchX, Tag } from "lucide-react";
import { useId, useState } from "react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { products, type Product } from "@/data/products";
import { categories } from "@/data/categories";
import { discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating-desc" | "reviews-desc";
type PriceRangeOption = "all" | "under-2000" | "2000-5000" | "above-5000";

type ShopSearch = {
  q?: string | undefined;
  category?: string | undefined;
  sort?: SortOption | undefined;
  priceRange?: PriceRangeOption | undefined;
  onSale?: boolean | undefined;
  page?: number | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const rawQ = search["q"];
    const rawCategory = search["category"];
    const rawSort = search["sort"];
    const rawPriceRange = search["priceRange"];
    const rawOnSale = search["onSale"];
    const rawPage = search["page"];

    const validSorts: SortOption[] = [
      "featured",
      "price-asc",
      "price-desc",
      "rating-desc",
      "reviews-desc",
    ];
    const validRanges: PriceRangeOption[] = ["all", "under-2000", "2000-5000", "above-5000"];

    const parsedPage = typeof rawPage === "number" ? rawPage : typeof rawPage === "string" ? parseInt(rawPage, 10) : undefined;

    return {
      q: typeof rawQ === "string" && rawQ.trim().length > 0 ? rawQ.trim() : undefined,
      category: typeof rawCategory === "string" && rawCategory.trim().length > 0 ? rawCategory.trim() : undefined,
      sort: typeof rawSort === "string" && validSorts.includes(rawSort as SortOption) ? (rawSort as SortOption) : undefined,
      priceRange: typeof rawPriceRange === "string" && validRanges.includes(rawPriceRange as PriceRangeOption) ? (rawPriceRange as PriceRangeOption) : undefined,
      onSale: rawOnSale === true || rawOnSale === "true" ? true : undefined,
      page: parsedPage && !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : undefined,
    };
  },
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop All Products — Vendora Marketplace" },
      {
        name: "description",
        content: "Browse, filter, and sort 80+ products across all independent Vendora merchant stores.",
      },
      { property: "og:title", content: "Shop All Products — Vendora Marketplace" },
      {
        property: "og:description",
        content: "Browse, filter, and sort 80+ products across all independent Vendora merchant stores.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

export function filterAndSortProducts(
  list: Product[],
  options: {
    query?: string | undefined;
    category?: string | undefined;
    priceRange?: PriceRangeOption | undefined;
    onSale?: boolean | undefined;
    sort?: SortOption | undefined;
  },
): Product[] {
  let result = [...list];

  if (options.category) {
    result = result.filter((p) => p.category === options.category);
  }

  if (options.query) {
    const qLower = options.query.toLowerCase();
    result = result.filter((p) =>
      [p.name, p.storeName, p.category, p.description, p.brand ?? ""].some((f) =>
        f.toLowerCase().includes(qLower),
      ),
    );
  }

  if (options.onSale) {
    result = result.filter(
      (p) => Boolean(p.badge) || discountPercent(p.price, p.originalPrice) > 0,
    );
  }

  if (options.priceRange && options.priceRange !== "all") {
    switch (options.priceRange) {
      case "under-2000":
        result = result.filter((p) => p.price < 2000);
        break;
      case "2000-5000":
        result = result.filter((p) => p.price >= 2000 && p.price <= 5000);
        break;
      case "above-5000":
        result = result.filter((p) => p.price > 5000);
        break;
    }
  }

  const sort = options.sort ?? "featured";
  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      break;
    case "reviews-desc":
      result.sort((a, b) => b.reviews - a.reviews);
      break;
    case "featured":
    default:
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  return result;
}

const PAGE_SIZE = 20;

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const searchInputId = useId();

  const query = search.q ?? "";
  const category = search.category;
  const sort = search.sort ?? "featured";
  const priceRange = search.priceRange ?? "all";
  const onSale = search.onSale ?? false;
  const currentPage = search.page ?? 1;

  const [inputVal, setInputVal] = useState(query);

  const filtered = filterAndSortProducts(products, {
    query,
    category,
    priceRange,
    onSale,
    sort,
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedList = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({
      search: (prev) => ({
        ...prev,
        q: inputVal.trim() ? inputVal.trim() : undefined,
        page: undefined,
      }),
    });
  };

  const handleCategorySelect = (catId?: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        category: catId,
        page: undefined,
      }),
    });
  };

  const handleSortChange = (newSort: SortOption) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        sort: newSort === "featured" ? undefined : newSort,
        page: undefined,
      }),
    });
  };

  const handlePriceRangeChange = (range: PriceRangeOption) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        priceRange: range === "all" ? undefined : range,
        page: undefined,
      }),
    });
  };

  const handleToggleOnSale = () => {
    void navigate({
      search: (prev) => ({
        ...prev,
        onSale: prev.onSale ? undefined : true,
        page: undefined,
      }),
    });
  };

  const handlePageChange = (newPage: number) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        page: newPage === 1 ? undefined : newPage,
      }),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setInputVal("");
    void navigate({
      search: () => ({
        q: undefined,
        category: undefined,
        sort: undefined,
        priceRange: undefined,
        onSale: undefined,
        page: undefined,
      }),
    });
  };

  const hasActiveFilters = Boolean(
    query || category || onSale || (priceRange && priceRange !== "all") || (sort && sort !== "featured"),
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      {/* Header & In-page Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="mb-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-foreground">Shop</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Explore All Products
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {query
              ? `Results for "${query}"`
              : category
                ? `Browsing ${categories.find((c) => c.id === category)?.label ?? category}`
                : `Over ${products.length} handcrafted and curated products across 10 retail categories.`}
          </p>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-xs">
          <label htmlFor={searchInputId} className="sr-only">
            Search products
          </label>
          <input
            id={searchInputId}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search catalog or brand..."
            className="w-full rounded-full border bg-card py-2 pl-9 pr-14 text-sm text-foreground shadow-soft placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal("");
                void navigate({
                  search: (prev) => ({ ...prev, q: undefined, page: undefined }),
                });
              }}
              className="absolute right-9 top-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Go
          </button>
        </form>
      </div>

      {/* Category Pills Strip with Icons */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => handleCategorySelect(undefined)}
          aria-pressed={!category}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
            !category
              ? "bg-primary text-primary-foreground shadow-soft"
              : "border bg-card text-muted-foreground hover:border-primary hover:text-primary",
          )}
        >
          All ({products.length})
        </button>
        {categories.map((c) => {
          const Icon = c.icon;
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategorySelect(category === c.id ? undefined : c.id)}
              aria-pressed={category === c.id}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                category === c.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border bg-card text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              <Icon className="size-3.5" />
              <span>{c.label}</span>
              <span className="opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar: Sort & Additional Filters */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y py-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Price Range Pills */}
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Filter className="size-3.5 text-primary" />
            Price:
          </span>
          <button
            type="button"
            onClick={() => handlePriceRangeChange("all")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              priceRange === "all"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => handlePriceRangeChange("under-2000")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              priceRange === "under-2000"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            &lt; ₹2,000
          </button>
          <button
            type="button"
            onClick={() => handlePriceRangeChange("2000-5000")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              priceRange === "2000-5000"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            ₹2,000–₹5,000
          </button>
          <button
            type="button"
            onClick={() => handlePriceRangeChange("above-5000")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              priceRange === "above-5000"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            &gt; ₹5,000
          </button>

          {/* On Sale toggle */}
          <button
            type="button"
            onClick={handleToggleOnSale}
            className={cn(
              "ml-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold transition-colors",
              onSale
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-border text-muted-foreground hover:border-foreground/40",
            )}
          >
            <Tag className="size-3" />
            On Sale
          </button>
        </div>

        {/* Sort Select & Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <label htmlFor="shop-sort" className="text-muted-foreground">
              Sort:
            </label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="rounded-lg border bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-soft focus:border-primary focus:outline-none"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="reviews-desc">Most Reviewed</option>
            </select>
          </div>

          <span className="text-muted-foreground">
            Showing <strong className="text-foreground">{paginatedList.length}</strong> of{" "}
            <strong className="text-foreground">{filtered.length}</strong> products
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
              title="Reset all filters"
            >
              <RotateCcw className="size-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {paginatedList.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedList.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t pt-8">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, activePage - 1))}
                disabled={activePage === 1}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-soft transition-colors hover:bg-accent disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    aria-current={activePage === pageNum ? "page" : undefined}
                    className={cn(
                      "grid size-8 place-items-center rounded-lg text-xs font-semibold transition-colors",
                      activePage === pageNum
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
                disabled={activePage === totalPages}
                aria-label="Next page"
                className="inline-flex items-center gap-1 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-soft transition-colors hover:bg-accent disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border bg-card p-12 text-center shadow-soft">
          <SearchX className="size-12 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">No matching products found</h2>
          <p className="max-w-md text-xs text-muted-foreground">
            We couldn't find any items matching your active query and filter combination. Try
            adjusting the category, clearing price filters, or searching a broader term.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            <RotateCcw className="size-3.5" />
            Clear All Filters
          </button>
        </div>
      )}
    </section>
  );
}
