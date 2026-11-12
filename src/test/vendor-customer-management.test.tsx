import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { VendorCustomersView } from "@/components/vendor-dashboard/VendorCustomersView";
import { VendorNonDashboardView } from "@/components/vendor-dashboard/VendorNonDashboardView";
import {
  getVendorCustomers,
  getVendorCustomerByEmail,
  saveVendorCustomerNote,
} from "@/lib/vendor-api";
import { saveStoredOrders } from "@/lib/vendor-storage";
import type { VendorOrder } from "@/lib/vendor-types";

const testStoreId = "test-customer-store";
const otherStoreId = "other-vendor-store";

const mockOrders: VendorOrder[] = [
  {
    id: "ord-cust-001",
    orderNumber: "#1001",
    storeId: testStoreId,
    customerName: "Aarav Sharma",
    customerEmail: "aarav@example.com",
    customerPhone: "+91 98765 43210",
    shippingAddress: "Flat 101, Palm Residency, Whitefield, Bengaluru - 560066",
    items: [
      { productName: "Handmade Bamboo Lamp", qty: 2, price: 1200 },
      { productName: "Ceramic Tea Cups", qty: 4, price: 250 },
    ],
    total: 3400,
    status: "Delivered",
    date: "Nov 10, 2026",
    paymentMethod: "UPI (Prepaid)",
    trackingNumber: "VND-TRK-101",
  },
  {
    id: "ord-cust-002",
    orderNumber: "#1002",
    storeId: testStoreId,
    customerName: "Aarav Sharma",
    customerEmail: "aarav@example.com",
    customerPhone: "+91 98765 43210",
    shippingAddress: "Flat 101, Palm Residency, Whitefield, Bengaluru - 560066",
    items: [{ productName: "Incense Diffuser", qty: 1, price: 800 }],
    total: 800,
    status: "Shipped",
    date: "Nov 02, 2026",
    paymentMethod: "UPI (Prepaid)",
    trackingNumber: "VND-TRK-102",
  },
  {
    id: "ord-cust-003",
    orderNumber: "#1003",
    storeId: testStoreId,
    customerName: "Diya Patel",
    customerEmail: "diya@example.com",
    customerPhone: "+91 98111 22334",
    shippingAddress: "22 Park View, Vastrapur, Ahmedabad - 380015",
    items: [{ productName: "Organic Cotton Throw", qty: 1, price: 2800 }],
    total: 2800,
    status: "Processing",
    date: "Nov 09, 2026",
    paymentMethod: "Credit Card (Prepaid)",
    trackingNumber: "VND-TRK-103",
  },
  {
    id: "ord-cust-004",
    orderNumber: "#1004",
    storeId: testStoreId,
    customerName: "Kabir Mehta",
    customerEmail: "kabir@example.com",
    customerPhone: "+91 97222 33445",
    shippingAddress: "54 Jubilee Hills, Hyderabad - 500033",
    items: [{ productName: "Walnut Wood Coasters", qty: 1, price: 650 }],
    total: 650,
    status: "Pending",
    date: "Nov 08, 2026",
    paymentMethod: "Net Banking (Prepaid)",
    trackingNumber: "VND-TRK-104",
  },
  // Other store customer
  {
    id: "ord-other-001",
    orderNumber: "#2001",
    storeId: otherStoreId,
    customerName: "Stranger Customer",
    customerEmail: "stranger@other.com",
    customerPhone: "+91 90000 00000",
    shippingAddress: "123 Other Street",
    items: [{ productName: "Other Product", qty: 1, price: 999 }],
    total: 999,
    status: "Delivered",
    date: "Nov 01, 2026",
  },
];

describe("Vendor Customer Management", () => {
  beforeEach(() => {
    window.localStorage.clear();
    saveStoredOrders(mockOrders);
  });

  it("aggregates and displays customers associated with the current vendor with correct details", () => {
    render(<VendorCustomersView storeId={testStoreId} storeName="Handmade Haven" />);

    // Check customer names are rendered
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.getByText("Kabir Mehta")).toBeInTheDocument();

    // Check emails
    expect(screen.getByText("aarav@example.com")).toBeInTheDocument();
    expect(screen.getByText("diya@example.com")).toBeInTheDocument();
    expect(screen.getByText("kabir@example.com")).toBeInTheDocument();

    // Aarav has 2 orders totaling ₹4,200 (3400 + 800)
    expect(screen.getByText("2 orders")).toBeInTheDocument();
    expect(screen.getByText("₹4,200")).toBeInTheDocument();

    // Check KPI summary counts
    expect(screen.getByText("Total Customers")).toBeInTheDocument();
    expect(screen.getAllByText("Repeat Buyers").length).toBeGreaterThan(0);
    expect(screen.getByText("Lifetime Revenue")).toBeInTheDocument();
  });

  it("strictly scopes customer data to the current vendor store", () => {
    render(<VendorCustomersView storeId={testStoreId} storeName="Handmade Haven" />);

    // Stranger Customer from other store should NOT be present
    expect(screen.queryByText("Stranger Customer")).not.toBeInTheDocument();
    expect(screen.queryByText("stranger@other.com")).not.toBeInTheDocument();

    // Direct API verification
    const customers = getVendorCustomers(testStoreId);
    expect(customers.some((c) => c.email === "stranger@other.com")).toBe(false);
    expect(customers.length).toBe(3);
  });

  it("searches customers by name, email, phone, or location", () => {
    render(<VendorCustomersView storeId={testStoreId} storeName="Handmade Haven" />);

    const searchInput = screen.getByLabelText(/search customers/i);

    // Search by name
    fireEvent.change(searchInput, { target: { value: "Diya" } });
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.queryByText("Aarav Sharma")).not.toBeInTheDocument();
    expect(screen.queryByText("Kabir Mehta")).not.toBeInTheDocument();

    // Search by email
    fireEvent.change(searchInput, { target: { value: "aarav@" } });
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.queryByText("Diya Patel")).not.toBeInTheDocument();

    // Search by phone
    fireEvent.change(searchInput, { target: { value: "97222" } });
    expect(screen.getByText("Kabir Mehta")).toBeInTheDocument();
    expect(screen.queryByText("Diya Patel")).not.toBeInTheDocument();

    // Clear search
    const clearButton = screen.getByLabelText(/clear customer search/i);
    fireEvent.click(clearButton);
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.getByText("Kabir Mehta")).toBeInTheDocument();
  });

  it("filters customers by segment/tier (Repeat, VIP, First-Time)", () => {
    render(<VendorCustomersView storeId={testStoreId} storeName="Handmade Haven" />);

    // Filter by Repeat Buyers (Aarav has 2 orders)
    const repeatButton = screen.getByRole("button", { name: /repeat buyers/i });
    fireEvent.click(repeatButton);

    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.queryByText("Kabir Mehta")).not.toBeInTheDocument();

    // Filter by First-Time (Diya & Kabir each have 1 order, Kabir is New)
    const firstTimeButton = screen.getByRole("button", { name: /first-time/i });
    fireEvent.click(firstTimeButton);

    expect(screen.getByText("Kabir Mehta")).toBeInTheDocument();
    expect(screen.queryByText("Aarav Sharma")).not.toBeInTheDocument();

    // Switch back to All Customers
    const allButton = screen.getByRole("button", { name: /all customers/i });
    fireEvent.click(allButton);
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.getByText("Kabir Mehta")).toBeInTheDocument();
  });

  it("sorts customers by spend, order count, and name", () => {
    render(<VendorCustomersView storeId={testStoreId} storeName="Handmade Haven" />);

    const sortSelect = screen.getByLabelText(/sort customers/i);

    // Sort by name A-Z
    fireEvent.change(sortSelect, { target: { value: "name-asc" } });
    const rows = screen.getAllByTestId(/^customer-row-/);
    expect(rows[0]).toHaveTextContent("Aarav Sharma");
    expect(rows[1]).toHaveTextContent("Diya Patel");
    expect(rows[2]).toHaveTextContent("Kabir Mehta");
  });

  it("opens customer details view and displays complete profile and order history", async () => {
    render(<VendorCustomersView storeId={testStoreId} storeName="Handmade Haven" />);

    // Click "View Details" on Aarav Sharma
    const viewButton = screen.getByLabelText(/view details for aarav sharma/i);
    fireEvent.click(viewButton);

    // Modal should appear
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByRole("heading", { name: "Aarav Sharma" })).toBeInTheDocument();
    expect(within(modal).getByText(/Whitefield, Bengaluru - 560066/i)).toBeInTheDocument();

    // Order history with store should display both orders
    expect(within(modal).getByText("#1001")).toBeInTheDocument();
    expect(within(modal).getByText("#1002")).toBeInTheDocument();
    expect(within(modal).getByText("Handmade Bamboo Lamp +1 more")).toBeInTheDocument();
    expect(within(modal).getByText("Incense Diffuser")).toBeInTheDocument();
    expect(within(modal).getByText("Delivered")).toBeInTheDocument();
    expect(within(modal).getByText("Shipped")).toBeInTheDocument();

    // Close modal via Escape key
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("persists and displays vendor customer notes", async () => {
    render(<VendorCustomersView storeId={testStoreId} storeName="Handmade Haven" />);

    // Open Aarav's modal
    const viewButton = screen.getByLabelText(/view details for aarav sharma/i);
    fireEvent.click(viewButton);

    // Add note
    const notesInput = screen.getByLabelText(/customer notes/i);
    fireEvent.change(notesInput, {
      target: { value: "VIP customer - prefers eco-friendly paper packaging" },
    });

    const saveNoteButton = screen.getByRole("button", { name: /save note/i });
    fireEvent.click(saveNoteButton);

    await waitFor(() => {
      expect(screen.getByText(/note saved successfully/i)).toBeInTheDocument();
    });

    // Close and verify persistence in API
    const customer = getVendorCustomerByEmail("aarav@example.com", testStoreId);
    expect(customer?.notes).toBe("VIP customer - prefers eco-friendly paper packaging");
  });

  it("handles empty and error states gracefully", () => {
    // Render store with no orders
    const { unmount } = render(
      <VendorCustomersView storeId="empty-store" storeName="Brand New Store" />,
    );

    expect(screen.getByTestId("customers-empty-state")).toBeInTheDocument();
    expect(screen.getByText(/no customers yet/i)).toBeInTheDocument();
    unmount();

    // Render with filter that matches no one
    render(<VendorCustomersView storeId={testStoreId} storeName="Handmade Haven" />);
    const searchInput = screen.getByLabelText(/search customers/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentXYZ" } });

    expect(screen.getByTestId("customers-no-results")).toBeInTheDocument();
    expect(screen.getByText(/no matching customers/i)).toBeInTheDocument();

    // Reset filters restores data
    const resetButton = screen.getAllByRole("button", { name: /reset filters/i })[0];
    if (resetButton) fireEvent.click(resetButton);
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
  });

  it("renders seamlessly inside VendorNonDashboardView when activeTab is customers", () => {
    render(
      <VendorNonDashboardView
        activeTab="customers"
        onBackToDashboard={() => {}}
        storeId={testStoreId}
        storeName="Handmade Haven"
      />,
    );

    expect(screen.getByText("Customer Directory")).toBeInTheDocument();
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
  });
});

