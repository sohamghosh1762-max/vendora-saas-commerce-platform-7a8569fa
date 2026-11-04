import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StoreSettingsModal } from "@/components/vendor-dashboard/VendorModals";
import { getVendorStore, updateVendorStore } from "@/lib/vendor-api";
import { saveCustomStoresStrict } from "@/lib/vendor-storage";
import type { VendorStore } from "@/lib/vendor-types";

const store: VendorStore = {
  id: "store-test",
  slug: "store-test",
  name: "Test Shop",
  tagline: "A test store",
  category: "home-living",
  description: "A store description",
  tint: "bg-cat-home text-cat-home-fg",
  ownerId: "vendor-test",
  ownerEmail: "owner@example.com",
  phone: "+91 98765 43210",
  address: "1 Market Road",
  city: "Pune",
  state: "Maharashtra",
  postalCode: "411001",
  businessType: "Sole Proprietorship",
  returnPolicy: "14-Day Easy Returns",
  shippingMethod: "Standard",
  processingTime: "2 days",
  supportEmail: "support@example.com",
  status: "ACTIVE",
  rating: 5,
  reviews: 0,
  productCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("Vendor store management", () => {
  beforeEach(() => localStorage.clear());

  it("validates required fields and contact information", async () => {
    const onSave = vi.fn();
    render(
      <StoreSettingsModal
        isOpen
        store={{ ...store, name: "", ownerEmail: "bad-email" }}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save Store Details" }));
    expect(await screen.findByText("Store name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid contact email address.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("reads an uploaded logo, saves edits, and reloads persisted store data", async () => {
    saveCustomStoresStrict([store]);
    const saved = vi.fn(async (updates: Partial<VendorStore>) => {
      await updateVendorStore(store.id, updates);
      return true;
    });
    render(<StoreSettingsModal isOpen store={store} onClose={vi.fn()} onSave={saved} />);
    const logo = new File(["test"], "logo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Store logo"), { target: { files: [logo] } });
    await waitFor(() => expect(screen.getByAltText("Store logo preview")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Store name *"), { target: { value: "Updated Shop" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Store Details" }));
    await waitFor(() => expect(saved).toHaveBeenCalled());
    expect(getVendorStore(store.id)?.name).toBe("Updated Shop");
    expect(getVendorStore(store.id)?.logoUrl).toMatch(/^data:image\/png;base64,/);
  });
});
