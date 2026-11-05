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
import { AccountTypeSelector, VendorSignInForm, SuperAdminSignInForm } from "@/routes/signin";

function renderWithRouter(component: () => React.ReactElement) {
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

  const routeTree = rootRoute.addChildren([indexRoute]);
  const history = createMemoryHistory({ initialEntries: ["/"] });
  const router = createRouter({ routeTree, history });

  return render(<RouterProvider router={router} />);
}

describe("Role-Based Sign-In Selection Page", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the account type selector with I'm a Vendor and I'm a Super Admin cards", async () => {
    const onSelectRole = vi.fn();
    renderWithRouter(() => <AccountTypeSelector onSelectRole={onSelectRole} />);

    expect(await screen.findByText("Choose your account type")).toBeInTheDocument();
    expect(screen.getByText("Select how you want to access Vendora.")).toBeInTheDocument();

    // Account Type Cards
    expect(screen.getByRole("button", { name: /continue as vendor/i })).toBeInTheDocument();
    expect(screen.getByText("I'm a Vendor")).toBeInTheDocument();
    expect(
      screen.getByText("Manage your storefront, products, orders, and store activity."),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /continue as super admin/i })).toBeInTheDocument();
    expect(screen.getByText("I'm a Super Admin")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Access platform administration, oversee stores, and manage platform-wide operations.",
      ),
    ).toBeInTheDocument();
  });

  it("clicking I'm a Vendor triggers onSelectRole with vendor", async () => {
    const onSelectRole = vi.fn();
    renderWithRouter(() => <AccountTypeSelector onSelectRole={onSelectRole} />);

    const vendorCard = await screen.findByRole("button", { name: /continue as vendor/i });
    fireEvent.click(vendorCard);

    expect(onSelectRole).toHaveBeenCalledWith("vendor");
  });

  it("clicking I'm a Super Admin triggers onSelectRole with super-admin", async () => {
    const onSelectRole = vi.fn();
    renderWithRouter(() => <AccountTypeSelector onSelectRole={onSelectRole} />);

    const adminCard = await screen.findByRole("button", { name: /continue as super admin/i });
    fireEvent.click(adminCard);

    expect(onSelectRole).toHaveBeenCalledWith("super-admin");
  });

  it("renders VendorSignInForm with fields, demo credentials, and back navigation", async () => {
    const onBack = vi.fn();
    renderWithRouter(() => <VendorSignInForm onBack={onBack} />);

    expect(await screen.findByRole("heading", { name: "Vendor Sign In" })).toBeInTheDocument();
    expect(
      screen.getByText("Access your store and manage your commerce operations."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/vendor email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in to vendor portal/i })).toBeInTheDocument();

    const backButton = screen.getByRole("button", { name: /back to account selection/i });
    fireEvent.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);

    // Auto-fill demo credentials
    const autofillBtn = screen.getByRole("button", { name: /auto-fill demo vendor credentials/i });
    fireEvent.click(autofillBtn);

    const emailInput = screen.getByLabelText(/vendor email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;

    expect(emailInput.value).toBe("neha@stylenest.in");
    expect(passwordInput.value).toBe("vendora123");
  });

  it("renders SuperAdminSignInForm with restricted access notice, auto-fill, and security verification", async () => {
    const onBack = vi.fn();
    renderWithRouter(() => <SuperAdminSignInForm onBack={onBack} />);

    expect(await screen.findByRole("heading", { name: "Super Admin Sign In" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to manage the Vendora platform.")).toBeInTheDocument();
    expect(screen.getByText("Restricted Administrative Environment")).toBeInTheDocument();

    // Auto-fill demo administrator credentials
    const autofillBtn = screen.getByRole("button", {
      name: /auto-fill administrator credentials/i,
    });
    fireEvent.click(autofillBtn);

    const emailInput = screen.getByLabelText(/administrator email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;

    expect(emailInput.value).toBe("admin@vendora.com");
    expect(passwordInput.value).toBe("vendora123");

    // Enter incorrect password to test credential rejection
    fireEvent.change(passwordInput, { target: { value: "WrongPassword999!" } });
    const submitBtn = screen.getByRole("button", { name: /sign in to platform admin/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByRole("alert").textContent).toContain("Invalid administrator credentials");
    });
  });
});
