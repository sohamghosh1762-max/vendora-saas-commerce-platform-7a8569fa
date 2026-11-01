import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import {
  ProductFilterPanel,
  type AvailabilityOption,
  type PriceRangeOption,
} from "@/components/marketplace/ProductFilterPanel";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { products, type Product } from "@/data/products";
import { categories } from "@/data/categories";
import { discountPercent, formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "best-selling"
  | "newest"
  | "rating-desc"
  | "reviews-desc";

export type ShopSearch = {
  q?: string | undefined;
  category?: string | undefined;
  categories?: string[] | undefined;
  sort?: SortOption | undefined;
  priceRange?: PriceRangeOption | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minRating?: number | undefined;
  brand?: string | undefined;
  brands?: string[] | undefined;
  availability?: AvailabilityOption | undefined;
  onSale?: boolean | undefined;
  page?: number | undefined;
};

const validSorts: SortOption[] = [
  "featured",
  "price-asc",
  "price-desc",
  "best-selling",
  "newest",
  "rating-desc",
  "reviews-desc",
];

const validPriceRanges: PriceRangeOption[] = [
  "all",
  "under-2000",
  "2000-5000",
  "above-5000",
  "5000-20000",
  "above-20000",
];

const validAvailabilities: AvailabilityOption[] = ["all", "in-stock", "out-of-stock"];

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const rawQ = search["q"];
    const rawCategory = search["category"];
    const rawCategories = search["categories"];
    const rawSort = search["sort"];
    const rawPriceRange = search["priceRange"];
    const rawMinPrice = search["minPrice"];
    const rawMaxPrice = search["maxPrice"];
    const rawMinRating = search["minRating"];
    const rawBrand = search["brand"];
    const rawBrands = search["brands"];
    const rawAvailability = search["availability"];
    const rawOnSale = search["onSale"];
    const rawPage = search["page"];

    // Parse categories (supports array, comma-separated string, or single category string)
    let parsedCategories: string[] | undefined = undefined;
    if (Array.isArray(rawCategories)) {
      parsedCategories = rawCategories.filter(
        (c): c is string => typeof c === "string" && c.trim().length > 0,
      );
    } else if (typeof rawCategories === "string" && rawCategories.trim().length > 0) {
      parsedCategories = rawCategories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    } else if (
      typeof rawCategory === "string" &&
      rawCategory.trim().length > 0 &&
      rawCategory !== "all"
    ) {
      parsedCategories = rawCategory
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    // Parse brands (supports array, comma-separated string, or single brand string)
    let parsedBrands: string[] | undefined = undefined;
    if (Array.isArray(rawBrands)) {
      parsedBrands = rawBrands.filter(
        (b): b is string => typeof b === "string" && b.trim().length > 0,
      );
    } else if (typeof rawBrands === "string" && rawBrands.trim().length > 0) {
      parsedBrands = rawBrands
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
    } else if (typeof rawBrand === "string" && rawBrand.trim().length > 0 && rawBrand !== "all") {
      parsedBrands = rawBrand
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
    }

    const parsedMinPrice =
      typeof rawMinPrice === "number"
        ? rawMinPrice
        : typeof rawMinPrice === "string" && !isNaN(parseInt(rawMinPrice, 10))
          ? parseInt(rawMinPrice, 10)
          : undefined;

    const parsedMaxPrice =
      typeof rawMaxPrice === "number"
        ? rawMaxPrice
        : typeof rawMaxPrice === "string" && !isNaN(parseInt(rawMaxPrice, 10))
          ? parseInt(rawMaxPrice, 10)
          : undefined;

    const parsedMinRating =
      typeof rawMinRating === "number"
        ? rawMinRating
        : typeof rawMinRating === "string" && !isNaN(parseFloat(rawMinRating))
          ? parseFloat(rawMinRating)
          : undefined;

    const parsedPage =
      typeof rawPage === "number"
        ? rawPage
        : typeof rawPage === "string" && !isNaN(parseInt(rawPage, 10))
          ? parseInt(rawPage, 10)
          : undefined;

    return {
      q: typeof rawQ === "string" && rawQ.trim().length > 0 ? rawQ.trim() : undefined,
      category:
        typeof rawCategory === "string" && rawCategory.trim().length > 0
          ? rawCategory.trim()
          : undefined,
      categories: parsedCategories && parsedCategories.length > 0 ? parsedCategories : undefined,
      sort:
        typeof rawSort === "string" && validSorts.includes(rawSort as SortOption)
          ? (rawSort as SortOption)
          : undefined,
      priceRange:
        typeof rawPriceRange === "string" &&
        validPriceRanges.includes(rawPriceRange as PriceRangeOption)
          ? (rawPriceRange as PriceRangeOption)
          : undefined,
      minPrice: parsedMinPrice && parsedMinPrice >= 0 ? parsedMinPrice : undefined,
      maxPrice: parsedMaxPrice && parsedMaxPrice >= 0 ? parsedMaxPrice : undefined,
      minRating: parsedMinRating && parsedMinRating > 0 ? parsedMinRating : undefined,
      brand:
        typeof rawBrand === "string" && rawBrand.trim().length > 0 ? rawBrand.trim() : undefined,
      brands: parsedBrands && parsedBrands.length > 0 ? parsedBrands : undefined,
      availability:
        typeof rawAvailability === "string" &&
        validAvailabilities.includes(rawAvailability as AvailabilityOption)
          ? (rawAvailability as AvailabilityOption)
          : undefined,
      onSale: rawOnSale === true || rawOnSale === "true" ? true : undefined,
      page: parsedPage && parsedPage > 0 ? parsedPage : undefined,
    };
  },
  component: ShopPage,
  head: () => ({
    meta: [
      { title: "Shop All Products — Vendora Marketplace" },
      {
        name: "description",
        content:
          "Browse, filter, and sort products across all independent Vendora merchant stores.",
      },
      { property: "og:title", content: "Shop All Products — Vendora Marketplace" },
      {
        property: "og:description",
        content:
          "Browse, filter, and sort products across all independent Vendora merchant stores.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

/** Map category IDs to friendly display labels for comprehensive keyword search */
const categoryLabelMap = categories.reduce<Record<string, string>>((acc, c) => {
  acc[c.id] = c.label;
  return acc;
}, {});

export interface FilterAndSortOptions {
  query?: string | undefined;
  category?: string | undefined;
  categories?: string[] | undefined;
  priceRange?: PriceRangeOption | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minRating?: number | undefined;
  brand?: string | undefined;
  brands?: string[] | undefined;
  availability?: AvailabilityOption | undefined;
  onSale?: boolean | undefined;
  sort?: SortOption | undefined;
}

export function filterAndSortProducts(
  list: Product[],
  options: FilterAndSortOptions = {},
): Product[] {
  let result = [...list];

  // 1. Category Filter: supports multi-category array or single category string
  const activeCategories: string[] = [];
  if (options.categories && options.categories.length > 0) {
    activeCategories.push(...options.categories);
  } else if (options.category && options.category.trim().length > 0 && options.category !== "all") {
    activeCategories.push(
      ...options.category
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    );
  }

  if (activeCategories.length > 0) {
    result = result.filter((p) => activeCategories.includes(p.category));
  }

  // 2. Search Query: case-insensitive, partial-word, multi-token across all metadata fields
  if (options.query && options.query.trim().length > 0) {
    const qLower = options.query.trim().toLowerCase();
    const terms = qLower.split(/\s+/).filter(Boolean);

    result = result.filter((p) => {
      const catLabel = categoryLabelMap[p.category] ?? "";
      const brand = p.brand ?? "";
      const subcat = p.subcategory ?? "";
      const keywords = p.keywords ? p.keywords.join(" ") : "";
      const badge = p.badge ?? "";

      const searchableText =
        `${p.name} ${p.storeName} ${p.category} ${catLabel} ${brand} ${subcat} ${p.description} ${badge} ${keywords}`.toLowerCase();

      // Every term in multi-word query must match somewhere in the product corpus
      return terms.every((term) => searchableText.includes(term));
    });
  }

  // 3. Price Filter: exact numeric bounds or preset ranges
  if (options.minPrice !== undefined && !isNaN(options.minPrice) && options.minPrice >= 0) {
    result = result.filter((p) => p.price >= options.minPrice!);
  }

  if (options.maxPrice !== undefined && !isNaN(options.maxPrice) && options.maxPrice >= 0) {
    result = result.filter((p) => p.price <= options.maxPrice!);
  }

  if (
    options.priceRange &&
    options.priceRange !== "all" &&
    options.minPrice === undefined &&
    options.maxPrice === undefined
  ) {
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
      case "5000-20000":
        result = result.filter((p) => p.price >= 5000 && p.price <= 20000);
        break;
      case "above-20000":
        result = result.filter((p) => p.price > 20000);
        break;
    }
  }

  // 4. Rating Filter: minimum rating threshold
  if (options.minRating !== undefined && !isNaN(options.minRating) && options.minRating > 0) {
    result = result.filter((p) => p.rating >= options.minRating!);
  }

  // 5. Brand Filter: multi-brand array or single string
  const activeBrands: string[] = [];
  if (options.brands && options.brands.length > 0) {
    activeBrands.push(...options.brands);
  } else if (options.brand && options.brand.trim().length > 0 && options.brand !== "all") {
    activeBrands.push(
      ...options.brand
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
    );
  }

  if (activeBrands.length > 0) {
    const brandLowerSet = new Set(activeBrands.map((b) => b.toLowerCase()));
    result = result.filter((p) => p.brand && brandLowerSet.has(p.brand.toLowerCase()));
  }

  // 6. Availability Filter: in-stock vs out-of-stock
  if (options.availability === "in-stock") {
    result = result.filter(
      (p) => p.inStock !== false && (p.stockCount === undefined || p.stockCount > 0),
    );
  } else if (options.availability === "out-of-stock") {
    result = result.filter((p) => p.inStock === false || p.stockCount === 0);
  }

  // 7. On Sale Filter
  if (options.onSale) {
    result = result.filter(
      (p) => Boolean(p.badge) || discountPercent(p.price, p.originalPrice) > 0,
    );
  }

  // 8. Sorting
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
    case "best-selling":
    case "reviews-desc":
      result.sort((a, b) => b.reviews - a.reviews || b.rating - a.rating);
      break;
    case "newest":
      result.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA || b.id.localeCompare(a.id);
      });
      break;
    case "featured":
    default:
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
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
  const sort = search.sort ?? "featured";
  const priceRange = search.priceRange ?? "all";
  const minPrice = search.minPrice;
  const maxPrice = search.maxPrice;
  const minRating = search.minRating;
  const availability: AvailabilityOption = search.availability ?? "all";
  const onSale = search.onSale ?? false;
  const currentPage = search.page ?? 1;

  // Selected categories list
  const selectedCategories = useMemo(() => {
    if (search.categories && search.categories.length > 0) return search.categories;
    if (search.category && search.category !== "all") {
      return search.category
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }
    return [];
  }, [search.categories, search.category]);

  // Selected brands list
  const selectedBrands = useMemo(() => {
    if (search.brands && search.brands.length > 0) return search.brands;
    if (search.brand && search.brand !== "all") {
      return search.brand
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
    }
    return [];
  }, [search.brands, search.brand]);

  // Mobile Sheet open state
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Search input local state with live synchronization
  const [inputVal, setInputVal] = useState(query);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputVal(query);
  }, [query]);

  // Dynamic derivation of catalog categories with counts
  const categoriesList = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return categories.map((c) => ({
      id: c.id,
      label: c.label,
      count: map.get(c.id) ?? 0,
      icon: c.icon,
    }));
  }, []);

  // Dynamic derivation of all catalog brands with counts
  const brandsList = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (p.brand) {
        map.set(p.brand, (map.get(p.brand) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, []);

  // Stock status counts across whole catalog
  const inStockCount = useMemo(
    () =>
      products.filter(
        (p) => p.inStock !== false && (p.stockCount === undefined || p.stockCount > 0),
      ).length,
    [],
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.inStock === false || p.stockCount === 0).length,
    [],
  );

  // Filter and sort products with all combined filters
  const filtered = useMemo(() => {
    return filterAndSortProducts(products, {
      query,
      categories: selectedCategories,
      priceRange,
      minPrice,
      maxPrice,
      minRating,
      brands: selectedBrands,
      availability,
      onSale,
      sort,
    });
  }, [
    query,
    selectedCategories,
    priceRange,
    minPrice,
    maxPrice,
    minRating,
    selectedBrands,
    availability,
    onSale,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedList = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  // Live search debounced updater
  const triggerDebouncedSearch = useCallback(
    (text: string) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const trimmed = text.trim();
        void navigate({
          search: (prev) => ({
            ...prev,
            q: trimmed ? trimmed : undefined,
            page: undefined,
          }),
        });
      }, 250);
    },
    [navigate],
  );

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    triggerDebouncedSearch(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const trimmed = inputVal.trim();
    void navigate({
      search: (prev) => ({
        ...prev,
        q: trimmed ? trimmed : undefined,
        page: undefined,
      }),
    });
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setInputVal("");
    void navigate({
      search: (prev) => ({
        ...prev,
        q: undefined,
        page: undefined,
      }),
    });
  };

  // Category toggle handler
  const handleCategoryToggle = (catId: string) => {
    const nextCategories = selectedCategories.includes(catId)
      ? selectedCategories.filter((c) => c !== catId)
      : [...selectedCategories, catId];

    void navigate({
      search: (prev) => ({
        ...prev,
        category: undefined,
        categories: nextCategories.length > 0 ? nextCategories : undefined,
        page: undefined,
      }),
    });
  };

  const handleSelectAllCategories = () => {
    void navigate({
      search: (prev) => ({
        ...prev,
        category: undefined,
        categories: undefined,
        page: undefined,
      }),
    });
  };

  // Brand toggle handler
  const handleBrandToggle = (brandName: string) => {
    const nextBrands = selectedBrands.includes(brandName)
      ? selectedBrands.filter((b) => b !== brandName)
      : [...selectedBrands, brandName];

    void navigate({
      search: (prev) => ({
        ...prev,
        brand: undefined,
        brands: nextBrands.length > 0 ? nextBrands : undefined,
        page: undefined,
      }),
    });
  };

  const handleClearBrands = () => {
    void navigate({
      search: (prev) => ({
        ...prev,
        brand: undefined,
        brands: undefined,
        page: undefined,
      }),
    });
  };

  // Price change handlers
  const handlePriceChange = (min?: number, max?: number) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        minPrice: min,
        maxPrice: max,
        priceRange: undefined,
        page: undefined,
      }),
    });
  };

  const handlePricePresetSelect = (preset: PriceRangeOption) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        priceRange: preset === "all" ? undefined : preset,
        minPrice: undefined,
        maxPrice: undefined,
        page: undefined,
      }),
    });
  };

  // Rating filter handler
  const handleRatingSelect = (rating?: number) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        minRating: rating,
        page: undefined,
      }),
    });
  };

  // Availability filter handler
  const handleAvailabilitySelect = (val: AvailabilityOption) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        availability: val === "all" ? undefined : val,
        page: undefined,
      }),
    });
  };

  // Sort handler
  const handleSortChange = (newSort: SortOption) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        sort: newSort === "featured" ? undefined : newSort,
        page: undefined,
      }),
    });
  };

  // On Sale toggle
  const handleToggleOnSale = () => {
    void navigate({
      search: (prev) => ({
        ...prev,
        onSale: prev.onSale ? undefined : true,
        page: undefined,
      }),
    });
  };

  // Pagination handler
  const handlePageChange = (newPage: number) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        page: newPage === 1 ? undefined : newPage,
      }),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset all filters
  const handleResetFilters = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setInputVal("");
    void navigate({
      search: () => ({}),
    });
  };

  const hasActiveFilters = Boolean(
    query ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    (priceRange && priceRange !== "all") ||
    minRating !== undefined ||
    (availability && availability !== "all") ||
    onSale ||
    (sort && sort !== "featured"),
  );

  const activeFiltersCount =
    (query ? 1 : 0) +
    selectedCategories.length +
    selectedBrands.length +
    (minPrice !== undefined || maxPrice !== undefined || (priceRange && priceRange !== "all")
      ? 1
      : 0) +
    (minRating !== undefined ? 1 : 0) +
    (availability && availability !== "all" ? 1 : 0) +
    (onSale ? 1 : 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      {/* Header & Live Search Bar */}
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
              ? `Results matching "${query}"`
              : selectedCategories.length === 1
                ? `Browsing ${categoryLabelMap[selectedCategories[0]!] ?? selectedCategories[0]}`
                : `Over ${products.length} products across 10 retail categories with instant live search.`}
          </p>
        </div>

        {/* Live Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <label htmlFor={searchInputId} className="sr-only">
            Search products
          </label>
          <input
            id={searchInputId}
            type="text"
            value={inputVal}
            onChange={handleSearchInputChange}
            placeholder="Search by name, category, brand, description..."
            className="w-full rounded-full border bg-card py-2.5 pl-10 pr-20 text-sm text-foreground shadow-soft placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          {inputVal && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search query"
              className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary-dark"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills Strip with Icons */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={handleSelectAllCategories}
          aria-pressed={selectedCategories.length === 0}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
            selectedCategories.length === 0
              ? "bg-primary text-primary-foreground shadow-soft"
              : "border bg-card text-muted-foreground hover:border-primary hover:text-primary",
          )}
        >
          All ({products.length})
        </button>
        {categoriesList.map((c) => {
          const isSelected = selectedCategories.includes(c.id);
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategoryToggle(c.id)}
              aria-pressed={isSelected}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border bg-card text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {Icon && <Icon className="size-3.5" />}
              <span>{c.label}</span>
              <span className="opacity-75">({c.count})</span>
            </button>
          );
        })}
      </div>

      {/* Main Layout: Desktop Sidebar Filter Panel + Products Grid */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-4 xl:grid-cols-5">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:col-span-1 lg:block">
          <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-soft">
            <ProductFilterPanel
              categoriesList={categoriesList}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onSelectAllCategories={handleSelectAllCategories}
              brandsList={brandsList}
              selectedBrands={selectedBrands}
              onBrandToggle={handleBrandToggle}
              onClearBrands={handleClearBrands}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
              pricePreset={priceRange}
              onPricePresetSelect={handlePricePresetSelect}
              minRating={minRating}
              onRatingSelect={handleRatingSelect}
              availability={availability}
              onAvailabilitySelect={handleAvailabilitySelect}
              inStockCount={inStockCount}
              outOfStockCount={outOfStockCount}
              totalCatalogCount={products.length}
              onSale={onSale}
              onSaleToggle={handleToggleOnSale}
              hasActiveFilters={hasActiveFilters}
              onResetAll={handleResetFilters}
            />
          </div>
        </aside>

        {/* Products Column */}
        <div className="lg:col-span-3 xl:col-span-4">
          {/* Top Control Bar: Mobile Filter Button, Sort Selector, Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-3 shadow-soft sm:px-4">
            <div className="flex items-center gap-2">
              {/* Mobile Filter Drawer Trigger */}
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary lg:hidden"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto p-6">
                  <SheetHeader className="mb-4 text-left">
                    <SheetTitle className="text-lg font-bold">Filter Products</SheetTitle>
                  </SheetHeader>
                  <ProductFilterPanel
                    categoriesList={categoriesList}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    onSelectAllCategories={handleSelectAllCategories}
                    brandsList={brandsList}
                    selectedBrands={selectedBrands}
                    onBrandToggle={handleBrandToggle}
                    onClearBrands={handleClearBrands}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onPriceChange={handlePriceChange}
                    pricePreset={priceRange}
                    onPricePresetSelect={handlePricePresetSelect}
                    minRating={minRating}
                    onRatingSelect={handleRatingSelect}
                    availability={availability}
                    onAvailabilitySelect={handleAvailabilitySelect}
                    inStockCount={inStockCount}
                    outOfStockCount={outOfStockCount}
                    totalCatalogCount={products.length}
                    onSale={onSale}
                    onSaleToggle={handleToggleOnSale}
                    hasActiveFilters={hasActiveFilters}
                    onResetAll={handleResetFilters}
                    isMobile
                    onCloseMobile={() => setMobileSheetOpen(false)}
                  />
                </SheetContent>
              </Sheet>

              {/* Matching products counter */}
              <span className="text-xs text-muted-foreground">
                Showing <strong className="text-foreground">{paginatedList.length}</strong> of{" "}
                <strong className="text-foreground">{filtered.length}</strong> products
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <label
                htmlFor="shop-sort"
                className="flex items-center gap-1 font-medium text-muted-foreground"
              >
                <ArrowUpDown className="size-3.5 text-muted-foreground" />
                <span>Sort by:</span>
              </label>
              <select
                id="shop-sort"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="best-selling">Popularity: Best Selling</option>
                <option value="newest">Newest Arrivals</option>
                <option value="rating-desc">Customer Rating: Highest First</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips Row */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Active Filters:
              </span>

              {/* Query Pill */}
              {query && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                  <span>Search: "{query}"</span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-primary-dark"
                    title="Remove search filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {/* Category Pills */}
              {selectedCategories.map((catId) => (
                <span
                  key={catId}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-medium text-primary"
                >
                  <span>Category: {categoryLabelMap[catId] ?? catId}</span>
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(catId)}
                    className="hover:text-primary-dark"
                    title={`Remove category ${categoryLabelMap[catId] ?? catId}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}

              {/* Brand Pills */}
              {selectedBrands.map((brandName) => (
                <span
                  key={brandName}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-medium text-primary"
                >
                  <span>Brand: {brandName}</span>
                  <button
                    type="button"
                    onClick={() => handleBrandToggle(brandName)}
                    className="hover:text-primary-dark"
                    title={`Remove brand ${brandName}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}

              {/* Price Range Pill */}
              {(minPrice !== undefined || maxPrice !== undefined) && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                  <span>
                    Price: {minPrice !== undefined ? formatINR(minPrice) : "₹0"} –{" "}
                    {maxPrice !== undefined ? formatINR(maxPrice) : "Any"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePriceChange(undefined, undefined)}
                    className="hover:text-primary-dark"
                    title="Remove price filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {priceRange &&
                priceRange !== "all" &&
                minPrice === undefined &&
                maxPrice === undefined && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                    <span>
                      Price:{" "}
                      {priceRange === "under-2000"
                        ? "< ₹2,000"
                        : priceRange === "2000-5000"
                          ? "₹2,000–₹5,000"
                          : priceRange === "5000-20000"
                            ? "₹5,000–₹20,000"
                            : priceRange === "above-20000"
                              ? "> ₹20,000"
                              : "> ₹5,000"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePricePresetSelect("all")}
                      className="hover:text-primary-dark"
                      title="Remove price range"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}

              {/* Rating Pill */}
              {minRating !== undefined && minRating > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                  <span>Rating: {minRating}★ & above</span>
                  <button
                    type="button"
                    onClick={() => handleRatingSelect(undefined)}
                    className="hover:text-primary-dark"
                    title="Remove rating filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {/* Availability Pill */}
              {availability && availability !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                  <span>Availability: {availability === "in-stock" ? "In Stock" : "Sold Out"}</span>
                  <button
                    type="button"
                    onClick={() => handleAvailabilitySelect("all")}
                    className="hover:text-primary-dark"
                    title="Remove availability filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {/* On Sale Pill */}
              {onSale && (
                <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 font-medium text-destructive">
                  <span>On Sale Only</span>
                  <button
                    type="button"
                    onClick={handleToggleOnSale}
                    className="hover:text-destructive-dark"
                    title="Remove on sale filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {/* Clear All Action */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <RotateCcw className="size-2.5" />
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {paginatedList.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border bg-card p-12 text-center shadow-soft">
              <SearchX className="size-12 text-muted-foreground/60" />
              <h2 className="text-base font-semibold text-foreground">
                No matching products found
              </h2>
              <p className="max-w-md text-xs text-muted-foreground">
                We couldn't find any items matching your active query and filter combination. Try
                broadening your search terms, clearing specific filters, or adjusting the price
                range.
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
        </div>
      </div>
    </section>
  );
}
