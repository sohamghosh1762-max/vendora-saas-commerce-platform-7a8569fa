import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { CartProvider } from "@/lib/cart";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { filterAndSortProducts } from "@/routes/shop";
import { products, getProduct, getProductsByCategory, getProductsByStore } from "@/data/products";
import { categories } from "@/data/categories";
import { stores } from "@/data/stores";

function renderWithRouter(component: () => React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <CartProvider>{component()}</CartProvider>
      </QueryClientProvider>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });

  const productRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/product/$id",
  });

  const storeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/store/$id",
  });

  const routeTree = rootRoute.addChildren([indexRoute, productRoute, storeRoute]);
  const history = createMemoryHistory({ initialEntries: ["/"] });
  const router = createRouter({ routeTree, history });

  return render(<RouterProvider router={router} />);
}

describe("Product Catalog Data Integrity", () => {
  it("contains at least 200 distinct products", () => {
    expect(products.length).toBeGreaterThanOrEqual(200);
  });

  it("ensures every product has a unique ID", () => {
    const ids = products.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(products.length);
  });

  it("covers all 10 defined categories with at least 20 products each", () => {
    for (const cat of categories) {
      const items = getProductsByCategory(cat.id);
      expect(items.length).toBeGreaterThanOrEqual(20);
    }
  });

  it("provides significantly expanded Electronics & Gadgets catalog with over 40 products", () => {
    const electronics = getProductsByCategory("electronics");
    expect(electronics.length).toBeGreaterThanOrEqual(40);
  });

  it("verifies valid prices and legitimate discount formatting across all products", () => {
    for (const p of products) {
      expect(p.price).toBeGreaterThan(0);
      expect(p.originalPrice).toBeGreaterThanOrEqual(p.price);
      expect(p.rating).toBeGreaterThanOrEqual(4.0);
      expect(p.rating).toBeLessThanOrEqual(5.0);
      expect(p.reviews).toBeGreaterThan(0);
      expect(p.name.length).toBeGreaterThan(3);
      expect(p.description.length).toBeGreaterThan(15);
      expect(p.image).toBeDefined();
    }
  });

  it("ensures every product references a valid, registered store", () => {
    const storeIds = new Set(stores.map((s) => s.id));
    for (const p of products) {
      expect(storeIds.has(p.storeId)).toBe(true);
    }
  });

  it("retrieves individual products by ID reliably", () => {
    const found = getProduct("wireless-headphones");
    expect(found).toBeDefined();
    expect(found?.name).toContain("Wireless Over-Ear");

    const nonExistent = getProduct("non-existent-id-xyz");
    expect(nonExistent).toBeUndefined();
  });

  it("retrieves products by store ID correctly", () => {
    const techZoneProducts = getProductsByStore("techzone");
    expect(techZoneProducts.length).toBeGreaterThanOrEqual(40);
    expect(techZoneProducts.every((p) => p.storeId === "techzone")).toBe(true);
  });
});

describe("ProductCard component", () => {
  const sampleProduct = products[0]!;

  it("renders product name, store name, price, and category", async () => {
    renderWithRouter(() => <ProductCard product={sampleProduct} />);

    expect(await screen.findByText(sampleProduct.name)).toBeInTheDocument();
    expect(screen.getByText(sampleProduct.storeName)).toBeInTheDocument();
    expect(screen.getByText(/₹1,299/)).toBeInTheDocument();
    expect(screen.getByText(/Save ₹1,200/)).toBeInTheDocument();
    expect(screen.getByText("30% OFF")).toBeInTheDocument();
  });

  it("toggles Add to Cart and displays Added to Cart feedback state", async () => {
    renderWithRouter(() => <ProductCard product={sampleProduct} />);

    const addBtn = await screen.findByRole("button", { name: /add to cart/i });
    expect(addBtn).toBeInTheDocument();

    fireEvent.click(addBtn);

    expect(await screen.findByText("Added to Cart")).toBeInTheDocument();
  });

  it("toggles wishlist state with accessible aria attributes", async () => {
    renderWithRouter(() => <ProductCard product={sampleProduct} />);

    const wishlistBtn = await screen.findByRole("button", {
      name: new RegExp(`add ${sampleProduct.name} to wishlist`, "i"),
    });
    expect(wishlistBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(wishlistBtn);

    expect(wishlistBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("handles image fallback on error event gracefully", async () => {
    renderWithRouter(() => <ProductCard product={sampleProduct} />);

    const img = await screen.findByAltText(sampleProduct.name);
    fireEvent.error(img);

    expect(img.getAttribute("src")).toContain("data:image/svg+xml");
  });
});

describe("filterAndSortProducts catalog logic", () => {
  it("filters products by category accurately", () => {
    const electronics = filterAndSortProducts(products, { category: "electronics" });
    expect(electronics.length).toBeGreaterThanOrEqual(40);
    expect(electronics.every((p) => p.category === "electronics")).toBe(true);
  });

  it("filters products by text search query including name, store, description, or brand", () => {
    const queryResults = filterAndSortProducts(products, { query: "denim" });
    expect(queryResults.length).toBeGreaterThan(0);
    expect(queryResults[0]?.name).toContain("Denim");

    const brandResults = filterAndSortProducts(products, { query: "Acoustix" });
    expect(brandResults.length).toBeGreaterThan(0);

    const macbookResults = filterAndSortProducts(products, { query: "MacBook" });
    expect(macbookResults.length).toBeGreaterThanOrEqual(2);

    const gamingResults = filterAndSortProducts(products, { query: "PlayStation" });
    expect(gamingResults.length).toBeGreaterThanOrEqual(1);
  });

  it("filters products by price ranges", () => {
    const under2000 = filterAndSortProducts(products, { priceRange: "under-2000" });
    expect(under2000.length).toBeGreaterThan(0);
    expect(under2000.every((p) => p.price < 2000)).toBe(true);

    const midRange = filterAndSortProducts(products, { priceRange: "2000-5000" });
    expect(midRange.length).toBeGreaterThan(0);
    expect(midRange.every((p) => p.price >= 2000 && p.price <= 5000)).toBe(true);

    const highRange = filterAndSortProducts(products, { priceRange: "above-5000" });
    expect(highRange.length).toBeGreaterThan(0);
    expect(highRange.every((p) => p.price > 5000)).toBe(true);
  });

  it("filters products that are on sale", () => {
    const saleItems = filterAndSortProducts(products, { onSale: true });
    expect(saleItems.length).toBeGreaterThan(0);
    expect(saleItems.every((p) => p.originalPrice > p.price || Boolean(p.badge))).toBe(true);
  });

  it("sorts products by price ascending and descending", () => {
    const asc = filterAndSortProducts(products, { sort: "price-asc" });
    for (let i = 0; i < asc.length - 1; i++) {
      expect(asc[i]!.price).toBeLessThanOrEqual(asc[i + 1]!.price);
    }

    const desc = filterAndSortProducts(products, { sort: "price-desc" });
    for (let i = 0; i < desc.length - 1; i++) {
      expect(desc[i]!.price).toBeGreaterThanOrEqual(desc[i + 1]!.price);
    }
  });

  it("sorts products by highest rating and review counts", () => {
    const byRating = filterAndSortProducts(products, { sort: "rating-desc" });
    expect(byRating[0]!.rating).toBe(4.9);

    const byReviews = filterAndSortProducts(products, { sort: "reviews-desc" });
    expect(byReviews[0]!.reviews).toBeGreaterThanOrEqual(byReviews[1]!.reviews);
  });
});
