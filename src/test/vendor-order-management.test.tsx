import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { VendorOrdersView } from "@/components/vendor-dashboard/VendorOrdersView";
import {
  getVendorOrders,
  updateVendorOrderStatus,
} from "@/lib/vendor-api";
import { saveStoredOrders } from "@/lib/vendor-storage";
import type { VendorOrder } from "@/lib/vendor-types";

const testStoreId = "test-order-store";

const mockOrders: VendorOrder[] = [
  {
    id: "ord-test-101",
    orderNumber: "#101",
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
    status: "Pending",
    date: "Nov 10, 2026",
    paymentMethod: "UPI (Prepaid)",
    trackingNumber: "VND-TRK-101",
  },
  {
    id: "ord-test-102",
    orderNumber: "#102",
    storeId: testStoreId,
    customerName: "Diya Patel",
    customerEmail: "diya@example.com",
    customerPhone: "+91 98111 22334",
    shippingAddress: "22 Park View, Vastrapur, Ahmedabad - 380015",
    items: [{ productName: "Organic Cotton Throw", qty: 1, price: 2200 }],
    total: 2200,
    status: "Processing",
    date: "Nov 09, 2026",
    paymentMethod: "Credit Card (Prepaid)",
    trackingNumber: "VND-TRK-102",
  },
  {
    id: "ord-test-103",
    orderNumber: "#103",
    storeId: testStoreId,
    customerName: "Kabir Mehta",
    customerEmail: "kabir@example.com",
    customerPhone: "+91 97222 33445",
    shippingAddress: "54 Jubilee Hills, Hyderabad - 500033",
    items: [{ productName: "Walnut Wood Coasters", qty: 1, price: 750 }],
    total: 750,
    status: "Shipped",
    date: "Nov 08, 2026",
    paymentMethod: "Net Banking (Prepaid)",
    trackingNumber: "VND-TRK-103",
  },
  {
    id: "ord-test-104",
    orderNumber: "#104",
    storeId: testStoreId,
    customerName: "Rohan Verma",
    customerEmail: "rohan.v@example.com",
    customerPhone: "+91 96333 44556",
    shippingAddress: "88 FC Road, Shivaji Nagar, Pune - 411005",
    items: [{ productName: "Linen Table Runner", qty: 1, price: 1100 }],
    total: 1100,
    status: "Delivered",
    date: "Nov 07, 2026",
    paymentMethod: "UPI (Prepaid)",
    trackingNumber: "VND-TRK-104",
  },
  {
    id: "ord-test-105",
    orderNumber: "#105",
    storeId: testStoreId,
    customerName: "Meera Sen",
    customerEmail: "meera@example.com",
    customerPhone: "+91 95444 55667",
    shippingAddress: "14 Salt Lake Sector 1, Kolkata - 700064",
    items: [{ productName: "Brass Incense Holder", qty: 1, price: 850 }],
    total: 850,
    status: "Cancelled",
    date: "Nov 06, 2026",
    paymentMethod: "Refunded to Source",
    trackingNumber: "VND-TRK-105",
  },
  {
    id: "ord-other-999",
    orderNumber: "#999",
    storeId: "other-vendor-store",
    customerName: "Other Customer",
    customerEmail: "other@example.com",
    items: [{ productName: "Other Product", qty: 1, price: 500 }],
    total: 500,
    status: "Pending",
    date: "Nov 05, 2026",
  },
];

describe("Week 3, Block 1: Vendor Order Management", () => {
  beforeEach(() => {
    localStorage.clear();
    saveStoredOrders(mockOrders);
  });

  it("displays orders with order ID, customer, date, products, total amount and status", async () => {
    render(<VendorOrdersView storeId={testStoreId} />);

    // Check order rows rendered
    expect(await screen.findByText("#101")).toBeInTheDocument();
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("aarav@example.com")).toBeInTheDocument();
    expect(screen.getByText("Nov 10, 2026")).toBeInTheDocument();
    expect(screen.getByText(/Handmade Bamboo Lamp × 2/)).toBeInTheDocument();
    expect(screen.getByText("₹3,400")).toBeInTheDocument();

    // Check all test orders for this store exist
    expect(screen.getByText("#102")).toBeInTheDocument();
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.getByText("#103")).toBeInTheDocument();
    expect(screen.getByText("Kabir Mehta")).toBeInTheDocument();
    expect(screen.getByText("#104")).toBeInTheDocument();
    expect(screen.getByText("Rohan Verma")).toBeInTheDocument();
    expect(screen.getByText("#105")).toBeInTheDocument();
    expect(screen.getByText("Meera Sen")).toBeInTheDocument();
  });

  it("filters orders by search query across order ID and customer name", async () => {
    render(<VendorOrdersView storeId={testStoreId} />);

    expect(await screen.findByText("Aarav Sharma")).toBeInTheDocument();

    const searchInput = screen.getByRole("textbox", { name: "Search orders" });

    // Search by customer name
    fireEvent.change(searchInput, { target: { value: "Diya" } });
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.queryByText("Aarav Sharma")).not.toBeInTheDocument();
    expect(screen.queryByText("Kabir Mehta")).not.toBeInTheDocument();

    // Search by order ID
    fireEvent.change(searchInput, { target: { value: "103" } });
    expect(screen.getByText("Kabir Mehta")).toBeInTheDocument();
    expect(screen.queryByText("Diya Patel")).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
  });

  it("filters orders by status: Pending, Processing, Shipped, Delivered and Cancelled", async () => {
    render(<VendorOrdersView storeId={testStoreId} />);

    expect(await screen.findByText("Aarav Sharma")).toBeInTheDocument();

    // Filter by Pending
    fireEvent.click(screen.getByRole("tab", { name: /Pending/i }));
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.queryByText("Diya Patel")).not.toBeInTheDocument();
    expect(screen.queryByText("Kabir Mehta")).not.toBeInTheDocument();

    // Filter by Processing
    fireEvent.click(screen.getByRole("tab", { name: /Processing/i }));
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.queryByText("Aarav Sharma")).not.toBeInTheDocument();

    // Filter by Shipped
    fireEvent.click(screen.getByRole("tab", { name: /Shipped/i }));
    expect(screen.getByText("Kabir Mehta")).toBeInTheDocument();
    expect(screen.queryByText("Diya Patel")).not.toBeInTheDocument();

    // Filter by Delivered
    fireEvent.click(screen.getByRole("tab", { name: /Delivered/i }));
    expect(screen.getByText("Rohan Verma")).toBeInTheDocument();
    expect(screen.queryByText("Kabir Mehta")).not.toBeInTheDocument();

    // Filter by Cancelled
    fireEvent.click(screen.getByRole("tab", { name: /Cancelled/i }));
    expect(screen.getByText("Meera Sen")).toBeInTheDocument();
    expect(screen.queryByText("Rohan Verma")).not.toBeInTheDocument();

    // Reset to All
    fireEvent.click(screen.getByRole("tab", { name: /All Orders/i }));
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Meera Sen")).toBeInTheDocument();
  });

  it("allows vendors to view complete order details in modal", async () => {
    render(<VendorOrdersView storeId={testStoreId} />);

    const detailsButton = await screen.findByRole("button", {
      name: "View details for ord-test-101",
    });
    fireEvent.click(detailsButton);

    // Modal opens with complete order details
    expect(await screen.findByText("Order Details — #101")).toBeInTheDocument();
    expect(screen.getByText("Flat 101, Palm Residency, Whitefield, Bengaluru - 560066")).toBeInTheDocument();
    expect(screen.getByText("+91 98765 43210")).toBeInTheDocument();
    expect(screen.getByText("Handmade Bamboo Lamp")).toBeInTheDocument();
    expect(screen.getByText("Ceramic Tea Cups")).toBeInTheDocument();
    expect(screen.getByText("VND-TRK-101")).toBeInTheDocument();
    expect(screen.getByText("UPI (Prepaid)")).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByRole("button", { name: "Close Details" }));
    await waitFor(() => {
      expect(screen.queryByText("Order Details — #101")).not.toBeInTheDocument();
    });
  });

  it("allows vendors to update order status and validates transitions", async () => {
    render(<VendorOrdersView storeId={testStoreId} />);

    // 1. Valid update: Pending (#101) -> Processing
    const statusSelect = await screen.findByRole("combobox", {
      name: "Update status for ord-test-101",
    });
    fireEvent.change(statusSelect, { target: { value: "Processing" } });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Order ord-test-101 status updated to Processing.",
      );
    });

    // Verify persisted in localStorage
    const stored = getVendorOrders(testStoreId);
    expect(stored.find((o) => o.id === "ord-test-101")?.status).toBe("Processing");

    // 2. Open details modal for Shipped (#103) and attempt invalid revert to Pending
    const detailsButton = screen.getByRole("button", {
      name: "View details for ord-test-103",
    });
    fireEvent.click(detailsButton);

    expect(await screen.findByText("Order Details — #103")).toBeInTheDocument();
    const modalSelect = screen.getByRole("combobox", {
      name: "Select new order status",
    });
    fireEvent.change(modalSelect, { target: { value: "Pending" } });
    fireEvent.click(screen.getByRole("button", { name: "Update Status" }));

    // Should display validation error
    expect(
      await screen.findByText("Shipped orders cannot be reverted to earlier stages."),
    ).toBeInTheDocument();
    // Status must remain Shipped
    expect(getVendorOrders(testStoreId).find((o) => o.id === "ord-test-103")?.status).toBe(
      "Shipped",
    );
  });

  it("prevents modifying Delivered and Cancelled orders", async () => {
    // Attempt updating Delivered via API
    const delRes = updateVendorOrderStatus("ord-test-104", "Processing", testStoreId);
    expect(delRes.success).toBe(false);
    expect(delRes.error).toBe("Delivered orders cannot have their status modified.");

    // Attempt updating Cancelled via API
    const cancRes = updateVendorOrderStatus("ord-test-105", "Processing", testStoreId);
    expect(cancRes.success).toBe(false);
    expect(cancRes.error).toBe("Cancelled orders cannot be modified.");

    render(<VendorOrdersView storeId={testStoreId} />);

    // In the UI, status select for Delivered and Cancelled orders is disabled
    const deliveredSelect = await screen.findByRole("combobox", {
      name: "Update status for ord-test-104",
    });
    expect(deliveredSelect).toBeDisabled();

    const cancelledSelect = screen.getByRole("combobox", {
      name: "Update status for ord-test-105",
    });
    expect(cancelledSelect).toBeDisabled();
  });

  it("keeps order data strictly scoped to the correct vendor", async () => {
    render(<VendorOrdersView storeId={testStoreId} />);

    // Test store orders are shown
    expect(await screen.findByText("#101")).toBeInTheDocument();

    // Order from other-vendor-store is NOT shown
    expect(screen.queryByText("#999")).not.toBeInTheDocument();
    expect(screen.queryByText("Other Customer")).not.toBeInTheDocument();

    // Unauthorized update across vendors is rejected
    const crossRes = updateVendorOrderStatus("ord-other-999", "Processing", testStoreId);
    expect(crossRes.success).toBe(false);
    expect(crossRes.error).toBe("Unauthorized: Order belongs to another store.");
  });

  it("handles empty and error states clearly", async () => {
    // Render store with no orders
    const { rerender } = render(<VendorOrdersView storeId="brand-new-empty-store" />);

    expect(await screen.findByText("No orders yet")).toBeInTheDocument();
    expect(
      screen.getByText(/When customers purchase products from your storefront/i),
    ).toBeInTheDocument();

    // Rerender with testStoreId and test empty search state
    rerender(<VendorOrdersView storeId={testStoreId} />);
    expect(await screen.findByText("Aarav Sharma")).toBeInTheDocument();

    const searchInput = screen.getByRole("textbox", { name: "Search orders" });
    fireEvent.change(searchInput, { target: { value: "NonExistentCustomerNameXYZ" } });

    expect(await screen.findByText("No matching orders found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();

    // Clicking clear filters restores list
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(await screen.findByText("Aarav Sharma")).toBeInTheDocument();
  });
});

