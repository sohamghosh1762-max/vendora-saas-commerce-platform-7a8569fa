import {
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { categories as defaultCategories, type Category } from "@/data/categories";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PriceRangeOption =
  "all" | "under-2000" | "2000-5000" | "above-5000" | "5000-20000" | "above-20000";
export type AvailabilityOption = "all" | "in-stock" | "out-of-stock";

export interface BrandCount {
  name: string;
  count: number;
}

export interface CategoryCount {
  id: string;
  label: string;
  count: number;
  icon?: Category["icon"];
}

export interface ProductFilterPanelProps {
  categoriesList: CategoryCount[];
  selectedCategories: string[];
  onCategoryToggle: (catId: string) => void;
  onSelectAllCategories: () => void;

  brandsList: BrandCount[];
  selectedBrands: string[];
  onBrandToggle: (brand: string) => void;
  onClearBrands: () => void;

  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  onPriceChange: (min?: number, max?: number) => void;
  pricePreset?: PriceRangeOption | undefined;
  onPricePresetSelect: (preset: PriceRangeOption) => void;

  minRating?: number | undefined;
  onRatingSelect: (rating?: number) => void;

  availability: AvailabilityOption;
  onAvailabilitySelect: (val: AvailabilityOption) => void;
  inStockCount?: number;
  outOfStockCount?: number;
  totalCatalogCount?: number;

  onSale: boolean;
  onSaleToggle: () => void;

  hasActiveFilters: boolean;
  onResetAll: () => void;

  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function ProductFilterPanel({
  categoriesList,
  selectedCategories,
  onCategoryToggle,
  onSelectAllCategories,
  brandsList,
  selectedBrands,
  onBrandToggle,
  onClearBrands,
  minPrice,
  maxPrice,
  onPriceChange,
  pricePreset = "all",
  onPricePresetSelect,
  minRating,
  onRatingSelect,
  availability,
  onAvailabilitySelect,
  inStockCount,
  outOfStockCount,
  totalCatalogCount,
  onSale,
  onSaleToggle,
  hasActiveFilters,
  onResetAll,
  isMobile = false,
  onCloseMobile,
}: ProductFilterPanelProps) {
  const brandSearchId = useId();
  const [brandSearch, setBrandSearch] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Local state for custom price inputs to allow typing before applying
  const [localMin, setLocalMin] = useState(minPrice !== undefined ? String(minPrice) : "");
  const [localMax, setLocalMax] = useState(maxPrice !== undefined ? String(maxPrice) : "");
  const [priceError, setPriceError] = useState<string | null>(null);

  // Synchronize when external props change
  const currentMinProp = minPrice !== undefined ? String(minPrice) : "";
  const currentMaxProp = maxPrice !== undefined ? String(maxPrice) : "";
  if (minPrice === undefined && localMin !== "" && pricePreset !== undefined) {
    // reset if cleared from outside
  }

  // Filtered brands by brand search term
  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brandsList;
    const q = brandSearch.trim().toLowerCase();
    return brandsList.filter((b) => b.name.toLowerCase().includes(q));
  }, [brandsList, brandSearch]);

  const displayedBrands =
    showAllBrands || brandSearch.trim() ? filteredBrands : filteredBrands.slice(0, 7);

  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPriceError(null);

    const minNum = localMin.trim() ? parseInt(localMin.replace(/\D/g, ""), 10) : undefined;
    const maxNum = localMax.trim() ? parseInt(localMax.replace(/\D/g, ""), 10) : undefined;

    if (minNum !== undefined && minNum < 0) {
      setPriceError("Minimum price cannot be negative.");
      return;
    }
    if (maxNum !== undefined && maxNum < 0) {
      setPriceError("Maximum price cannot be negative.");
      return;
    }
    if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
      setPriceError("Min price cannot exceed Max price.");
      return;
    }

    onPriceChange(minNum, maxNum);
  };

  const handleClearCustomPrice = () => {
    setLocalMin("");
    setLocalMax("");
    setPriceError(null);
    onPriceChange(undefined, undefined);
  };

  return (
    <div className={cn("flex flex-col gap-6 text-sm", isMobile ? "pb-6" : "")}>
      {/* Header with Title and Reset Button */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-primary" />
          <h2 className="font-bold tracking-tight text-foreground">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setLocalMin("");
              setLocalMax("");
              setPriceError(null);
              setBrandSearch("");
              onResetAll();
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft hover:text-primary-dark"
          >
            <RotateCcw className="size-3" />
            Clear All
          </button>
        )}
      </div>

      {/* 1. Category Filter */}
      <div className="border-b pb-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-foreground">Categories</span>
          {selectedCategories.length > 0 && (
            <button
              type="button"
              onClick={onSelectAllCategories}
              className="text-xs text-primary hover:underline"
            >
              All Categories
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onSelectAllCategories}
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              selectedCategories.length === 0
                ? "bg-primary text-primary-foreground font-semibold shadow-soft"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <span>All Categories</span>
            <span className="text-[11px] opacity-80">
              {totalCatalogCount !== undefined ? `(${totalCatalogCount})` : ""}
            </span>
          </button>

          {categoriesList.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryToggle(cat.id)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "grid size-4 place-items-center rounded border transition-colors",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background",
                    )}
                  >
                    {isSelected && <Check className="size-3 stroke-[3]" />}
                  </div>
                  {Icon && <Icon className="size-3.5 shrink-0" />}
                  <span>{cat.label}</span>
                </div>
                <span className="text-[11px] opacity-70">({cat.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range Filter */}
      <div className="border-b pb-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-foreground">Price Range</span>
          {(minPrice !== undefined ||
            maxPrice !== undefined ||
            (pricePreset && pricePreset !== "all")) && (
            <button
              type="button"
              onClick={handleClearCustomPrice}
              className="text-xs text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "under-2000", label: "< ₹2K" },
            { id: "2000-5000", label: "₹2K–₹5K" },
            { id: "5000-20000", label: "₹5K–₹20K" },
            { id: "above-20000", label: "> ₹20K" },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setLocalMin("");
                setLocalMax("");
                setPriceError(null);
                onPricePresetSelect(preset.id as PriceRangeOption);
              }}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                pricePreset === preset.id && minPrice === undefined && maxPrice === undefined
                  ? "border-primary bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Min / Max Inputs */}
        <form onSubmit={handleApplyPrice} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground">Min (₹)</label>
              <div className="relative mt-0.5">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border bg-background py-1.5 pl-6 pr-2 text-xs text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground">Max (₹)</label>
              <div className="relative mt-0.5">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  placeholder="2,00,000"
                  className="w-full rounded-lg border bg-background py-1.5 pl-6 pr-2 text-xs text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {priceError && <p className="text-[11px] font-medium text-destructive">{priceError}</p>}

          <button
            type="submit"
            className="w-full rounded-lg border border-primary/30 bg-primary/10 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* 3. Rating Filter */}
      <div className="border-b pb-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-foreground">Customer Rating</span>
          {minRating !== undefined && minRating > 0 && (
            <button
              type="button"
              onClick={() => onRatingSelect(undefined)}
              className="text-xs text-primary hover:underline"
            >
              All ratings
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onRatingSelect(undefined)}
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              minRating === undefined
                ? "bg-primary text-primary-foreground font-semibold shadow-soft"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <span>All Ratings</span>
          </button>

          {[
            { stars: 4, label: "4★ & above" },
            { stars: 3, label: "3★ & above" },
            { stars: 2, label: "2★ & above" },
          ].map((r) => {
            const isSelected = minRating === r.stars;
            return (
              <button
                key={r.stars}
                type="button"
                onClick={() => onRatingSelect(isSelected ? undefined : r.stars)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-3.5",
                          i < r.stars
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted-foreground/30",
                        )}
                      />
                    ))}
                  </div>
                  <span>{r.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Availability Filter */}
      <div className="border-b pb-5">
        <span className="mb-3 block font-semibold text-foreground">Availability</span>
        <div className="grid grid-cols-3 gap-1.5 rounded-lg border bg-muted/40 p-1 text-xs">
          {[
            { id: "all", label: "All", count: totalCatalogCount },
            { id: "in-stock", label: "In Stock", count: inStockCount },
            { id: "out-of-stock", label: "Sold Out", count: outOfStockCount },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onAvailabilitySelect(opt.id as AvailabilityOption)}
              className={cn(
                "rounded-md py-1.5 text-center text-[11px] font-semibold transition-all",
                availability === opt.id
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div>{opt.label}</div>
              {opt.count !== undefined && (
                <div className="text-[9px] opacity-70">({opt.count})</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Brand Filter */}
      <div className="border-b pb-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-semibold text-foreground">Brand</span>
          {selectedBrands.length > 0 && (
            <button
              type="button"
              onClick={onClearBrands}
              className="text-xs text-primary hover:underline"
            >
              Clear ({selectedBrands.length})
            </button>
          )}
        </div>

        {/* Live Brand Search Input */}
        <div className="relative mb-2.5">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            id={brandSearchId}
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search brands..."
            className="w-full rounded-lg border bg-background py-1.5 pl-8 pr-6 text-xs text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {brandSearch && (
            <button
              type="button"
              onClick={() => setBrandSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {/* Brand Checklist */}
        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto pr-1 text-xs scrollbar-thin">
          {displayedBrands.length > 0 ? (
            displayedBrands.map((b) => {
              const isSelected = selectedBrands.includes(b.name);
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => onBrandToggle(b.name)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2 py-1 text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={cn(
                        "grid size-3.5 place-items-center rounded border transition-colors shrink-0",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-background",
                      )}
                    >
                      {isSelected && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{b.name}</span>
                  </div>
                  <span className="text-[11px] opacity-70 shrink-0 ml-1">({b.count})</span>
                </button>
              );
            })
          ) : (
            <div className="py-2 text-center text-xs text-muted-foreground">
              No brand matching "{brandSearch}"
            </div>
          )}
        </div>

        {/* Show More / Less Toggle */}
        {!brandSearch && filteredBrands.length > 7 && (
          <button
            type="button"
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {showAllBrands ? (
              <>
                Show less <ChevronUp className="size-3" />
              </>
            ) : (
              <>
                Show more ({filteredBrands.length - 7}) <ChevronDown className="size-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* 6. On Sale Special Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onSaleToggle}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border p-3 transition-colors",
            onSale
              ? "border-destructive/40 bg-destructive/10 text-destructive font-semibold shadow-soft"
              : "border-border bg-card text-foreground hover:border-primary/40",
          )}
        >
          <div className="flex items-center gap-2">
            <Tag className={cn("size-4", onSale ? "text-destructive" : "text-muted-foreground")} />
            <span>On Sale & Special Offers</span>
          </div>
          <div
            className={cn(
              "grid size-4 place-items-center rounded border transition-colors",
              onSale
                ? "border-destructive bg-destructive text-destructive-foreground"
                : "border-muted-foreground/30 bg-background",
            )}
          >
            {onSale && <Check className="size-3 stroke-[3]" />}
          </div>
        </button>
      </div>

      {/* Mobile Drawer Footer CTA */}
      {isMobile && onCloseMobile && (
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-4 border-t bg-background/95 p-4 backdrop-blur-md">
          <div className="flex gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setLocalMin("");
                  setLocalMax("");
                  setPriceError(null);
                  onResetAll();
                }}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-dark"
            >
              View Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
