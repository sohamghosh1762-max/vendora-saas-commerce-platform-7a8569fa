import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { VendorKpiCards } from "./VendorKpiCards";
import { VendorSalesChart } from "./VendorSalesChart";
import { VendorRecentOrders } from "./VendorRecentOrders";
import { VendorTopProducts } from "./VendorTopProducts";
import { VendorStoreCard } from "./VendorStoreCard";
import { VendorProfileCompletion } from "./VendorProfileCompletion";
import { VendorQuickActions } from "./VendorQuickActions";
import { VendorRecentActivity } from "./VendorRecentActivity";
import {
  REFERENCE_DATE_RANGE,
  REFERENCE_KPIS,
  REFERENCE_ORDERS,
  type DashboardChecklistItem,
  type DashboardOrder,
} from "@/lib/vendor-dashboard-data";
import type { SidebarTab } from "./VendorSidebar";

export interface VendorDashboardOverviewProps {
  displayName: string;
  storeName: string;
  storeSlug: string;
  storeUrl: string;
  storeImage: string;
  completionPercentage: number;
  checklistItems: DashboardChecklistItem[];
  onSelectChecklistAction: (actionKey: string) => void;
  onNavigateTab: (tab: SidebarTab) => void;
  onOpenAddProduct: () => void;
  onOpenStoreSettings: () => void;
  onSelectOrder: (order: DashboardOrder) => void;
}

export function VendorDashboardOverview({
  displayName,
  storeName,
  storeSlug,
  storeUrl,
  storeImage,
  completionPercentage,
  checklistItems,
  onSelectChecklistAction,
  onNavigateTab,
  onOpenAddProduct,
  onOpenStoreSettings,
  onSelectOrder,
}: VendorDashboardOverviewProps) {
  // Date Range filter state
  const [dateRange, setDateRange] = useState<string>(REFERENCE_DATE_RANGE);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const firstName = displayName.split(" ")[0] || displayName;

  return (
    <div className="space-y-5">
      {/* Welcome Section & Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-[#110D27] leading-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-1 text-xs text-[#7A7F93] font-medium leading-tight">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Date Range Selector Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDateDropdownOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ECEAF5] bg-white px-3.5 py-2 text-xs font-semibold text-[#4B5264] shadow-xs transition hover:border-[#6538F5]/30 active:scale-98"
            aria-label="Filter date range"
          >
            <Calendar className="size-3.5 text-[#7A7F93]" />
            <span>{dateRange}</span>
            <ChevronDown className="size-3.5 text-[#7A7F93]" />
          </button>

          {isDateDropdownOpen && (
            <div className="absolute right-0 top-11 z-30 w-56 rounded-2xl border border-[#ECEAF5] bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase text-[#9AA0B2]">
                Reporting Period
              </div>
              {[
                "Oct 1, 2024 - Oct 26, 2024",
                "Last 7 Days",
                "Last 30 Days",
                "This Quarter",
                "Year to Date",
              ].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => {
                    setDateRange(range);
                    setIsDateDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-left transition ${
                    dateRange === range
                      ? "bg-[#F0EBFE] font-bold text-[#6538F5]"
                      : "text-[#374151] hover:bg-[#F9F8FD]"
                  }`}
                >
                  <span>{range}</span>
                  {dateRange === range && (
                    <span className="size-1.5 rounded-full bg-[#6538F5]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Four Summary Metric Cards */}
      <VendorKpiCards
        metrics={REFERENCE_KPIS}
        onSelectMetric={() => {
          // Can toggle active metric or tab
        }}
      />

      {/* Main Content Grid: Left Content (66%) + Right Content (34%) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Left Column (8 cols on desktop) */}
        <div className="space-y-5 lg:col-span-8">
          {/* Sales Overview Card */}
          <VendorSalesChart />

          {/* Two-Column Lower Panels: Recent Orders + Top Products */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <VendorRecentOrders
              onViewAll={() => onNavigateTab("orders")}
              onSelectOrder={onSelectOrder}
            />
            <VendorTopProducts
              onViewAll={() => onNavigateTab("products")}
              onSelectProduct={onOpenAddProduct}
            />
          </div>
        </div>

        {/* Right Column (4 cols on desktop) */}
        <div className="space-y-5 lg:col-span-4">
          {/* Store Profile Card */}
          <VendorStoreCard
            storeName={storeName}
            storeSlug={storeSlug}
            storeUrl={storeUrl}
            coverImage={storeImage}
            onEditStore={onOpenStoreSettings}
          />

          {/* Store Profile Completion Card */}
          <VendorProfileCompletion
            percentage={completionPercentage}
            items={checklistItems}
            onSelectAction={onSelectChecklistAction}
          />

          {/* Quick Actions Card */}
          <VendorQuickActions
            onAddProduct={onOpenAddProduct}
            onManageProducts={() => onNavigateTab("products")}
            onViewStore={() => {
              window.open(`/store/${storeSlug}`, "_blank");
            }}
            onStoreSettings={onOpenStoreSettings}
          />

          {/* Recent Activity Card */}
          <VendorRecentActivity
            onViewAll={() => onNavigateTab("orders")}
            onSelectActivity={(act) => {
              if (act.title.includes("order")) {
                const firstOrder = REFERENCE_ORDERS[0];
                if (firstOrder) {
                  onSelectOrder(firstOrder);
                }
              } else {
                onOpenStoreSettings();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
