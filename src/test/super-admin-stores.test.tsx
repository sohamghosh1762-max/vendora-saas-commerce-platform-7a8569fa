import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SuperAdminStoresView } from "@/components/super-admin-dashboard/SuperAdminStoresView";

describe("Super Admin Stores Management Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders summary cards and store table with seeded records", async () => {
    const handleReturn = vi.fn();
    render(<SuperAdminStoresView onReturnToDashboard={handleReturn} />);

    // Check heading
    expect(await screen.findByRole("heading", { name: /Stores Management/i })).toBeInTheDocument();

    // Check summary card labels
    expect(screen.getByText("Total Stores")).toBeInTheDocument();
    expect(screen.getByText("Active Stores")).toBeInTheDocument();
    expect(screen.getByText("Pending Verification")).toBeInTheDocument();
    expect(screen.getByText("Suspended Stores")).toBeInTheDocument();

    // Check presence of seeded stores
    expect(await screen.findByText("The Urban Nest")).toBeInTheDocument();
    expect(screen.getByText("StyleNest")).toBeInTheDocument();
    expect(screen.getByText("TechNova")).toBeInTheDocument();
  });

  it("navigates back to dashboard when clicking Return to Overview or Dashboard View", async () => {
    const handleReturn = vi.fn();
    render(<SuperAdminStoresView onReturnToDashboard={handleReturn} />);

    const returnBtn = await screen.findByRole("button", { name: /Return to Overview/i });
    fireEvent.click(returnBtn);
    expect(handleReturn).toHaveBeenCalledTimes(1);

    const dashboardViewBtn = screen.getByRole("button", { name: /Dashboard View/i });
    fireEvent.click(dashboardViewBtn);
    expect(handleReturn).toHaveBeenCalledTimes(2);
  });

  it("filters store list when searching by store name", async () => {
    render(<SuperAdminStoresView onReturnToDashboard={vi.fn()} />);

    expect(await screen.findByText("The Urban Nest")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search by store name, ID, vendor, email.../i);
    fireEvent.change(searchInput, { target: { value: "Urban Nest" } });

    await waitFor(() => {
      expect(screen.getByText("The Urban Nest")).toBeInTheDocument();
      expect(screen.queryByText("TechNova")).not.toBeInTheDocument();
    });
  });

  it("filters store list by status tab", async () => {
    render(<SuperAdminStoresView onReturnToDashboard={vi.fn()} />);

    expect(await screen.findByText("The Urban Nest")).toBeInTheDocument();

    // Click 'Pending' tab button in toolbar
    const pendingTabs = screen.getAllByRole("button", { name: /Pending/i });
    fireEvent.click(pendingTabs[0]);

    await waitFor(() => {
      expect(screen.getByText("TechNova")).toBeInTheDocument();
      expect(screen.queryByText("The Urban Nest")).not.toBeInTheDocument();
    });
  });

  it("opens store details drawer when clicking View Details", async () => {
    render(<SuperAdminStoresView onReturnToDashboard={vi.fn()} />);

    expect(await screen.findByText("The Urban Nest")).toBeInTheDocument();

    const viewButtons = screen.getAllByTitle("View Store Details");
    fireEvent.click(viewButtons[0]);

    expect(await screen.findByRole("heading", { name: /Store Details/i })).toBeInTheDocument();
    expect(screen.getByText("Merchant Information")).toBeInTheDocument();
    expect(screen.getByText("Rohan Mehta")).toBeInTheDocument();
    expect(screen.getByText("rohan@theurbannest.com")).toBeInTheDocument();
  });

  it("opens Add New Store modal and creates a new store", async () => {
    const handleMutated = vi.fn();
    render(<SuperAdminStoresView onReturnToDashboard={vi.fn()} onStoreMutated={handleMutated} />);

    const addButtons = await screen.findAllByRole("button", { name: /Add New Store/i });
    fireEvent.click(addButtons[0]);

    expect(await screen.findByText("Add New Platform Store")).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText("e.g. Modern Craft Co.");
    fireEvent.change(nameInput, { target: { value: "Artisan Woodcraft Studio" } });

    const ownerNameInput = screen.getByPlaceholderText("e.g. Vikram Singhania");
    fireEvent.change(ownerNameInput, { target: { value: "Vikramaditya Roy" } });

    const ownerEmailInput = screen.getByPlaceholderText("vikram@store.com");
    fireEvent.change(ownerEmailInput, { target: { value: "vikram@artisanwood.in" } });

    const submitBtn = screen.getByRole("button", { name: /Create Store/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/successfully created/i)).toBeInTheDocument();
      expect(handleMutated).toHaveBeenCalled();
    });
  });

  it("suspends an active store and prompts for reason", async () => {
    const handleMutated = vi.fn();
    render(<SuperAdminStoresView onReturnToDashboard={vi.fn()} onStoreMutated={handleMutated} />);

    expect(await screen.findByText("The Urban Nest")).toBeInTheDocument();

    // Click Suspend button for The Urban Nest
    const suspendButtons = screen.getAllByTitle("Suspend Store");
    fireEvent.click(suspendButtons[0]);

    expect(await screen.findByText("Suspend Storefront")).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText(/KYC documentation verification/i);
    fireEvent.change(reasonInput, { target: { value: "Temporary compliance review" } });

    const confirmBtn = screen.getByRole("button", { name: /Confirm Suspension/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/status updated to Suspended/i)).toBeInTheDocument();
      expect(handleMutated).toHaveBeenCalled();
    });
  });
});
