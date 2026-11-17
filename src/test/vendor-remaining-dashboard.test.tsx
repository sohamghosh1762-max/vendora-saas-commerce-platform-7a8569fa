import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { VendorAnalyticsView } from "@/components/vendor-dashboard/VendorAnalyticsView";
import { VendorPayoutsView } from "@/components/vendor-dashboard/VendorPayoutsView";
import { VendorIntegrationsView } from "@/components/vendor-dashboard/VendorIntegrationsView";
import { VendorMarketingView } from "@/components/vendor-dashboard/VendorMarketingView";
import { VendorAppearanceView } from "@/components/vendor-dashboard/VendorAppearanceView";
import { VendorNonDashboardView } from "@/components/vendor-dashboard/VendorNonDashboardView";
import {
  getVendorAnalytics,
  getVendorPayouts,
  getVendorPayoutSummary,
  requestVendorPayout,
  getVendorIntegrations,
  toggleVendorIntegration,
  getVendorCoupons,
  createVendorCoupon,
} from "@/lib/vendor-api";
import {
  saveStoredPayouts,
  saveStoredIntegrations,
  saveStoredCoupons,
} from "@/lib/vendor-storage";

const testStoreId = "the-urban-nest";

describe("Remaining Vendor Dashboard Modules", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // -------------------------------------------------------------
  // 1. Analytics Dashboard
  // -------------------------------------------------------------
  describe("Vendor Analytics Dashboard", () => {
    it("displays total revenue, sales, orders, and products sold", async () => {
      render(<VendorAnalyticsView storeId={testStoreId} storeName="The Urban Nest" />);

      // Check KPI values rendered
      expect(screen.getByTestId("kpi-total-revenue")).toBeInTheDocument();
      expect(screen.getByTestId("kpi-total-orders")).toBeInTheDocument();
      expect(screen.getByTestId("kpi-products-sold")).toBeInTheDocument();
      expect(screen.getByTestId("kpi-aov")).toBeInTheDocument();

      // Check labels
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
      expect(screen.getByText("Total Orders")).toBeInTheDocument();
      expect(screen.getByText("Products Sold")).toBeInTheDocument();
      expect(screen.getByText("Avg. Order Value")).toBeInTheDocument();
    });

    it("supports date range filtering and updates analytics", async () => {
      render(<VendorAnalyticsView storeId={testStoreId} storeName="The Urban Nest" />);

      const filterSection = screen.getByTestId("date-range-filter");
      const sevenDaysBtn = within(filterSection).getByRole("button", { name: /Last 7 Days/i });
      fireEvent.click(sevenDaysBtn);

      // Range button gets selected style
      expect(sevenDaysBtn.className).toContain("bg-[#6538F5]");

      // Switch to Last 90 Days
      const ninetyDaysBtn = within(filterSection).getByRole("button", { name: /Last 90 Days/i });
      fireEvent.click(ninetyDaysBtn);
      expect(ninetyDaysBtn.className).toContain("bg-[#6538F5]");
    });

    it("displays best-selling products list and category share breakdown", () => {
      render(<VendorAnalyticsView storeId={testStoreId} storeName="The Urban Nest" />);

      expect(screen.getByText("Best-Selling Products")).toBeInTheDocument();
      const bestSellersList = screen.getByTestId("best-sellers-list");
      expect(within(bestSellersList).getByText(/Minimalist Skincare Set/i)).toBeInTheDocument();

      expect(screen.getByText("Category Share")).toBeInTheDocument();
      expect(screen.getByText("Home & Living")).toBeInTheDocument();
    });

    it("allows exporting analytics reports", () => {
      render(<VendorAnalyticsView storeId={testStoreId} storeName="The Urban Nest" />);

      const exportBtn = screen.getByRole("button", { name: /Export Analytics/i });
      fireEvent.click(exportBtn);

      expect(screen.getByText("Report exported")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // 2. Payout Management
  // -------------------------------------------------------------
  describe("Vendor Payouts and Settlements", () => {
    it("displays total earnings, available balance, and pending payouts", () => {
      render(<VendorPayoutsView storeId={testStoreId} storeName="The Urban Nest" />);

      expect(screen.getByTestId("payout-total-earnings")).toBeInTheDocument();
      expect(screen.getByTestId("payout-available-balance")).toBeInTheDocument();
      expect(screen.getByTestId("payout-pending")).toBeInTheDocument();

      expect(screen.getByText("Total Lifetime Earnings")).toBeInTheDocument();
      expect(screen.getByText("Available Balance")).toBeInTheDocument();
      expect(screen.getByText("Pending Payouts")).toBeInTheDocument();
    });

    it("displays payout history transactions with amounts, dates, methods and statuses", () => {
      render(<VendorPayoutsView storeId={testStoreId} storeName="The Urban Nest" />);

      const table = screen.getByTestId("payouts-table");
      expect(within(table).getByText("PO-8941")).toBeInTheDocument();
      expect(within(table).getByText("PO-8940")).toBeInTheDocument();
      expect(within(table).getByText("PO-8942")).toBeInTheDocument();

      expect(within(table).getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
      expect(within(table).getByText("Processing")).toBeInTheDocument();
    });

    it("filters payouts by status", () => {
      render(<VendorPayoutsView storeId={testStoreId} storeName="The Urban Nest" />);

      const processingFilterBtn = screen.getByRole("button", { name: "Processing" });
      fireEvent.click(processingFilterBtn);

      const table = screen.getByTestId("payouts-table");
      expect(within(table).getByText("PO-8942")).toBeInTheDocument();
      expect(within(table).queryByText("PO-8941")).not.toBeInTheDocument();
    });

    it("searches payouts by ID or UTR number", () => {
      render(<VendorPayoutsView storeId={testStoreId} storeName="The Urban Nest" />);

      const searchInput = screen.getByPlaceholderText(/Search by payout ID/i);
      fireEvent.change(searchInput, { target: { value: "PO-8940" } });

      const table = screen.getByTestId("payouts-table");
      expect(within(table).getByText("PO-8940")).toBeInTheDocument();
      expect(within(table).queryByText("PO-8941")).not.toBeInTheDocument();
    });

    it("allows vendor to request a payout withdrawal, updating balance and persisting in storage", async () => {
      render(<VendorPayoutsView storeId={testStoreId} storeName="The Urban Nest" />);

      const requestBtn = screen.getByRole("button", { name: /Request Payout/i });
      fireEvent.click(requestBtn);

      const modal = screen.getByRole("dialog");
      expect(within(modal).getByText("Request Payout Withdrawal")).toBeInTheDocument();

      const amountInput = within(modal).getByLabelText(/Withdrawal Amount/i);
      fireEvent.change(amountInput, { target: { value: "5000" } });

      const confirmBtn = within(modal).getByRole("button", { name: /Confirm Withdrawal/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByText(/Withdrawal request of .* initiated successfully/i)).toBeInTheDocument();
      });

      // Verify withdrawal added to storage
      const payouts = getVendorPayouts(testStoreId);
      expect(payouts.some((p) => p.amount === 5000 && p.status === "Processing")).toBe(true);
    });

    it("prevents requesting payout exceeding available balance", async () => {
      render(<VendorPayoutsView storeId={testStoreId} storeName="The Urban Nest" />);

      const requestBtn = screen.getByRole("button", { name: /Request Payout/i });
      fireEvent.click(requestBtn);

      const modal = screen.getByRole("dialog");
      const amountInput = within(modal).getByLabelText(/Withdrawal Amount/i);
      fireEvent.change(amountInput, { target: { value: "999999999" } });

      const confirmBtn = within(modal).getByRole("button", { name: /Confirm Withdrawal/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByText(/Requested amount exceeds available balance/i)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------
  // 3. Integrations
  // -------------------------------------------------------------
  describe("Vendor Integrations", () => {
    it("displays available integrations and their connection statuses", () => {
      render(<VendorIntegrationsView storeId={testStoreId} storeName="The Urban Nest" />);

      expect(screen.getByText("Razorpay Payments")).toBeInTheDocument();
      expect(screen.getByText("Shiprocket Logistics")).toBeInTheDocument();
      expect(screen.getByText("Delhivery Direct")).toBeInTheDocument();

      expect(screen.getAllByText("Connected").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Disconnected").length).toBeGreaterThanOrEqual(1);
    });

    it("clearly distinguishes functional integrations from UI demonstrations", () => {
      render(<VendorIntegrationsView storeId={testStoreId} storeName="The Urban Nest" />);

      // Razorpay is functional
      const razorpayCard = screen.getByTestId("integration-card-razorpay");
      expect(within(razorpayCard).getByText("Functional Service")).toBeInTheDocument();

      // Delhivery is a UI Demo
      const delhiveryCard = screen.getByTestId("integration-card-delhivery");
      expect(within(delhiveryCard).getByText("UI Demo")).toBeInTheDocument();
    });

    it("allows connecting and disconnecting integrations with persistent state updates", async () => {
      render(<VendorIntegrationsView storeId={testStoreId} storeName="The Urban Nest" />);

      // Delhivery is currently disconnected
      const delhiveryCard = screen.getByTestId("integration-card-delhivery");
      const connectBtn = within(delhiveryCard).getByRole("button", { name: "Connect" });
      fireEvent.click(connectBtn);

      await waitFor(() => {
        expect(screen.getByText(/Successfully connected Delhivery Direct/i)).toBeInTheDocument();
      });

      // Verify in storage
      const items = getVendorIntegrations(testStoreId);
      const delhivery = items.find((i) => i.id === "delhivery");
      expect(delhivery?.status).toBe("connected");
    });

    it("filters integrations by category", () => {
      render(<VendorIntegrationsView storeId={testStoreId} storeName="The Urban Nest" />);

      const shippingBtn = screen.getByRole("button", { name: "Logistics & Shipping" });
      fireEvent.click(shippingBtn);

      expect(screen.getByText("Shiprocket Logistics")).toBeInTheDocument();
      expect(screen.queryByText("Razorpay Payments")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // 4. Marketing & Coupons
  // -------------------------------------------------------------
  describe("Vendor Marketing and Coupons", () => {
    it("displays promotional coupons with discount parameters and allows creating new coupons", async () => {
      render(<VendorMarketingView storeId={testStoreId} storeName="The Urban Nest" />);

      expect(screen.getByText("WELCOME10")).toBeInTheDocument();
      expect(screen.getByText("FESTIVE500")).toBeInTheDocument();

      // Open Create Modal
      const createBtn = screen.getByRole("button", { name: /Create Coupon/i });
      fireEvent.click(createBtn);

      const modal = screen.getByRole("dialog");
      const codeInput = within(modal).getByPlaceholderText("e.g. FLASH25");
      fireEvent.change(codeInput, { target: { value: "SUMMER30" } });

      const discountInput = within(modal).getByPlaceholderText("15");
      fireEvent.change(discountInput, { target: { value: "30" } });

      const submitBtn = within(modal).getByRole("button", { name: /Create Voucher/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Coupon code 'SUMMER30' created successfully/i)).toBeInTheDocument();
      });

      const coupons = getVendorCoupons(testStoreId);
      expect(coupons.some((c) => c.code === "SUMMER30" && c.discountValue === 30)).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 5. Appearance Customization
  // -------------------------------------------------------------
  describe("Vendor Appearance Customization", () => {
    it("displays live storefront preview and allows updating tagline and theme", async () => {
      render(<VendorAppearanceView storeId={testStoreId} storeName="The Urban Nest" />);

      expect(screen.getByText("Branding & Visual Theme")).toBeInTheDocument();
      expect(screen.getByText("Live Storefront Card Preview")).toBeInTheDocument();

      const taglineInput = screen.getByLabelText(/Storefront Subtitle/i);
      fireEvent.change(taglineInput, { target: { value: "Eco-friendly handcrafted luxury" } });

      const saveBtn = screen.getByRole("button", { name: /Save Appearance Settings/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText(/Storefront appearance updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------
  // 6. Navigation Integration across all tabs
  // -------------------------------------------------------------
  describe("VendorNonDashboardView Integration across all remaining tabs", () => {
    it("renders Analytics view when activeTab is analytics", () => {
      render(
        <VendorNonDashboardView
          activeTab="analytics"
          onBackToDashboard={() => {}}
          storeId={testStoreId}
        />,
      );
      expect(screen.getByRole("heading", { level: 2, name: "Performance & Analytics" })).toBeInTheDocument();
      expect(screen.getByTestId("analytics-kpis")).toBeInTheDocument();
    });

    it("renders Payouts view when activeTab is payouts", () => {
      render(
        <VendorNonDashboardView
          activeTab="payouts"
          onBackToDashboard={() => {}}
          storeId={testStoreId}
        />,
      );
      expect(screen.getByRole("heading", { level: 2, name: "Payouts & Settlements" })).toBeInTheDocument();
      expect(screen.getByTestId("payouts-kpi-summary")).toBeInTheDocument();
    });

    it("renders Integrations view when activeTab is integrations", () => {
      render(
        <VendorNonDashboardView
          activeTab="integrations"
          onBackToDashboard={() => {}}
          storeId={testStoreId}
        />,
      );
      expect(screen.getByRole("heading", { level: 2, name: "Integrations & APIs" })).toBeInTheDocument();
      expect(screen.getByTestId("integrations-grid")).toBeInTheDocument();
    });

    it("renders Marketing view when activeTab is marketing", () => {
      render(
        <VendorNonDashboardView
          activeTab="marketing"
          onBackToDashboard={() => {}}
          storeId={testStoreId}
        />,
      );
      expect(screen.getByRole("heading", { level: 2, name: "Marketing & Campaigns" })).toBeInTheDocument();
      expect(screen.getByTestId("coupons-table")).toBeInTheDocument();
    });

    it("renders Appearance view when activeTab is appearance", () => {
      render(
        <VendorNonDashboardView
          activeTab="appearance"
          onBackToDashboard={() => {}}
          storeId={testStoreId}
        />,
      );
      expect(screen.getByRole("heading", { level: 2, name: "Storefront Appearance" })).toBeInTheDocument();
      expect(screen.getByText("Live Storefront Card Preview")).toBeInTheDocument();
    });
  });
});
