import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { filterAndSortProducts, type FilterAndSortOptions } from "@/routes/shop";
import { ProductFilterPanel } from "@/components/marketplace/ProductFilterPanel";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

describe("Prompt 2: Advanced Search, Filters & Sorting Catalog Logic", () => {
  // -----------------------------------------------------------
  // 1. PRODUCT SEARCH
  // -----------------------------------------------------------
  describe("Product Search", () => {
    it("searches by exact product name", () => {
      const results = filterAndSortProducts(products, {
        query: "Wireless Over-Ear ANC Headphones",
      });
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.name).toContain("Wireless Over-Ear ANC Headphones");
    });

    it("searches case-insensitively and with partial words", () => {
      // Partial word "phon" matches Headphones and iPhones
      const results = filterAndSortProducts(products, { query: "phon" });
      expect(results.length).toBeGreaterThan(1);
      expect(results.some((p) => p.name.toLowerCase().includes("headphones"))).toBe(true);
      expect(results.some((p) => p.name.toLowerCase().includes("phone"))).toBe(true);

      // Case variations
      const upper = filterAndSortProducts(products, { query: "ACOUSTIX" });
      const lower = filterAndSortProducts(products, { query: "acoustix" });
      expect(upper.length).toBe(lower.length);
      expect(upper.length).toBeGreaterThan(0);
    });

    it("searches by category and category label", () => {
      const catResults = filterAndSortProducts(products, { query: "electronics" });
      expect(catResults.length).toBeGreaterThanOrEqual(40);

      const labelResults = filterAndSortProducts(products, { query: "Home & Living" });
      expect(labelResults.length).toBeGreaterThanOrEqual(20);
    });

    it("searches by brand name", () => {
      const appleResults = filterAndSortProducts(products, { query: "Apple" });
      expect(appleResults.length).toBeGreaterThanOrEqual(3);
      expect(appleResults.every((p) => p.brand === "Apple" || p.name.includes("Apple"))).toBe(true);

      const nikeResults = filterAndSortProducts(products, { query: "Nike" });
      expect(nikeResults.length).toBeGreaterThan(0);
      expect(nikeResults.every((p) => p.brand === "Nike" || p.name.includes("Nike"))).toBe(true);
    });

    it("searches by product description and keywords", () => {
      const noiseCancelling = filterAndSortProducts(products, {
        query: "active noise cancellation",
      });
      expect(noiseCancelling.length).toBeGreaterThan(0);
      expect(
        noiseCancelling.every((p) =>
          p.description.toLowerCase().includes("active noise cancellation"),
        ),
      ).toBe(true);

      const surgicalSteel = filterAndSortProducts(products, { query: "surgical grade" });
      expect(surgicalSteel.length).toBeGreaterThan(0);
    });

    it("handles multi-token search terms", () => {
      const multiToken = filterAndSortProducts(products, { query: "apple macbook" });
      expect(multiToken.length).toBeGreaterThanOrEqual(2);
      expect(
        multiToken.every(
          (p) => p.name.toLowerCase().includes("apple") && p.name.toLowerCase().includes("macbook"),
        ),
      ).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // 2. CATEGORY FILTERS
  // -----------------------------------------------------------
  describe("Category Filters", () => {
    it("filters products by single category", () => {
      const fashion = filterAndSortProducts(products, { category: "fashion" });
      expect(fashion.length).toBeGreaterThanOrEqual(20);
      expect(fashion.every((p) => p.category === "fashion")).toBe(true);
    });

    it("filters products by multiple categories simultaneously", () => {
      const multiCat = filterAndSortProducts(products, { categories: ["fashion", "sports"] });
      expect(multiCat.length).toBeGreaterThanOrEqual(40);
      expect(multiCat.every((p) => p.category === "fashion" || p.category === "sports")).toBe(true);
      expect(multiCat.some((p) => p.category === "fashion")).toBe(true);
      expect(multiCat.some((p) => p.category === "sports")).toBe(true);
    });

    it("treats 'all' or empty categories as including all categories", () => {
      const all1 = filterAndSortProducts(products, { category: "all" });
      const all2 = filterAndSortProducts(products, { categories: [] });
      expect(all1.length).toBe(products.length);
      expect(all2.length).toBe(products.length);
    });
  });

  // -----------------------------------------------------------
  // 3. PRICE RANGE FILTER
  // -----------------------------------------------------------
  describe("Price Range Filter", () => {
    it("filters products by minPrice and maxPrice numeric bounds", () => {
      const filtered = filterAndSortProducts(products, { minPrice: 2000, maxPrice: 5000 });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((p) => p.price >= 2000 && p.price <= 5000)).toBe(true);
    });

    it("filters products by minPrice only", () => {
      const filtered = filterAndSortProducts(products, { minPrice: 50000 });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((p) => p.price >= 50000)).toBe(true);
    });

    it("filters products by maxPrice only", () => {
      const filtered = filterAndSortProducts(products, { maxPrice: 1500 });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((p) => p.price <= 1500)).toBe(true);
    });

    it("supports preset price ranges", () => {
      const under2k = filterAndSortProducts(products, { priceRange: "under-2000" });
      expect(under2k.every((p) => p.price < 2000)).toBe(true);

      const high = filterAndSortProducts(products, { priceRange: "above-20000" });
      expect(high.every((p) => p.price > 20000)).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // 4. RATING FILTER
  // -----------------------------------------------------------
  describe("Rating Filter", () => {
    it("filters products by 4 stars and above", () => {
      const rated4 = filterAndSortProducts(products, { minRating: 4 });
      expect(rated4.length).toBeGreaterThan(0);
      expect(rated4.every((p) => p.rating >= 4.0)).toBe(true);
    });

    it("filters products by 4.8 stars and above", () => {
      const rated48 = filterAndSortProducts(products, { minRating: 4.8 });
      expect(rated48.length).toBeGreaterThan(0);
      expect(rated48.every((p) => p.rating >= 4.8)).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // 5. BRAND FILTER
  // -----------------------------------------------------------
  describe("Brand Filter", () => {
    it("filters products by a single brand", () => {
      const appleProducts = filterAndSortProducts(products, { brands: ["Apple"] });
      expect(appleProducts.length).toBeGreaterThan(0);
      expect(appleProducts.every((p) => p.brand === "Apple")).toBe(true);
    });

    it("filters products by multiple brands", () => {
      const brands = filterAndSortProducts(products, { brands: ["Apple", "Dell"] });
      expect(brands.length).toBeGreaterThan(1);
      expect(brands.every((p) => p.brand === "Apple" || p.brand === "Dell")).toBe(true);
      expect(brands.some((p) => p.brand === "Apple")).toBe(true);
      expect(brands.some((p) => p.brand === "Dell")).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // 6. AVAILABILITY FILTER
  // -----------------------------------------------------------
  describe("Availability Filter", () => {
    it("filters in-stock products", () => {
      const inStock = filterAndSortProducts(products, { availability: "in-stock" });
      expect(inStock.length).toBeGreaterThan(0);
      expect(
        inStock.every(
          (p) => p.inStock !== false && (p.stockCount === undefined || p.stockCount > 0),
        ),
      ).toBe(true);
    });

    it("filters out-of-stock products", () => {
      const outOfStock = filterAndSortProducts(products, { availability: "out-of-stock" });
      expect(outOfStock.length).toBe(4);
      expect(outOfStock.every((p) => p.inStock === false || p.stockCount === 0)).toBe(true);
    });

    it("returns all products when availability is 'all'", () => {
      const all = filterAndSortProducts(products, { availability: "all" });
      expect(all.length).toBe(products.length);
    });
  });

  // -----------------------------------------------------------
  // 7. SORTING
  // -----------------------------------------------------------
  describe("Sorting Options", () => {
    it("sorts by Price: Low to High", () => {
      const sorted = filterAndSortProducts(products, { sort: "price-asc" });
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i]!.price).toBeLessThanOrEqual(sorted[i + 1]!.price);
      }
    });

    it("sorts by Price: High to Low", () => {
      const sorted = filterAndSortProducts(products, { sort: "price-desc" });
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i]!.price).toBeGreaterThanOrEqual(sorted[i + 1]!.price);
      }
    });

    it("sorts by Customer Rating: Highest First", () => {
      const sorted = filterAndSortProducts(products, { sort: "rating-desc" });
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i]!.rating).toBeGreaterThanOrEqual(sorted[i + 1]!.rating);
      }
    });

    it("sorts by Popularity: Best Selling", () => {
      const sorted = filterAndSortProducts(products, { sort: "best-selling" });
      expect(sorted.length).toBe(products.length);
      expect(sorted[0]!.reviews).toBeGreaterThanOrEqual(sorted[1]!.reviews);
    });

    it("sorts by Newest Arrivals using valid creation timestamps in descending order", () => {
      const sorted = filterAndSortProducts(products, { sort: "newest" });
      expect(sorted.length).toBe(products.length);
      for (let i = 0; i < sorted.length - 1; i++) {
        const timeCurrent = new Date(sorted[i]!.createdAt!).getTime();
        const timeNext = new Date(sorted[i + 1]!.createdAt!).getTime();
        expect(timeCurrent).toBeGreaterThanOrEqual(timeNext);
      }
    });

    it("sorts by Featured picks", () => {
      const sorted = filterAndSortProducts(products, { sort: "featured" });
      expect(sorted[0]!.featured).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // 8. COMBINED FILTERING
  // -----------------------------------------------------------
  describe("Combined Multi-Filter Workflow", () => {
    it("applies search, category, brand, price, rating, availability, and sort simultaneously", () => {
      const result = filterAndSortProducts(products, {
        query: "Pro",
        category: "electronics",
        brand: "Apple",
        minPrice: 100000,
        maxPrice: 220000,
        minRating: 4.5,
        availability: "in-stock",
        sort: "price-asc",
      });

      expect(result.length).toBeGreaterThan(0);
      for (const item of result) {
        expect(item.category).toBe("electronics");
        expect(item.brand).toBe("Apple");
        expect(item.price).toBeGreaterThanOrEqual(100000);
        expect(item.price).toBeLessThanOrEqual(220000);
        expect(item.rating).toBeGreaterThanOrEqual(4.5);
        expect(item.inStock).toBe(true);
      }

      // Verify price ascending order
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]!.price).toBeLessThanOrEqual(result[i + 1]!.price);
      }
    });

    it("preserves other filters when one filter is modified or removed", () => {
      const baseFilter: FilterAndSortOptions = {
        category: "electronics",
        brand: "Apple",
        minPrice: 100000,
        availability: "in-stock",
      };

      const withMinPrice = filterAndSortProducts(products, baseFilter);
      // Remove minPrice but keep others
      const withoutMinPrice = filterAndSortProducts(products, {
        ...baseFilter,
        minPrice: undefined,
      });

      expect(withoutMinPrice.length).toBeGreaterThanOrEqual(withMinPrice.length);
      expect(
        withoutMinPrice.every((p) => p.category === "electronics" && p.brand === "Apple"),
      ).toBe(true);
    });
  });

  // -----------------------------------------------------------
  // 9. ZERO MATCHES AND EMPTY STATE
  // -----------------------------------------------------------
  describe("Zero Matches Combination", () => {
    it("returns zero results gracefully when filters have no overlap", () => {
      // Searching for "iPhone" in Category "food"
      const result = filterAndSortProducts(products, {
        query: "iPhone",
        category: "food",
      });
      expect(result.length).toBe(0);

      // Impossibly high minimum price
      const noPriceMatches = filterAndSortProducts(products, { minPrice: 999999999 });
      expect(noPriceMatches.length).toBe(0);
    });
  });
});

describe("ProductFilterPanel Component", () => {
  const dummyCategories = [
    { id: "electronics", label: "Electronics", count: 45 },
    { id: "fashion", label: "Fashion", count: 25 },
  ];
  const dummyBrands = [
    { name: "Apple", count: 8 },
    { name: "Nike", count: 6 },
    { name: "Sony", count: 4 },
  ];

  it("renders filter section titles and categories with counts", () => {
    render(
      <ProductFilterPanel
        categoriesList={dummyCategories}
        selectedCategories={[]}
        onCategoryToggle={() => {}}
        onSelectAllCategories={() => {}}
        brandsList={dummyBrands}
        selectedBrands={[]}
        onBrandToggle={() => {}}
        onClearBrands={() => {}}
        onPriceChange={() => {}}
        onPricePresetSelect={() => {}}
        onRatingSelect={() => {}}
        availability="all"
        onAvailabilitySelect={() => {}}
        onSale={false}
        onSaleToggle={() => {}}
        hasActiveFilters={false}
        onResetAll={() => {}}
        totalCatalogCount={70}
      />,
    );

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("(45)")).toBeInTheDocument();
    expect(screen.getByText("Fashion")).toBeInTheDocument();
    expect(screen.getByText("(25)")).toBeInTheDocument();
    expect(screen.getByText("Price Range")).toBeInTheDocument();
    expect(screen.getByText("Customer Rating")).toBeInTheDocument();
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.getByText("Brand")).toBeInTheDocument();
  });

  it("allows searching through the brands list", () => {
    render(
      <ProductFilterPanel
        categoriesList={dummyCategories}
        selectedCategories={[]}
        onCategoryToggle={() => {}}
        onSelectAllCategories={() => {}}
        brandsList={dummyBrands}
        selectedBrands={[]}
        onBrandToggle={() => {}}
        onClearBrands={() => {}}
        onPriceChange={() => {}}
        onPricePresetSelect={() => {}}
        onRatingSelect={() => {}}
        availability="all"
        onAvailabilitySelect={() => {}}
        onSale={false}
        onSaleToggle={() => {}}
        hasActiveFilters={false}
        onResetAll={() => {}}
      />,
    );

    const brandInput = screen.getByPlaceholderText(/search brands/i);
    fireEvent.change(brandInput, { target: { value: "Apple" } });

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.queryByText("Nike")).not.toBeInTheDocument();
  });

  it("calls onResetAll when Clear All is clicked", () => {
    let resetClicked = false;
    render(
      <ProductFilterPanel
        categoriesList={dummyCategories}
        selectedCategories={["electronics"]}
        onCategoryToggle={() => {}}
        onSelectAllCategories={() => {}}
        brandsList={dummyBrands}
        selectedBrands={["Apple"]}
        onBrandToggle={() => {}}
        onClearBrands={() => {}}
        onPriceChange={() => {}}
        onPricePresetSelect={() => {}}
        onRatingSelect={() => {}}
        availability="in-stock"
        onAvailabilitySelect={() => {}}
        onSale={true}
        onSaleToggle={() => {}}
        hasActiveFilters={true}
        onResetAll={() => {
          resetClicked = true;
        }}
      />,
    );

    const clearAllBtn = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearAllBtn);
    expect(resetClicked).toBe(true);
  });
});
