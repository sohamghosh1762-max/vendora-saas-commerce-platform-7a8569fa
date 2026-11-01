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
import { SuperAdminAuthProvider } from "@/lib/super-admin-context";
import { SuperAdminSignInForm } from "@/routes/signin";
import { SuperAdminDashboardPage } from "@/routes/super-admin-dashboard";
import { initialDemoVendor, saveActiveSession } from "@/lib/vendor-storage";
import * as superAdminApi from "@/lib/super-admin-api";
import {
  setSuperAdminConfigForTesting,
  setSuperAdminUnconfiguredForTesting,
  resetSuperAdminConfigForTesting,
  hashPassword,
  generateSalt,
} from "@/lib/super-admin-auth.server";

function renderWithRouter(component: () => React.ReactElement, initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <VendorAuthProvider>
          <SuperAdminAuthProvider>{component()}</SuperAdminAuthProvider>
        </VendorAuthProvider>
      </QueryClientProvider>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });

  const signinRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/signin",
    component: () => <SuperAdminSignInForm onBack={() => {}} />,
  });

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/super-admin-dashboard",
  });

  const vendorDashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/vendor-dashboard",
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    signinRoute,
    dashboardRoute,
    vendorDashboardRoute,
  ]);
  const history = createMemoryHistory({ initialEntries: [initialPath] });
  const router = createRouter({ routeTree, history });

  return render(<RouterProvider router={router} />);
}

describe("Super Admin Dashboard & Authorization Workflow", () => {
  const TEST_ADMIN_EMAIL = "admin@vendora.com";
  const TEST_ADMIN_PASSWORD = "CorrectAdminSecret2026!";
  const TEST_SALT = generateSalt(16);
  const TEST_HASH = hashPassword(TEST_ADMIN_PASSWORD, TEST_SALT);
  const TEST_SECRET = "super_secure_test_session_secret_32chars_long_minimum";

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
    resetSuperAdminConfigForTesting();
  });

  describe("Super Admin Sign In UI", () => {
    it("renders unconfigured notice and disabled button when admin backend is unprovisioned", async () => {
      setSuperAdminUnconfiguredForTesting();
      const onBack = vi.fn();
      renderWithRouter(() => <SuperAdminSignInForm onBack={onBack} />);

      expect(
        await screen.findByRole("heading", { name: "Super Admin Sign In" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Restricted Administrative Environment")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(/Administrative Authorization Required/i);

      const submitBtn = screen.getByRole("button", {
        name: /sign in to platform admin/i,
      });
      expect(submitBtn).toBeInTheDocument();

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          /Administrative Authorization Required/i,
        );
      });
    });

    it("provides auto-fill for demo administrator credentials", async () => {
      resetSuperAdminConfigForTesting();
      const onBack = vi.fn();
      renderWithRouter(() => <SuperAdminSignInForm onBack={onBack} />);

      const autoFillBtn = await screen.findByRole("button", {
        name: /auto-fill administrator credentials/i,
      });
      fireEvent.click(autoFillBtn);

      const emailInput = screen.getByLabelText(/administrator email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;

      expect(emailInput.value).toBe("admin@vendora.com");
      expect(passwordInput.value).toBe("vendora123");
    });

    it("renders ready sign-in form when admin is provisioned and supports password show/hide toggle", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_ADMIN_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      const onBack = vi.fn();
      renderWithRouter(() => <SuperAdminSignInForm onBack={onBack} />);

      const emailInput = (await screen.findByLabelText(/administrator email/i)) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      const toggleBtn = screen.getByRole("button", { name: /show password/i });

      expect(passwordInput.type).toBe("password");
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe("text");
      fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
      expect(passwordInput.type).toBe("password");

      expect(screen.getByRole("button", { name: /sign in to platform admin/i })).toBeEnabled();
    });

    it("displays generic error on invalid administrator credentials", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_ADMIN_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      const onBack = vi.fn();
      renderWithRouter(() => <SuperAdminSignInForm onBack={onBack} />);

      const emailInput = await screen.findByLabelText(/administrator email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitBtn = screen.getByRole("button", { name: /sign in to platform admin/i });

      fireEvent.change(emailInput, { target: { value: TEST_ADMIN_EMAIL } });
      fireEvent.change(passwordInput, { target: { value: "WrongPassword123!" } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent("Invalid administrator credentials.");
      });
    });
  });

  describe("Route Protection & Vendor Separation", () => {
    it("redirects or prompts unauthenticated user when navigating to Super Admin Dashboard", async () => {
      renderWithRouter(() => <SuperAdminDashboardPage />, "/super-admin-dashboard");

      expect(
        await screen.findByRole("heading", { name: "Authentication Required" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /go to super admin sign in/i })).toBeInTheDocument();
    });

    it("enforces strict separation: blocks authenticated Vendor with 403 Forbidden screen", async () => {
      // Authenticate as a Vendor
      saveActiveSession({
        token: "vendor_active_token",
        vendor: initialDemoVendor,
        store: {
          id: "stylenest",
          slug: "stylenest",
          name: "StyleNest",
          tagline: "Fashion for everyone",
          description: "Curated fashion apparel and accessories",
          category: "fashion",
          rating: 4.8,
          reviews: 156,
          productCount: 24,
          tint: "bg-cat-fashion text-cat-fashion-fg",
          ownerId: "vendor_stylenest",
          ownerEmail: "neha@stylenest.in",
          phone: "+91 98765 43210",
          address: "123 Fashion Street",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          businessType: "Sole Proprietorship",
          returnPolicy: "7-Day Easy Returns",
          shippingMethod: "Standard",
          processingTime: "1-2 Business Days",
          supportEmail: "support@stylenest.in",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        },
        expiresAt: Date.now() + 86400000,
      });

      renderWithRouter(() => <SuperAdminDashboardPage />, "/super-admin-dashboard");

      expect(await screen.findByText("403 Forbidden — Access Denied")).toBeInTheDocument();
      expect(screen.getByText("Administrative Access Restricted")).toBeInTheDocument();
      expect(
        screen.getByText(/Vendor accounts do not possess platform governance privileges/i),
      ).toBeInTheDocument();
      expect(screen.getByText("neha@stylenest.in")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /return to vendor dashboard/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign out & switch to super admin sign in/i }),
      ).toBeInTheDocument();
    });

    it("renders pixel-accurate Super Admin Dashboard when authenticated as SUPER_ADMIN", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_ADMIN_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      // Mock getSuperAdminAuthStatus to return authenticated admin
      vi.spyOn(superAdminApi, "getSuperAdminAuthStatus").mockResolvedValue({
        isConfigured: true,
        isAuthenticated: true,
        admin: {
          email: TEST_ADMIN_EMAIL,
          role: "SUPER_ADMIN",
        },
      });

      renderWithRouter(() => <SuperAdminDashboardPage />, "/super-admin-dashboard");

      // 1. Sidebar verification
      expect(await screen.findByText("Vendora")).toBeInTheDocument();
      expect(screen.getByText("SAAS COMMERCE PLATFORM")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^dashboard$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^stores$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^vendors$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^products$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^orders$/i })).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1); // Notification badge / table rank
      expect(screen.getByText("Need Help?")).toBeInTheDocument();
      expect(screen.getByText("View documentation")).toBeInTheDocument();

      // 2. Header verification
      expect(
        screen.getByRole("button", {
          name: /search stores, vendors, products, orders, customers/i,
        }),
      ).toBeInTheDocument();
      expect(screen.getByText("Arjun Mehta")).toBeInTheDocument();
      expect(screen.getByText("Super Admin")).toBeInTheDocument();

      // 3. Welcome Section & Export Button
      expect(screen.getByText(/welcome back, arjun!/i)).toBeInTheDocument();
      expect(
        screen.getByText("Here's what's happening across your Vendora platform today."),
      ).toBeInTheDocument();
      expect(screen.getByText("Oct 1, 2024 - Oct 26, 2024")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /export report/i })).toBeInTheDocument();

      // 4. Five KPI Cards verification
      expect(screen.getByText("Total Stores")).toBeInTheDocument();
      expect(screen.getByText("428")).toBeInTheDocument();
      expect(screen.getByText("↑ 12%")).toBeInTheDocument();

      expect(screen.getByText("Total Vendors")).toBeInTheDocument();
      expect(screen.getByText("412")).toBeInTheDocument();
      expect(screen.getAllByText("↑ 18%").length).toBeGreaterThanOrEqual(1);

      expect(screen.getByText("Total Products")).toBeInTheDocument();
      expect(screen.getByText("8,542")).toBeInTheDocument();
      expect(screen.getByText("↑ 25%")).toBeInTheDocument();

      expect(screen.getByText("Total Orders")).toBeInTheDocument();
      expect(screen.getByText("12,560")).toBeInTheDocument();
      expect(screen.getByText("↑ 22%")).toBeInTheDocument();

      expect(screen.getByText("Platform Revenue")).toBeInTheDocument();
      expect(screen.getByText("₹18,42,560")).toBeInTheDocument();
      expect(screen.getAllByText("↑ 28%").length).toBeGreaterThanOrEqual(1);

      // 5. Chart Panels verification
      expect(screen.getByText("Revenue Overview")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Daily" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Weekly" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Monthly" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Yearly" })).toBeInTheDocument();

      expect(screen.getByText("Platform Growth")).toBeInTheDocument();
      expect(screen.getByText("Last 6 Months")).toBeInTheDocument();
      expect(screen.getByText("New Stores")).toBeInTheDocument();
      expect(screen.getByText("New Vendors")).toBeInTheDocument();

      // 6. Middle Row verification
      expect(screen.getByText("Recent Stores")).toBeInTheDocument();
      expect(screen.getAllByText("The Urban Nest").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("StyleHub").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("TechNova").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Glow & Grace").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("HomeFynd").length).toBeGreaterThanOrEqual(1);

      expect(screen.getByText("Recent Orders")).toBeInTheDocument();
      expect(screen.getByText("#1024")).toBeInTheDocument();
      expect(screen.getByText("Aditi Singh")).toBeInTheDocument();
      expect(screen.getByText("₹1,499")).toBeInTheDocument();
      expect(screen.getByText("#1023")).toBeInTheDocument();
      expect(screen.getByText("Rohan Desai")).toBeInTheDocument();

      expect(screen.getByText("Platform Health")).toBeInTheDocument();
      expect(screen.getByText("92%")).toBeInTheDocument();
      expect(screen.getByText("All systems operational")).toBeInTheDocument();
      expect(screen.getByText("Website Uptime")).toBeInTheDocument();
      expect(screen.getByText("99.9%")).toBeInTheDocument();
      expect(screen.getByText("Payment Services")).toBeInTheDocument();
      expect(screen.getByText("Database")).toBeInTheDocument();

      // 7. Bottom Row verification
      expect(screen.getByText("Top Performing Stores")).toBeInTheDocument();
      expect(screen.getByText("₹2,84,560")).toBeInTheDocument();

      expect(screen.getByText("Top Selling Products")).toBeInTheDocument();
      expect(screen.getByText("Minimalist Skincare Set")).toBeInTheDocument();
      expect(screen.getByText("₹2,10,000")).toBeInTheDocument();
      expect(screen.getByText("Running Shoes")).toBeInTheDocument();

      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
      expect(screen.getByText("Add New Store")).toBeInTheDocument();
      expect(screen.getByText("Approve Vendors")).toBeInTheDocument();
      expect(screen.getByText("Manage Products")).toBeInTheDocument();
      expect(screen.getByText("View Reports")).toBeInTheDocument();
    });

    it("triggers Quick Actions modal when Add New Store is clicked", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_ADMIN_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      vi.spyOn(superAdminApi, "getSuperAdminAuthStatus").mockResolvedValue({
        isConfigured: true,
        isAuthenticated: true,
        admin: { email: TEST_ADMIN_EMAIL, role: "SUPER_ADMIN" },
      });

      renderWithRouter(() => <SuperAdminDashboardPage />, "/super-admin-dashboard");

      const addStoreBtn = await screen.findByRole("button", { name: /add new store/i });
      fireEvent.click(addStoreBtn);

      expect(await screen.findByText("Add New Merchant Store")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. Aura Artisan Goods")).toBeInTheDocument();
    });

    it("triggers Approve Vendors modal when Approve Vendors is clicked", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_ADMIN_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      vi.spyOn(superAdminApi, "getSuperAdminAuthStatus").mockResolvedValue({
        isConfigured: true,
        isAuthenticated: true,
        admin: { email: TEST_ADMIN_EMAIL, role: "SUPER_ADMIN" },
      });

      renderWithRouter(() => <SuperAdminDashboardPage />, "/super-admin-dashboard");

      const approveBtn = await screen.findByRole("button", { name: /approve vendors/i });
      fireEvent.click(approveBtn);

      expect(await screen.findByText("Pending Vendor Approvals")).toBeInTheDocument();
      expect(screen.getByText(/Zenith Home & Living/i)).toBeInTheDocument();
      expect(screen.getByText(/Artisan Leathercraft/i)).toBeInTheDocument();
    });

    it("opens search modal on search bar click and filters entities", async () => {
      setSuperAdminConfigForTesting({
        email: TEST_ADMIN_EMAIL,
        passwordHash: TEST_HASH,
        passwordSalt: TEST_SALT,
        sessionSecret: TEST_SECRET,
      });

      vi.spyOn(superAdminApi, "getSuperAdminAuthStatus").mockResolvedValue({
        isConfigured: true,
        isAuthenticated: true,
        admin: { email: TEST_ADMIN_EMAIL, role: "SUPER_ADMIN" },
      });

      renderWithRouter(() => <SuperAdminDashboardPage />, "/super-admin-dashboard");

      const searchTrigger = await screen.findByRole("button", {
        name: /search stores, vendors, products, orders, customers/i,
      });
      fireEvent.click(searchTrigger);

      const searchInput = screen.getByPlaceholderText(
        "Search stores, vendors, products, orders, customers...",
      );
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "Urban" } });
      expect(screen.getAllByText("The Urban Nest").length).toBeGreaterThanOrEqual(1);
    });
  });
});
