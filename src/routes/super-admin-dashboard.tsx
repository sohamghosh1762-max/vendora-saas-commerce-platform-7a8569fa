import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ArrowRight,
  Lock,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Store,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Megaphone,
  Tag,
  FileText,
  Settings,
  Shield,
  Plug,
  Palette,
  Bell,
  ScrollText,
} from "lucide-react";
import { useSuperAdminAuth } from "@/lib/super-admin-context";
import { useVendorAuth } from "@/lib/vendor-context";
import { getSuperAdminDashboardData } from "@/lib/super-admin-api";
import type { SuperAdminDashboardData } from "@/lib/super-admin-types";
import {
  SuperAdminSidebar,
  type AdminSidebarTab,
} from "@/components/super-admin-dashboard/SuperAdminSidebar";
import { SuperAdminHeader } from "@/components/super-admin-dashboard/SuperAdminHeader";
import { SuperAdminWelcome } from "@/components/super-admin-dashboard/SuperAdminWelcome";
import { SuperAdminKpiCards } from "@/components/super-admin-dashboard/SuperAdminKpiCards";
import { SuperAdminRevenueChart } from "@/components/super-admin-dashboard/SuperAdminRevenueChart";
import { SuperAdminGrowthChart } from "@/components/super-admin-dashboard/SuperAdminGrowthChart";
import { SuperAdminRecentStores } from "@/components/super-admin-dashboard/SuperAdminRecentStores";
import { SuperAdminRecentOrders } from "@/components/super-admin-dashboard/SuperAdminRecentOrders";
import { SuperAdminHealthPanel } from "@/components/super-admin-dashboard/SuperAdminHealthPanel";
import { SuperAdminTopStores } from "@/components/super-admin-dashboard/SuperAdminTopStores";
import { SuperAdminTopProducts } from "@/components/super-admin-dashboard/SuperAdminTopProducts";
import { SuperAdminQuickActions } from "@/components/super-admin-dashboard/SuperAdminQuickActions";
import { SuperAdminStoresView } from "@/components/super-admin-dashboard/SuperAdminStoresView";
import {
  SuperAdminSearchModal,
  SuperAdminNotificationsModal,
  SuperAdminAddStoreModal,
  SuperAdminApproveVendorsModal,
  SuperAdminDocModal,
} from "@/components/super-admin-dashboard/SuperAdminModals";
import {
  REFERENCE_ADMIN,
  REFERENCE_KPIS,
  type QuickActionItem,
} from "@/lib/super-admin-dashboard-data";

export interface SuperAdminDashboardSearch {
  tab?: AdminSidebarTab;
}

export const Route = createFileRoute("/super-admin-dashboard")({
  validateSearch: (search: Record<string, unknown>): SuperAdminDashboardSearch => {
    const tab = search["tab"] as AdminSidebarTab | undefined;
    return { tab };
  },
  component: SuperAdminDashboardPage,
  head: () => ({
    meta: [
      { title: "Super Admin Dashboard — Vendora SaaS Commerce Platform" },
      {
        name: "description",
        content:
          "Platform governance, store oversight, security auditing, and marketplace management.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

export function SuperAdminDashboardPage() {
  const { admin, isAuthenticated: isAdmin, isLoading: isAuthLoading, logout } = useSuperAdminAuth();
  const { isAuthenticated: isVendor, vendor, logout: logoutVendor } = useVendorAuth();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  // Navigation and active views
  const [activeTab, setActiveTab] = useState<AdminSidebarTab>(searchParams.tab || "dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (searchParams.tab && searchParams.tab !== activeTab) {
      setActiveTab(searchParams.tab);
    }
  }, [searchParams.tab, activeTab]);

  // Date Range state
  const [dateRange, setDateRange] = useState<string>(REFERENCE_ADMIN.dateRange);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isApproveVendorsOpen, setIsApproveVendorsOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Server data state
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardData | null>(null);

  // Direct navigation / unauthenticated redirect
  useEffect(() => {
    if (!isAuthLoading && !isAdmin && !isVendor) {
      navigate({ to: "/signin", search: { role: "super-admin" } });
    }
  }, [isAuthLoading, isAdmin, isVendor, navigate]);

  // Fetch verified administrative data from server function
  const refreshDashboardData = useCallback(() => {
    if (isAdmin) {
      getSuperAdminDashboardData()
        .then((res) => {
          if (res.success && res.data) {
            setDashboardData(res.data);
          }
        })
        .catch(() => {
          // Fallback seamlessly to deterministic reference data
        });
    }
  }, [isAdmin]);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  // Dynamically update KPI card metrics when dashboardData is loaded
  const dynamicKpis = useMemo(() => {
    if (!dashboardData?.metrics) return REFERENCE_KPIS;
    return REFERENCE_KPIS.map((kpi) => {
      if (kpi.id === "stores") {
        return {
          ...kpi,
          value: dashboardData.metrics.totalStores.toString(),
          rawValue: dashboardData.metrics.totalStores,
        };
      }
      return kpi;
    });
  }, [dashboardData]);

  // Global Keyboard Shortcut: ⌘ K or Ctrl K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle Logout
  const handleSignOut = async () => {
    await logout();
    navigate({ to: "/signin", search: { role: "super-admin" } });
  };

  // Quick Action Handler
  const handleTriggerQuickAction = (actionId: QuickActionItem["id"]) => {
    switch (actionId) {
      case "add-store":
        setActiveTab("stores");
        setIsAddStoreOpen(true);
        break;
      case "approve-vendors":
        setIsApproveVendorsOpen(true);
        break;
      case "manage-products":
        setActiveTab("products");
        break;
      case "view-reports":
        setActiveTab("reports");
        break;
    }
  };

  // Export success handler
  const handleExportSuccess = () => {
    setExportNotice("Executive report downloaded successfully.");
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Case 1: Loading authentication status
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8FF] text-[#101438]">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-[#6538F5]" />
          <p className="mt-4 text-xs font-semibold tracking-wide text-[#626E9D]">
            Verifying Platform Administrative Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Vendor Account Detected (403 Forbidden Separation Guard)
  if (isVendor && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F5FC] px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-destructive/20 bg-card p-8 shadow-card text-center sm:p-10">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>

          <span className="mt-4 inline-block rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-bold text-destructive">
            403 Forbidden — Access Denied
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Administrative Access Restricted
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You are currently authenticated as a{" "}
            <strong className="text-foreground">Vendor Merchant</strong> (
            <code className="font-mono text-xs font-semibold text-primary">{vendor?.email}</code>).
            Vendor accounts do not possess platform governance privileges.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              to="/vendor-dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-dark transition"
            >
              <span>Return to Vendor Dashboard</span>
              <ArrowRight className="size-4" />
            </Link>

            <button
              type="button"
              onClick={() => {
                logoutVendor();
                navigate({ to: "/signin", search: { role: "super-admin" } });
              }}
              className="w-full rounded-full border border-border bg-background py-3 text-sm font-semibold text-foreground hover:bg-muted transition"
            >
              Sign Out & Switch to Super Admin Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Unauthenticated fallback view
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F8FF] px-4 py-12 text-[#101438]">
        <div className="w-full max-w-md text-center">
          <Lock className="mx-auto size-12 text-[#6538F5]" />
          <h2 className="mt-4 text-2xl font-bold">Authentication Required</h2>
          <p className="mt-2 text-sm text-[#626E9D]">
            Please sign in with authorized Super Admin credentials to access this dashboard.
          </p>
          <Link
            to="/signin"
            search={{ role: "super-admin" }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#6538F5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4B20D8] transition"
          >
            <span>Go to Super Admin Sign In</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Case 4: Authenticated Super Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F8F8FF] text-[#101438] antialiased">
      {/* Fixed Vertical Left Sidebar (~255px wide) */}
      <SuperAdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenDocModal={() => setIsDocModalOpen(true)}
      />

      {/* Main Container (Shifted right by 255px on desktop) */}
      <div className="flex min-h-screen flex-col lg:pl-[255px]">
        {/* Horizontal Top Header (~65px tall) */}
        <SuperAdminHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSettings={() => setActiveTab("settings")}
          onSignOut={handleSignOut}
          adminEmail={admin?.email}
        />

        {/* Workspace Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-7 max-w-[1536px] w-full mx-auto space-y-6">
          {/* Export Toast Banner */}
          {exportNotice && (
            <div
              role="status"
              className="rounded-xl border border-[#08C784]/30 bg-[#EBFBF5] p-3 text-xs font-bold text-[#08C784] shadow-xs flex items-center justify-between"
            >
              <span>{exportNotice}</span>
              <button
                type="button"
                onClick={() => setExportNotice(null)}
                className="text-[#08C784] hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === "stores" ? (
            /* Connected Super Admin Stores Management View */
            <SuperAdminStoresView
              onReturnToDashboard={() => setActiveTab("dashboard")}
              onStoreMutated={refreshDashboardData}
            />
          ) : activeTab === "dashboard" ? (
            <>
              {/* 1. Welcome Section */}
              <SuperAdminWelcome
                dateRange={dateRange}
                onChangeDateRange={setDateRange}
                onExportSuccess={handleExportSuccess}
              />

              {/* 2. Five KPI Cards Row */}
              <SuperAdminKpiCards
                metrics={dynamicKpis}
                onSelectKpi={(id) => {
                  if (id === "stores") setActiveTab("stores");
                  else if (id === "vendors") setActiveTab("vendors");
                  else if (id === "products") setActiveTab("products");
                  else if (id === "orders") setActiveTab("orders");
                  else if (id === "revenue") setActiveTab("analytics");
                }}
              />

              {/* 3. Charts Row: Revenue Overview (70%) + Platform Growth (30%) */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-10 items-stretch">
                <div className="lg:col-span-7">
                  <SuperAdminRevenueChart />
                </div>
                <div className="lg:col-span-3">
                  <SuperAdminGrowthChart />
                </div>
              </div>

              {/* 4. Middle Row: Recent Stores (42%) + Recent Orders (39%) + Platform Health (19%) */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-5">
                  <SuperAdminRecentStores
                    onViewAll={() => setActiveTab("stores")}
                    onSelectStore={() => setActiveTab("stores")}
                  />
                </div>
                <div className="lg:col-span-4">
                  <SuperAdminRecentOrders
                    onViewAll={() => setActiveTab("orders")}
                    onSelectOrder={() => setActiveTab("orders")}
                  />
                </div>
                <div className="lg:col-span-3">
                  <SuperAdminHealthPanel />
                </div>
              </div>

              {/* 5. Bottom Row: Top Performing Stores + Top Selling Products + Quick Actions */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-5">
                  <SuperAdminTopStores
                    onViewAll={() => setActiveTab("stores")}
                    onSelectStore={() => setActiveTab("stores")}
                  />
                </div>
                <div className="lg:col-span-4">
                  <SuperAdminTopProducts
                    onViewAll={() => setActiveTab("products")}
                    onSelectProduct={() => setActiveTab("products")}
                  />
                </div>
                <div className="lg:col-span-3">
                  <SuperAdminQuickActions onTriggerAction={handleTriggerQuickAction} />
                </div>
              </div>
            </>
          ) : (
            /* Sub-View for Selected Administrative Area */
            <div className="rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-8 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF5]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6538F5] hover:text-[#4B20D8]"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Return to Overview</span>
                  </button>
                  <span className="text-[#E8EAF5]">/</span>
                  <h2 className="text-lg font-extrabold capitalize text-[#101438]">
                    {activeTab.replace("-", " ")} Management
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className="rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#4B20D8]"
                >
                  Dashboard View
                </button>
              </div>

              <div className="mt-8 text-center py-12">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#F0EBFF] text-[#6538F5]">
                  {activeTab === "vendors" && <Users className="size-7" />}
                  {activeTab === "products" && <Package className="size-7" />}
                  {activeTab === "orders" && <ShoppingCart className="size-7" />}
                  {activeTab === "analytics" && <TrendingUp className="size-7" />}
                  {activeTab === "payouts" && <CreditCard className="size-7" />}
                  {activeTab === "marketing" && <Megaphone className="size-7" />}
                  {activeTab === "coupons" && <Tag className="size-7" />}
                  {activeTab === "reports" && <FileText className="size-7" />}
                  {activeTab === "settings" && <Settings className="size-7" />}
                  {activeTab === "user-management" && <Shield className="size-7" />}
                  {activeTab === "integrations" && <Plug className="size-7" />}
                  {activeTab === "appearance" && <Palette className="size-7" />}
                  {activeTab === "notifications" && <Bell className="size-7" />}
                  {activeTab === "audit-logs" && <ScrollText className="size-7" />}
                </div>

                <h3 className="mt-4 text-base font-bold text-[#101438] capitalize">
                  {activeTab.replace("-", " ")} Console
                </h3>
                <p className="mt-1 text-xs text-[#626E9D] max-w-md mx-auto leading-relaxed">
                  Dedicated platform administrative controls and live telemetry for {activeTab}. All
                  operations are authenticated under Super Admin authority.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="rounded-xl border border-[#E8EAF5] px-4 py-2 text-xs font-bold text-[#101438] hover:bg-[#F8F8FF]"
                  >
                    Back to Executive Dashboard
                  </button>
                  {activeTab === "vendors" && (
                    <button
                      type="button"
                      onClick={() => setIsApproveVendorsOpen(true)}
                      className="rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white hover:bg-[#4B20D8]"
                    >
                      Pending Approvals
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SuperAdminSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectItem={(_type, _name) => {
          setIsSearchOpen(false);
        }}
      />

      <SuperAdminNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <SuperAdminAddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreAdded={(_name) => {
          setExportNotice("New merchant store successfully created.");
          refreshDashboardData();
          setTimeout(() => setExportNotice(null), 4000);
        }}
      />

      <SuperAdminApproveVendorsModal
        isOpen={isApproveVendorsOpen}
        onClose={() => setIsApproveVendorsOpen(false)}
      />

      <SuperAdminDocModal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} />
    </div>
  );
}
