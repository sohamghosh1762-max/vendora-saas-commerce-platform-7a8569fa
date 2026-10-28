import { ArrowLeft, Check, Plus, Search, Tag } from "lucide-react";
import type { SidebarTab } from "./VendorSidebar";
import { REFERENCE_ORDERS, REFERENCE_TOP_PRODUCTS } from "@/lib/vendor-dashboard-data";
import { useState } from "react";

interface VendorNonDashboardViewProps {
  activeTab: SidebarTab;
  onBackToDashboard: () => void;
  onAddProductClick?: () => void;
  storeName?: string;
}

export function VendorNonDashboardView({
  activeTab,
  onBackToDashboard,
  onAddProductClick,
  storeName = "The Urban Nest",
}: VendorNonDashboardViewProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const tabTitles: Record<SidebarTab, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: "Overview of your storefront" },
    products: {
      title: "Products Catalog",
      subtitle: `Manage and organize products for ${storeName}`,
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
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#ECEAF5]">
            <span className="text-xs font-bold text-[#110D27]">
              All Products ({REFERENCE_TOP_PRODUCTS.length})
            </span>
          </div>

          <div className="mt-3 divide-y divide-[#F1EFF7]">
            {REFERENCE_TOP_PRODUCTS.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-3 rounded-xl px-2 hover:bg-[#F9F8FD]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="size-11 rounded-xl object-cover shrink-0 bg-[#F4F2FC]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#110D27]">{p.name}</h4>
                    <span className="text-[11px] text-[#7A7F93]">
                      {p.unitsSold} units sold • Stock: 48 units available
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#110D27]">{p.formattedRevenue}</span>
                  <span className="block text-[10px] font-semibold text-[#10B981]">
                    Active in catalog
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#ECEAF5]">
            <span className="text-xs font-bold text-[#110D27]">
              Fulfilled & In-Transit Orders ({REFERENCE_ORDERS.length})
            </span>
          </div>

          <div className="mt-3 divide-y divide-[#F1EFF7]">
            {REFERENCE_ORDERS.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between py-3 rounded-xl px-2 hover:bg-[#F9F8FD]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={o.image}
                    alt={o.customerName}
                    className="size-11 rounded-xl object-cover shrink-0 bg-[#F4F2FC]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#110D27]">
                      {o.orderNumber} — {o.customerName}
                    </h4>
                    <span className="text-[11px] text-[#7A7F93]">Placed on {o.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#110D27]">{o.formattedAmount}</span>
                  <span className="block text-[10px] font-semibold text-[#6538F5]">
                    Status: {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generic placeholder for other tabs */}
      {activeTab !== "products" && activeTab !== "orders" && (
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
