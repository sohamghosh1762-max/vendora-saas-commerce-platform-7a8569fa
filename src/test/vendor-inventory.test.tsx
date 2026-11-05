import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { VendorInventoryView } from "@/components/vendor-dashboard/VendorInventoryView";
import { addVendorProduct, getVendorProducts } from "@/lib/vendor-api";

const storeId = "inventory-test-store";

function addProduct(name: string, category: string, stock: number, sku?: string) {
  return addVendorProduct({
    name,
    storeId,
    storeName: "Inventory Test",
    category,
    price: 100,
    originalPrice: 100,
    rating: 5,
    reviews: 0,
    image: "test-image.png",
    description: "Test item",
    stock,
    ...(sku ? { sku } : {}),
  });
}

describe("Vendor inventory management", () => {
  beforeEach(() => localStorage.clear());

  it("shows stock statuses and supports category and stock filters", async () => {
    addProduct("Ready Mug", "home-living", 20, "MUG-01");
    addProduct("Low Mug", "home-living", 4);
    addProduct("Empty Headphones", "electronics", 0);
    render(<VendorInventoryView storeId={storeId} />);

    expect((await screen.findAllByText("In stock")).length).toBeGreaterThan(1);
    expect((await screen.findAllByText("Low stock")).length).toBeGreaterThan(1);
    expect((await screen.findAllByText("Out of stock")).length).toBeGreaterThan(1);
    expect(screen.getByText("MUG-01")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter inventory by stock status"), {
      target: { value: "out_of_stock" },
    });
    expect(screen.getByText("Empty Headphones")).toBeInTheDocument();
    expect(screen.queryByText("Ready Mug")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter inventory by category"), {
      target: { value: "home-living" },
    });
    expect(screen.getByText("No matching inventory")).toBeInTheDocument();
  });

  it("validates quantities and persists stock changes on the product record", async () => {
    const product = addProduct("Desk Lamp", "home-living", 12);
    render(<VendorInventoryView storeId={storeId} />);

    const stockInput = await screen.findByLabelText("Stock quantity for Desk Lamp");
    fireEvent.change(stockInput, { target: { value: "-2" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Enter a whole number of 0 or more.")).toBeInTheDocument();
    expect(getVendorProducts(storeId).find((item) => item.id === product.id)?.stock).toBe(12);

    fireEvent.change(stockInput, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Desk Lamp stock updated."),
    );
    const persistedProduct = getVendorProducts(storeId).find((item) => item.id === product.id);
    expect(persistedProduct?.stock).toBe(0);
    expect(persistedProduct?.status).toBe("out_of_stock");
    expect((await screen.findAllByText("Out of stock")).length).toBeGreaterThan(1);
  });

  it("searches product names and SKUs", async () => {
    addProduct("Ceramic Bowl", "home-living", 8, "BOWL-88");
    addProduct("Trail Bottle", "sports", 22);
    render(<VendorInventoryView storeId={storeId} />);
    const search = screen.getByRole("textbox", { name: "Search inventory" });
    fireEvent.change(search, { target: { value: "BOWL-88" } });
    expect(await screen.findByText("Ceramic Bowl")).toBeInTheDocument();
    expect(screen.queryByText("Trail Bottle")).not.toBeInTheDocument();
  });
});
