import { ArrowLeft, Check, Plus, Search, Tag } from "lucide-react";
import type { SidebarTab } from "./VendorSidebar";
import { REFERENCE_ORDERS } from "@/lib/vendor-dashboard-data";
import { useState } from "react";
import { VendorProductsView } from "./VendorProductsView";
import { VendorInventoryView } from "./VendorInventoryView";
import { VendorOrdersView } from "./VendorOrdersView";
import { VendorCustomersView } from "./VendorCustomersView";
import { VendorMessagesView } from "./VendorMessagesView";
import { VendorReviewsView } from "./VendorReviewsView";
import { VendorAnalyticsView } from "./VendorAnalyticsView";
import { VendorPayoutsView } from "./VendorPayoutsView";
import { VendorIntegrationsView } from "./VendorIntegrationsView";
import { VendorMarketingView } from "./VendorMarketingView";
import { VendorAppearanceView } from "./VendorAppearanceView";
import type { VendorStore } from "@/lib/vendor-types";

export interface VendorNonDashboardViewProps {
  activeTab: SidebarTab;
  onBackToDashboard: () => void;
  onAddProductClick?: () => void;
  storeName?: string;
  storeId?: string;
  onProductsChange?: () => void;
  store?: VendorStore | null;
  onEditStore?: () => void;
}

export function VendorNonDashboardView({
  activeTab,
  onBackToDashboard,
  onAddProductClick,
  storeName = "The Urban Nest",
  storeId = "the-urban-nest",
  onProductsChange,
  store,
  onEditStore,
}: VendorNonDashboardViewProps) {
  const tabTitles: Record<SidebarTab, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: "Overview of your storefront" },
    products: {
      title: "Products Catalog",
      subtitle: `Manage and organize products for ${storeName}`,
    },
    inventory: {
      title: "Inventory Management",
      subtitle: `Track and update stock for ${storeName}`,
    },
    orders: {
      title: "Order Management",
      subtitle: "Track order fulfillments, shipping, and customer receipts",
    },
    customers: {
      title: "Customer Directory",
      subtitle: "Manage buyers, view order histories, and customer interactions",
    },
    analytics: {
      title: "Performance & Analytics",
      subtitle: "Deep insights into sales conversion, visitors, and growth",
    },
    settings: {
      title: "Store Settings",
      subtitle: "Configure business details, policies, and logistics",
    },
    marketing: {
      title: "Marketing & Campaigns",
      subtitle: "Create discount coupons, promotional banners, and sales events",
    },
    payouts: {
      title: "Payouts & Settlements",
      subtitle: "Bank account routing, settlement schedules, and payment logs",
    },
    messages: {
      title: "Messages & Inquiries",
      subtitle: "Real-time customer questions, support queries, and chats",
    },
    reviews: {
      title: "Ratings & Customer Reviews",
      subtitle: "Verified shopper feedback and review replies",
    },
    appearance: {
      title: "Storefront Appearance",
      subtitle: "Brand cover, storefront logo, theme colors, and collections",
    },
    integrations: {
      title: "Integrations & APIs",
      subtitle: "Connected services: Payment gateways, logistics, and inventory sync",
    },
  };

  const current = tabTitles[activeTab] || tabTitles.products;

  return (
    <div className="space-y-6">
      {/* Top Banner with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#6538F5] transition hover:underline"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-2xl font-black text-[#110D27] tracking-tight">{current.title}</h2>
          <p className="mt-0.5 text-xs text-[#7A7F93]">{current.subtitle}</p>
        </div>

        {activeTab === "products" && onAddProductClick && (
          <button
            type="button"
            onClick={onAddProductClick}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6538F5] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#5228D9] active:scale-95"
          >
            <Plus className="size-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Tab Specific Content */}
      {activeTab === "products" && (
        <VendorProductsView
          storeId={storeId}
          storeName={storeName}
          onAddProductClick={onAddProductClick}
          onProductsChange={onProductsChange}
        />
      )}

      {activeTab === "inventory" && (
        <VendorInventoryView storeId={storeId} onInventoryChange={onProductsChange} />
      )}

      {activeTab === "orders" && (
        <VendorOrdersView
          storeId={storeId}
          onOrdersChange={onProductsChange}
        />
      )}

      {activeTab === "customers" && (
        <VendorCustomersView
          storeId={storeId}
          storeName={storeName}
        />
      )}

      {activeTab === "messages" && (
        <VendorMessagesView
          storeId={storeId}
          storeName={storeName}
        />
      )}

      {activeTab === "reviews" && (
        <VendorReviewsView
          storeId={storeId}
          storeName={storeName}
        />
      )}

      {activeTab === "analytics" && (
        <VendorAnalyticsView
          storeId={storeId}
          storeName={storeName}
        />
      )}

      {activeTab === "payouts" && (
        <VendorPayoutsView
          storeId={storeId}
          storeName={storeName}
        />
      )}

      {activeTab === "integrations" && (
        <VendorIntegrationsView
          storeId={storeId}
          storeName={storeName}
        />
      )}

      {activeTab === "marketing" && (
        <VendorMarketingView
          storeId={storeId}
          storeName={storeName}
        />
      )}

      {activeTab === "appearance" && (
        <VendorAppearanceView
          storeId={storeId}
          storeName={storeName}
          store={store}
          onStoreUpdated={onProductsChange}
        />
      )}

      {activeTab === "settings" && (
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {!store ? (
            <div role="status" className="py-10 text-center text-sm text-[#7A7F93]">
              Store details are unavailable.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  {store.logoUrl ? (
                    <img
                      src={store.logoUrl}
                      alt={`${store.name} logo`}
                      className="size-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="grid size-14 place-items-center rounded-xl bg-[#F0EBFE] text-[#6538F5]">
                      <Tag className="size-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-[#110D27]">{store.name}</h3>
                    <p className="text-xs text-[#7A7F93]">{store.tagline}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onEditStore}
                  className="rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white hover:bg-[#5228D9]"
                >
                  Edit Store Details
                </button>
              </div>
              {store.cover && (
                <img
                  src={store.cover}
                  alt={`${store.name} banner`}
                  className="mt-4 h-32 w-full rounded-xl object-cover"
                />
              )}
              <dl className="mt-5 grid gap-4 border-t border-[#ECEAF5] pt-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Description", store.description],
                  ["Contact phone", store.phone],
                  ["Contact email", store.ownerEmail],
                  ["Support email", store.supportEmail],
                  [
                    "Address",
                    `${store.address}, ${store.city}, ${store.state} ${store.postalCode}`,
                  ],
                  ["Business type", store.businessType],
                  ["Tax ID", store.taxId || "Not provided"],
                  ["Shipping", store.shippingMethod],
                  ["Processing time", store.processingTime],
                  ["Return policy", store.returnPolicy],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-[#7A7F93]">
                      {label}
                    </dt>
                    <dd className="mt-1 text-xs font-semibold text-[#110D27]">
                      {value || "Not provided"}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[11px] text-[#7A7F93]">
                Store edits are saved in this browser’s local storage.
              </p>
            </>
          )}
        </div>
      )}

      {/* Generic placeholder for any undefined tabs */}
      {activeTab !== "products" &&
        activeTab !== "inventory" &&
        activeTab !== "orders" &&
        activeTab !== "customers" &&
        activeTab !== "messages" &&
        activeTab !== "reviews" &&
        activeTab !== "analytics" &&
        activeTab !== "payouts" &&
        activeTab !== "integrations" &&
        activeTab !== "marketing" &&
        activeTab !== "appearance" &&
        activeTab !== "settings" && (
          <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-[#ECEAF5] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#F0EBFE] text-[#6538F5]">
              <Tag className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#110D27]">{current.title}</h3>
            <p className="mt-1 max-w-md text-xs text-[#7A7F93]">
              {current.subtitle}. This section is enabled for {storeName}.
            </p>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="mt-5 rounded-xl bg-[#6538F5] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9]"
            >
              Return to Dashboard
            </button>
          </div>
        )}
    </div>
  );
}
