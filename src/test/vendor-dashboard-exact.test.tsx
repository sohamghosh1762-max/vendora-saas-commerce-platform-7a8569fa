import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { VendorAuthProvider } from "@/lib/vendor-context";
import { VendorDashboardPage } from "@/routes/vendor-dashboard";
import { VendorSignInForm } from "@/routes/signin";
import { initialRohanVendor, saveActiveSession } from "@/lib/vendor-storage";

function renderWithRouter(component: () => React.ReactElement, initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <VendorAuthProvider>{component()}</VendorAuthProvider>
      </QueryClientProvider>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/vendor-dashboard",
  });

  const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute]);
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const router = createRouter({ routeTree, history });

  return render(<RouterProvider router={router} />);
}

describe("Vendor Dashboard Replication & Flow", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("shows unauthorized gate when user is unauthenticated", async () => {
    renderWithRouter(() => <VendorDashboardPage />);

    expect(await screen.findByText("Vendor Portal Authentication Required")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in with vendor account/i })).toBeInTheDocument();
  });

  it("renders the exact vendor dashboard when authenticated as Rohan Mehta", async () => {
    // Authenticate as Rohan Mehta (The Urban Nest)
    saveActiveSession({
      token: "test_rohan_token",
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

    renderWithRouter(() => <VendorDashboardPage />);

    // 1. Welcome Section & Greeting
    expect(await screen.findByText("Welcome back, Rohan! 👋")).toBeInTheDocument();
    expect(screen.getByText("Here's what's happening with your store today.")).toBeInTheDocument();
    expect(screen.getByText("Oct 1, 2024 - Oct 26, 2024")).toBeInTheDocument();

    // 2. Left Sidebar navigation items
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Products" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Orders" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Customers" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Store Settings" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Marketing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Payouts" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /messages/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Appearance" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Integrations" })).toBeInTheDocument();

    // 3. Four KPI Metric Cards
    expect(screen.getByText("Total Sales")).toBeInTheDocument();
    expect(screen.getByText("₹1,24,560")).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("320")).toBeInTheDocument();
    expect(screen.getByText("Total Customers")).toBeInTheDocument();
    expect(screen.getByText("256")).toBeInTheDocument();
    expect(screen.getByText("Store Views")).toBeInTheDocument();
    expect(screen.getByText("12,450")).toBeInTheDocument();

    // 4. Main Sales Overview Card & Tabs
    expect(screen.getByText("Sales Overview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sales" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Orders" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Views" })).toBeInTheDocument();

    // 5. Store Profile Card
    const storeHeadings = screen.getAllByText("The Urban Nest");
    expect(storeHeadings.length).toBeGreaterThan(0);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("vendora.com/stores/the-urban-nest")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Store" })).toBeInTheDocument();

    // 6. Store Profile Completion
    expect(screen.getByText("Store Profile Completion")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("Store information")).toBeInTheDocument();
    expect(screen.getByText("Add store logo")).toBeInTheDocument();
    expect(screen.getByText("Add business details")).toBeInTheDocument();
    expect(screen.getByText("Add at least 5 products")).toBeInTheDocument();
    expect(screen.getByText("Set up shipping details")).toBeInTheDocument();

    // 7. Quick Actions Card
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Product" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manage Products" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Store" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Store Settings" }).length).toBeGreaterThan(0);

    // 8. Recent Orders
    expect(screen.getByText("Recent Orders")).toBeInTheDocument();
    expect(screen.getByText("#1024")).toBeInTheDocument();
    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
    expect(screen.getByText("#1023")).toBeInTheDocument();
    expect(screen.getByText("Arjun Patel")).toBeInTheDocument();
    expect(screen.getByText("#1022")).toBeInTheDocument();
    expect(screen.getByText("Sneha Gupta")).toBeInTheDocument();
    expect(screen.getByText("#1021")).toBeInTheDocument();
    expect(screen.getByText("Karan Verma")).toBeInTheDocument();
    expect(screen.getByText("#1020")).toBeInTheDocument();
    expect(screen.getByText("Neha Kapoor")).toBeInTheDocument();

    // 9. Top Products
    expect(screen.getByText("Top Products")).toBeInTheDocument();
    expect(screen.getAllByText("Minimalist Skincare Set").length).toBeGreaterThan(0);
    expect(screen.getByText("₹56,120")).toBeInTheDocument();
    expect(screen.getByText("Running Shoes")).toBeInTheDocument();
    expect(screen.getByText("₹34,290")).toBeInTheDocument();
    expect(screen.getByText("Leather Handbag")).toBeInTheDocument();
    expect(screen.getAllByText("₹28,450").length).toBeGreaterThan(0);
    expect(screen.getByText("Ceramic Coffee Mug")).toBeInTheDocument();
    expect(screen.getByText("₹12,480")).toBeInTheDocument();
    expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("₹10,390")).toBeInTheDocument();

    // 10. Recent Activity
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("New order received")).toBeInTheDocument();
    expect(screen.getByText("Product updated")).toBeInTheDocument();
    expect(screen.getByText("Store profile updated")).toBeInTheDocument();
  });
});
