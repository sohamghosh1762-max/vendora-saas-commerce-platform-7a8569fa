import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, ChevronDown, ExternalLink, Lock, Plus, RefreshCw, Store } from "lucide-react";
import { useVendorAuth } from "@/lib/vendor-context";
import { VendorSidebar, type SidebarTab } from "@/components/vendor-dashboard/VendorSidebar";
import { VendorHeader } from "@/components/vendor-dashboard/VendorHeader";
import { VendorKpiCards } from "@/components/vendor-dashboard/VendorKpiCards";
import { VendorSalesChart } from "@/components/vendor-dashboard/VendorSalesChart";
import { VendorStoreCard } from "@/components/vendor-dashboard/VendorStoreCard";
import { VendorProfileCompletion } from "@/components/vendor-dashboard/VendorProfileCompletion";
import { VendorQuickActions } from "@/components/vendor-dashboard/VendorQuickActions";
import { VendorRecentOrders } from "@/components/vendor-dashboard/VendorRecentOrders";
import { VendorTopProducts } from "@/components/vendor-dashboard/VendorTopProducts";
import { VendorRecentActivity } from "@/components/vendor-dashboard/VendorRecentActivity";
import {
  AddProductModal,
  OrderDetailModal,
  StoreSettingsModal,
} from "@/components/vendor-dashboard/VendorModals";
import { VendorNonDashboardView } from "@/components/vendor-dashboard/VendorNonDashboardView";
import {
  REFERENCE_CHECKLIST,
  REFERENCE_DATE_RANGE,
  REFERENCE_KPIS,
  REFERENCE_ORDERS,
  REFERENCE_STORE_NAME,
  REFERENCE_STORE_SLUG,
  REFERENCE_STORE_URL,
  REFERENCE_TOP_PRODUCTS,
  REFERENCE_VENDOR_NAME,
  REFERENCE_VENDOR_ROLE,
  avatarRohan,
  storeUrbanNestCover,
  type DashboardChecklistItem,
  type DashboardOrder,
  type DashboardProduct,
} from "@/lib/vendor-dashboard-data";
import { addVendorProduct, updateVendorStore } from "@/lib/vendor-api";

export const Route = createFileRoute("/vendor-dashboard")({
  component: VendorDashboardPage,
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — Vendora SaaS Commerce Platform" },
      {
        name: "description",
        content:
          "Manage your store, track sales, view orders, and customize your storefront on Vendora.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

export function VendorDashboardPage() {
  const { isAuthenticated, vendor, store, hydrated, logout, refreshStore } = useVendorAuth();
  const navigate = useNavigate();

  // Navigation and active views
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Date Range filter state
  const [dateRange, setDateRange] = useState<string>(REFERENCE_DATE_RANGE);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);

  // Store information
  const isRohanOrDemo =
    !vendor ||
    vendor.email.toLowerCase() === "rohan@theurbannest.com" ||
    vendor.fullName.toLowerCase().includes("rohan");

  const displayName = isRohanOrDemo ? REFERENCE_VENDOR_NAME : vendor.fullName;
  const displayRole = REFERENCE_VENDOR_ROLE;
  const storeName = isRohanOrDemo ? REFERENCE_STORE_NAME : store?.name || REFERENCE_STORE_NAME;
  const storeSlug = isRohanOrDemo ? REFERENCE_STORE_SLUG : store?.slug || REFERENCE_STORE_SLUG;
  const storeUrl = isRohanOrDemo ? REFERENCE_STORE_URL : `vendora.com/stores/${storeSlug}`;
  const storeImage = storeUrbanNestCover;

  // Checklist items
  const [checklistItems, setChecklistItems] =
    useState<DashboardChecklistItem[]>(REFERENCE_CHECKLIST);

  // Calculate completion percentage: 4 out of 5 = 80% (or reference 80%)
  const completedCount = checklistItems.filter((i) => i.completed).length;
  const completionPercentage = isRohanOrDemo
    ? 80
    : Math.round((completedCount / checklistItems.length) * 100);

  const handleCreateProduct = (data: {
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    description: string;
    badge?: string;
  }) => {
    if (store) {
      addVendorProduct({
        name: data.name,
        storeId: store.id,
        storeName: store.name,
        category: data.category,
        price: data.price,
        originalPrice: data.originalPrice,
        rating: 5.0,
        reviews: 0,
        badge: data.badge,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        description: data.description,
        featured: true,
      });
      refreshStore();
    }
  };

  const handleSaveStoreSettings = async (data: {
    storeName: string;
    tagline: string;
    returnPolicy: string;
  }) => {
    if (store) {
      await updateVendorStore(store.id, {
        name: data.storeName,
        tagline: data.tagline,
        returnPolicy: data.returnPolicy,
      });
      refreshStore();
    }
  };

  // Checklist action handler
  const handleChecklistAction = (actionKey: string) => {
    if (actionKey === "products") {
      setIsAddProductOpen(true);
    } else {
      setIsStoreSettingsOpen(true);
    }
  };

  // If still checking hydration
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F5FC]">
        <div className="flex items-center gap-3 text-[#7A7F93]">
          <div className="size-5 animate-spin rounded-full border-2 border-[#6538F5] border-t-transparent" />
          <span className="text-xs font-semibold">Loading Vendor Portal...</span>
        </div>
      </div>
    );
  }

  // Protected route unauthorized state
  if (!isAuthenticated || !vendor) {
    return (
      <section className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <div className="grid size-16 place-items-center rounded-3xl bg-[#F0EBFE] text-[#6538F5] shadow-xs">
          <Lock className="size-8" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-[#110D27]">
          Vendor Portal Authentication Required
        </h1>
        <p className="mt-2 text-xs text-[#7A7F93] leading-relaxed max-w-sm">
          You must be signed in with an authorized merchant account to access this dashboard.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/signin"
            search={{ role: "vendor" }}
            className="rounded-xl bg-[#6538F5] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#5228D9]"
          >
            Sign In with Vendor Account
          </Link>
          <Link
            to="/become-a-vendor"
            className="rounded-xl border border-[#ECEAF5] bg-white px-5 py-2.5 text-xs font-semibold text-[#110D27] hover:bg-[#F9F8FD]"
          >
            Register Store
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F6F5FC] text-[#110D27] font-sans antialiased overflow-x-hidden">
      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden lg:block shrink-0">
        <div className="sticky top-0 h-screen">
          <VendorSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            unreadMessagesCount={5}
            storeName={storeName}
            storeSlug={storeSlug}
            storeImage={storeImage}
          />
        </div>
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in-50">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-[240px] h-full shadow-2xl">
            <VendorSidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              unreadMessagesCount={5}
              storeName={storeName}
              storeSlug={storeSlug}
              storeImage={storeImage}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Application Area (Header + Content) */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Horizontal Top Header */}
        <VendorHeader
          vendorName={displayName}
          vendorRole={displayRole}
          vendorAvatar={avatarRohan}
          unreadNotificationsCount={3}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onLogout={() => {
            logout();
            navigate({ to: "/signin", search: { role: "vendor" } });
          }}
          onOpenSettings={() => setIsStoreSettingsOpen(true)}
          onSelectSearchResult={(type, id) => {
            if (type === "order") {
              const ord = REFERENCE_ORDERS.find((o) => o.id === id);
              if (ord) setSelectedOrder(ord);
            }
          }}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1536px] w-full mx-auto">
          {activeTab === "dashboard" ? (
            <div className="space-y-5">
              {/* Welcome Section & Date Range Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-[26px] font-black tracking-tight text-[#110D27] leading-tight">
                    Welcome back, {displayName.split(" ")[0]}! 👋
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
                onSelectMetric={(id) => {
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
                      onViewAll={() => setActiveTab("orders")}
                      onSelectOrder={(ord) => setSelectedOrder(ord)}
                    />
                    <VendorTopProducts
                      onViewAll={() => setActiveTab("products")}
                      onSelectProduct={() => setIsAddProductOpen(true)}
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
                    onEditStore={() => setIsStoreSettingsOpen(true)}
                  />

                  {/* Store Profile Completion Card */}
                  <VendorProfileCompletion
                    percentage={completionPercentage}
                    items={checklistItems}
                    onSelectAction={handleChecklistAction}
                  />

                  {/* Quick Actions Card */}
                  <VendorQuickActions
                    onAddProduct={() => setIsAddProductOpen(true)}
                    onManageProducts={() => setActiveTab("products")}
                    onViewStore={() => {
                      window.open(`/store/${storeSlug}`, "_blank");
                    }}
                    onStoreSettings={() => setIsStoreSettingsOpen(true)}
                  />

                  {/* Recent Activity Card */}
                  <VendorRecentActivity
                    onViewAll={() => setActiveTab("orders")}
                    onSelectActivity={(act) => {
                      if (act.title.includes("order")) {
                        setSelectedOrder(REFERENCE_ORDERS[0]);
                      } else {
                        setIsStoreSettingsOpen(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <VendorNonDashboardView
              activeTab={activeTab}
              onBackToDashboard={() => setActiveTab("dashboard")}
              onAddProductClick={() => setIsAddProductOpen(true)}
              storeName={storeName}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleCreateProduct}
      />

      <StoreSettingsModal
        isOpen={isStoreSettingsOpen}
        onClose={() => setIsStoreSettingsOpen(false)}
        storeName={storeName}
        tagline="Your Storefront"
        onSave={handleSaveStoreSettings}
      />

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
