import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
import { HeroSection } from "@/components/marketplace/HeroSection";
import { CategoryStrip } from "@/components/marketplace/CategoryStrip";
import { Logo } from "@/components/marketplace/Logo";

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

  const routeTree = rootRoute.addChildren([indexRoute]);
  const history = createMemoryHistory({ initialEntries: ["/"] });
  const router = createRouter({ routeTree, history });

  return render(<RouterProvider router={router} />);
}

describe("Navbar & Homepage Layout", () => {
  it("renders Logo with Vendora wordmark, image mark, and uppercase SAAS COMMERCE PLATFORM subtitle", async () => {
    renderWithRouter(() => <Logo />);
    expect(await screen.findByText("Vendora")).toBeInTheDocument();
    expect(screen.getByText("SAAS COMMERCE PLATFORM")).toBeInTheDocument();
    expect(screen.getByAltText(/vendora logo/i)).toBeInTheDocument();
  });

  it("renders all navigation links in Navbar", async () => {
    renderWithRouter(() => <Navbar />);
    const expectedLinks = ["Home", "Shop", "Stores", "Deals", "Become a Vendor", "Pricing"];
    for (const label of expectedLinks) {
      const linkElements = await screen.findAllByRole("link", { name: label });
      expect(linkElements.length).toBeGreaterThan(0);
    }
  });

  it("renders search input with placeholder", async () => {
    renderWithRouter(() => <Navbar />);
    const inputs = await screen.findAllByPlaceholderText(
      "Search for products, brands, or stores...",
    );
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("renders Wishlist, Cart, and Sign In actions", async () => {
    renderWithRouter(() => <Navbar />);
    expect(await screen.findByRole("link", { name: /wishlist/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cart/i })).toBeInTheDocument();
    const signInLinks = screen.getAllByRole("link", { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
  });

  it("renders HeroSection with headline, badge, CTAs, and trust indicators", async () => {
    renderWithRouter(() => <HeroSection />);
    expect(await screen.findByText("500+ Independent Stores")).toBeInTheDocument();
    expect(screen.getByText(/One Platform\./i)).toBeInTheDocument();
    expect(screen.getByText(/Thousands of Stores\./i)).toBeInTheDocument();
    expect(screen.getByText(/Endless Possibilities\./i)).toBeInTheDocument();
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
    expect(screen.getByText("Become a Vendor")).toBeInTheDocument();
    expect(screen.getByText("Secure Payments")).toBeInTheDocument();
    expect(screen.getByText("Easy Returns")).toBeInTheDocument();
    expect(screen.getByText("Verified Stores")).toBeInTheDocument();
    expect(screen.getByText("Support Small Business")).toBeInTheDocument();
  });

  it("renders CategoryStrip with Shop by Category heading and categories", async () => {
    renderWithRouter(() => <CategoryStrip />);
    expect(await screen.findByRole("heading", { name: "Shop by Category" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view all categories/i })).toBeInTheDocument();
  });
});
