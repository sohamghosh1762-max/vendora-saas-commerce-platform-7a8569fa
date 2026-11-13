import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VendorAuthProvider } from "@/lib/vendor-context";
import {
  VendorDashboardPage,
  isValidSidebarTab,
} from "@/routes/vendor-dashboard";
import { initialRohanVendor, saveActiveSession } from "@/lib/vendor-storage";

// Mock ResizeObserver for Recharts ResponsiveContainer in JSDOM
beforeAll(() => {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = MockResizeObserver;
});

function renderDashboardWithRouter(initialPath = "/vendor-dashboard") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <VendorAuthProvider>
          <Outlet />
        </VendorAuthProvider>
      </QueryClientProvider>
    ),
  });

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/vendor-dashboard",
    validateSearch: (search: Record<string, unknown>) => {
      const tab = search['tab'];
      if (isValidSidebarTab(tab)) {
        return { tab };
      }
      return {};
    },
    component: VendorDashboardPage,
  });

  const routeTree = rootRoute.addChildren([dashboardRoute]);
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const router = createRouter({ routeTree, history });

  const result = render(<RouterProvider router={router} />);
  return { ...result, router, history };
}

describe("Vendor Dashboard URL-Synchronized Navigation", { timeout: 20000 }, () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();

    saveActiveSession({
      token: "test_rohan_token",
      vendor: initialRohanVendor,
      store: {
        id: "the-urban-nest",
        slug: "the-urban-nest",
        name: "The Urban Nest",
        tagline: "Your Storefront",
        category: "home-living",
        description: "Curated modern home essentials and handcrafted decor.",
        rating: 4.9,
        reviews: 320,
        productCount: 48,
        tint: "bg-cat-home text-cat-home-fg",
        ownerId: "vendor_rohan_urban_nest",
        ownerEmail: "rohan@theurbannest.com",
        phone: "+91 98200 12345",
        address: "42 Indiranagar 100ft Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560038",
        businessType: "Private Limited",
        returnPolicy: "14-Day Easy Returns",
        shippingMethod: "Vendora Logistics Express",
        processingTime: "Same Day Dispatch",
        supportEmail: "hello@theurbannest.com",
        status: "ACTIVE",
        createdAt: "2024-01-10T00:00:00.000Z",
      },
      expiresAt: Date.now() + 86400000,
    });
  });

  it("defaults to Overview view when URL has no tab parameter (/vendor-dashboard)", async () => {
    renderDashboardWithRouter("/vendor-dashboard");

    expect(await screen.findByText("Welcome back, Rohan! 👋")).toBeInTheDocument();
    expect(screen.getByText("Sales Overview")).toBeInTheDocument();

    // Check that Dashboard sidebar item has active styling
    const dashboardBtn = screen.getByRole("button", { name: "Dashboard" });
    expect(dashboardBtn.className).toContain("bg-[#6538F5]");
  });

  it("defaults to Overview view when URL has an invalid tab parameter", async () => {
    renderDashboardWithRouter("/vendor-dashboard?tab=nonexistent_tab");

    expect(await screen.findByText("Welcome back, Rohan! 👋")).toBeInTheDocument();
    expect(screen.getByText("Sales Overview")).toBeInTheDocument();

    const dashboardBtn = screen.getByRole("button", { name: "Dashboard" });
    expect(dashboardBtn.className).toContain("bg-[#6538F5]");
  });

  it("defaults to Overview view when tab parameter is empty", async () => {
    renderDashboardWithRouter("/vendor-dashboard?tab=");

    expect(await screen.findByText("Welcome back, Rohan! 👋")).toBeInTheDocument();
    expect(screen.getByText("Sales Overview")).toBeInTheDocument();

    const dashboardBtn = screen.getByRole("button", { name: "Dashboard" });
    expect(dashboardBtn.className).toContain("bg-[#6538F5]");
  });

  it("renders Products Catalog view directly when accessing ?tab=products", async () => {
    renderDashboardWithRouter("/vendor-dashboard?tab=products");

    expect(await screen.findByRole("heading", { level: 2, name: "Products Catalog" })).toBeInTheDocument();
    expect(
      screen.getByText("Manage and organize products for The Urban Nest"),
    ).toBeInTheDocument();

    const productsBtn = screen.getByRole("button", { name: "Products" });
    expect(productsBtn.className).toContain("bg-[#6538F5]");

    const dashboardBtn = screen.getByRole("button", { name: "Dashboard" });
    expect(dashboardBtn.className).not.toContain("bg-[#6538F5]");
  });

  it("renders Order Management view directly when accessing ?tab=orders", async () => {
    renderDashboardWithRouter("/vendor-dashboard?tab=orders");

    expect(await screen.findByRole("heading", { level: 2, name: "Order Management" })).toBeInTheDocument();
    expect(
      screen.getByText("Track order fulfillments, shipping, and customer receipts"),
    ).toBeInTheDocument();

    const sidebarOrdersBtn = screen
      .getAllByRole("button", { name: "Orders" })
      .find((el) => el.closest("nav"));
    expect(sidebarOrdersBtn?.className).toContain("bg-[#6538F5]");
  });

  it("renders Analytics view directly when accessing ?tab=analytics", async () => {
    renderDashboardWithRouter("/vendor-dashboard?tab=analytics");

    expect(
      await screen.findByRole("heading", { level: 2, name: "Performance & Analytics" }),
    ).toBeInTheDocument();

    const analyticsBtn = screen.getByRole("button", { name: "Analytics" });
    expect(analyticsBtn.className).toContain("bg-[#6538F5]");
  });

  it("renders Store Settings view directly when accessing ?tab=settings", async () => {
    renderDashboardWithRouter("/vendor-dashboard?tab=settings");

    expect(await screen.findByRole("heading", { level: 2, name: "Store Settings" })).toBeInTheDocument();

    const sidebarSettingsBtn = screen
      .getAllByRole("button", { name: "Store Settings" })
      .find((el) => el.closest("nav"));
    expect(sidebarSettingsBtn?.className).toContain("bg-[#6538F5]");
  });

  it("updates the URL and displays the corresponding view when clicking sidebar items", async () => {
    const { router } = renderDashboardWithRouter("/vendor-dashboard");

    expect(await screen.findByText("Welcome back, Rohan! 👋")).toBeInTheDocument();

    // 1. Click Products in sidebar
    const productsBtn = screen.getByRole("button", { name: "Products" });
    fireEvent.click(productsBtn);

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "products" });
      expect(screen.getByRole("heading", { level: 2, name: "Products Catalog" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Products" }).className).toContain("bg-[#6538F5]");

    // 2. Click Orders in sidebar
    const ordersBtn = screen
      .getAllByRole("button", { name: "Orders" })
      .find((el) => el.closest("nav"))!;
    fireEvent.click(ordersBtn);

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "orders" });
      expect(screen.getByRole("heading", { level: 2, name: "Order Management" })).toBeInTheDocument();
    });

    // 3. Click Dashboard item in sidebar to return to Overview
    const dashboardBtn = screen.getByRole("button", { name: "Dashboard" });
    fireEvent.click(dashboardBtn);

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "dashboard" });
      expect(screen.getByText("Welcome back, Rohan! 👋")).toBeInTheDocument();
      expect(screen.getByText("Sales Overview")).toBeInTheDocument();
    });
  });

  it("supports browser Back and Forward navigation", async () => {
    const { router, history } = renderDashboardWithRouter("/vendor-dashboard");

    expect(await screen.findByText("Welcome back, Rohan! 👋")).toBeInTheDocument();

    // Click Products
    fireEvent.click(screen.getByRole("button", { name: "Products" }));
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "products" });
      expect(screen.getByRole("heading", { level: 2, name: "Products Catalog" })).toBeInTheDocument();
    });

    // Click Analytics
    fireEvent.click(screen.getByRole("button", { name: "Analytics" }));
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "analytics" });
      expect(
        screen.getByRole("heading", { level: 2, name: "Performance & Analytics" }),
      ).toBeInTheDocument();
    });

    // Browser Back -> Should return to Products
    history.back();
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "products" });
      expect(screen.getByRole("heading", { level: 2, name: "Products Catalog" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Products" }).className).toContain("bg-[#6538F5]");
    });

    // Browser Back -> Should return to initial Dashboard Overview
    history.back();
    await waitFor(() => {
      expect(router.state.location.search).toEqual({});
      expect(screen.getByText("Welcome back, Rohan! 👋")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Dashboard" }).className).toContain("bg-[#6538F5]");
    });

    // Browser Forward -> Should go forward to Products
    history.forward();
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "products" });
      expect(screen.getByRole("heading", { level: 2, name: "Products Catalog" })).toBeInTheDocument();
    });

    // Browser Forward -> Should go forward to Analytics
    history.forward();
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "analytics" });
      expect(
        screen.getByRole("heading", { level: 2, name: "Performance & Analytics" }),
      ).toBeInTheDocument();
    });
  });

  it("clicking 'Back to Dashboard' from non-dashboard view updates URL to tab=dashboard and shows Overview", async () => {
    const { router } = renderDashboardWithRouter("/vendor-dashboard?tab=products");

    expect(await screen.findByRole("heading", { level: 2, name: "Products Catalog" })).toBeInTheDocument();

    const backButton = screen.getByRole("button", { name: /back to dashboard/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "dashboard" });
      expect(screen.getByText("Welcome back, Rohan! 👋")).toBeInTheDocument();
      expect(screen.getByText("Sales Overview")).toBeInTheDocument();
    });
  });

  it("navigating tabs via Overview quick actions updates the URL and view", async () => {
    const { router } = renderDashboardWithRouter("/vendor-dashboard");

    expect(await screen.findByText("Welcome back, Rohan! 👋")).toBeInTheDocument();

    // Click Manage Products in Quick Actions
    const manageProductsBtn = screen.getByRole("button", { name: "Manage Products" });
    fireEvent.click(manageProductsBtn);

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "products" });
      expect(screen.getByRole("heading", { level: 2, name: "Products Catalog" })).toBeInTheDocument();
    });
  }, 15000);
});
