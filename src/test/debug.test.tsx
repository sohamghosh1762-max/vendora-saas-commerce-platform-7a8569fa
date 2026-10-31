import { render, screen } from "@testing-library/react";
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
import { VendorDashboardPage, isValidSidebarTab } from "@/routes/vendor-dashboard";
import { initialRohanVendor, saveActiveSession } from "@/lib/vendor-storage";
import { beforeAll, test } from "vitest";

beforeAll(() => {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = MockResizeObserver;
});

test("debug render", async () => {
  saveActiveSession({
    token: "test",
    vendor: initialRohanVendor,
    store: {
      id: "the-urban-nest",
      slug: "the-urban-nest",
      name: "The Urban Nest",
      tagline: "Your Storefront",
      category: "home-living",
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

  const queryClient = new QueryClient();
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
    validateSearch: (s: Record<string, unknown>) =>
      isValidSidebarTab(s.tab) ? { tab: s.tab } : {},
    component: VendorDashboardPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([dashboardRoute]),
    history: createMemoryHistory({ initialEntries: ["/vendor-dashboard?tab=products"] }),
  });

  render(<RouterProvider router={router} />);
  const el = await screen.findByRole("heading", { level: 2 });
  console.log("FOUND HEADING:", el.tagName, el.textContent);
});

