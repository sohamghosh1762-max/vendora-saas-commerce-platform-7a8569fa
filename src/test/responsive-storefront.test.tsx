import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { CartProvider } from "@/lib/cart";
import { Navbar } from "@/components/marketplace/Navbar";
import { Logo } from "@/components/marketplace/Logo";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { products } from "@/data/products";

function renderWithRouter(component: () => React.ReactElement, initialPath = "/") {
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

  const shopRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/shop",
  });

  const productRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/product/$id",
  });

  const routeTree = rootRoute.addChildren([indexRoute, shopRoute, productRoute]);
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const router = createRouter({ routeTree, history });

  return render(<RouterProvider router={router} />);
}

describe("Prompt 4 — Responsive Storefront Verification", () => {
  describe("1. Header & Navigation Responsiveness", () => {
    it("renders the responsive logo with adaptive sizing and subtitle", async () => {
      renderWithRouter(() => <Logo />);
      const logoWordmark = await screen.findByText("Vendora");
      expect(logoWordmark).toBeInTheDocument();
      expect(logoWordmark.className).toContain("text-lg");

      const subtitle = screen.getByText("SAAS COMMERCE PLATFORM");
      expect(subtitle).toBeInTheDocument();
      expect(subtitle.className).toContain("hidden");
      expect(subtitle.className).toContain("min-[380px]:inline");
    });

    it("renders hamburger toggle button with comfortable touch target and accessible attributes", async () => {
      renderWithRouter(() => <Navbar />);
      const toggleBtn = await screen.findByRole("button", { name: /toggle menu/i });
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn.className).toContain("min-h-[40px]");
      expect(toggleBtn.className).toContain("min-w-[40px]");
      expect(toggleBtn).toHaveAttribute("aria-expanded", "false");

      // Open mobile navigation
      fireEvent.click(toggleBtn);
      expect(toggleBtn).toHaveAttribute("aria-expanded", "true");

      // Mobile search and links are rendered inside mobile navigation
      const mobileNav = await screen.findByRole("navigation", { name: /mobile navigation/i });
      expect(mobileNav).toBeInTheDocument();
      expect(within(mobileNav).getByRole("search")).toBeInTheDocument();
    });

    it("provides accessible touch targets for Wishlist and Cart icons", async () => {
      renderWithRouter(() => <Navbar />);
      const wishlistLink = await screen.findByRole("link", { name: /wishlist/i });
      const cartLink = await screen.findByRole("link", { name: /cart/i });

      expect(wishlistLink.className).toContain("min-h-[40px]");
      expect(wishlistLink.className).toContain("min-w-[40px]");
      expect(cartLink.className).toContain("min-h-[40px]");
      expect(cartLink.className).toContain("min-w-[40px]");
    });
  });

  describe("2. ProductCard Responsive Adaptability", () => {
    const sampleProduct = products[0]!;

    it("renders ProductCard with responsive padding, typography and touch-friendly button", async () => {
      renderWithRouter(() => <ProductCard product={sampleProduct} />);

      // Check title has responsive text size classes
      const title = await screen.findByText(sampleProduct.name);
      expect(title.className).toContain("text-xs");
      expect(title.className).toContain("sm:text-sm");

      // Check Add to Cart button has min-h-[40px]
      const addBtn = screen.getByRole("button", { name: /add to cart/i });
      expect(addBtn.className).toContain("min-h-[40px]");

      // Check Wishlist heart button has min-h-[36px]
      const wishBtn = screen.getByRole("button", {
        name: new RegExp(`add ${sampleProduct.name} to wishlist`, "i"),
      });
      expect(wishBtn.className).toContain("min-h-[36px]");
    });
  });

  describe("3. Cart & Wishlist Responsiveness", () => {
    it("renders empty wishlist CTA with responsive touch target", async () => {
      const { Route: WishlistRoute } = await import("@/routes/wishlist");
      const WishlistComp = WishlistRoute.options.component!;
      renderWithRouter(() => <WishlistComp />);

      const exploreBtn = await screen.findByRole("link", { name: /explore products/i });
      expect(exploreBtn).toBeInTheDocument();
      expect(exploreBtn.className).toContain("min-h-[44px]");
    });

    it("renders empty cart CTA with responsive touch target", async () => {
      const { Route: CartRoute } = await import("@/routes/cart");
      const CartComp = CartRoute.options.component!;
      renderWithRouter(() => <CartComp />);

      const exploreBtn = await screen.findByRole("link", { name: /start shopping/i });
      expect(exploreBtn).toBeInTheDocument();
      expect(exploreBtn.className).toContain("min-h-[44px]");
    });
  });
});
