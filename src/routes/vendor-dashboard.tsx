import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { useVendorAuth } from "@/lib/vendor-context";
import { VendorSidebar, type SidebarTab } from "@/components/vendor-dashboard/VendorSidebar";
import { VendorHeader } from "@/components/vendor-dashboard/VendorHeader";
import { VendorDashboardOverview } from "@/components/vendor-dashboard/VendorDashboardOverview";
import {
  AddProductModal,
  OrderDetailModal,
  StoreSettingsModal,
} from "@/components/vendor-dashboard/VendorModals";
import { VendorNonDashboardView } from "@/components/vendor-dashboard/VendorNonDashboardView";
import {
  REFERENCE_CHECKLIST,
  REFERENCE_ORDERS,
  REFERENCE_STORE_NAME,
  REFERENCE_STORE_SLUG,
  REFERENCE_STORE_URL,
  REFERENCE_VENDOR_NAME,
  REFERENCE_VENDOR_ROLE,
  avatarRohan,
  storeUrbanNestCover,
  type DashboardChecklistItem,
  type DashboardOrder,
} from "@/lib/vendor-dashboard-data";
import { addVendorProduct, updateVendorStore } from "@/lib/vendor-api";

export const VALID_SIDEBAR_TABS: readonly SidebarTab[] = [
  "dashboard",
  "products",
  "orders",
  "customers",
  "analytics",
  "settings",
  "marketing",
  "payouts",
  "messages",
  "reviews",
  "appearance",
  "integrations",
] as const;

export function isValidSidebarTab(tab: unknown): tab is SidebarTab {
  return typeof tab === "string" && (VALID_SIDEBAR_TABS as readonly string[]).includes(tab);
}

export interface VendorDashboardSearch {
  tab?: SidebarTab;
}

export const Route = createFileRoute("/vendor-dashboard")({
  validateSearch: (search: Record<string, unknown>): VendorDashboardSearch => {
    const tab = search.tab;
    if (isValidSidebarTab(tab)) {
      return { tab };
    }
    return {};
  },
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
  const search = useSearch({ strict: false }) as VendorDashboardSearch | undefined;

  // Active tab synchronized with URL query parameter (?tab=...)
  // Defaults to 'dashboard' (Overview) if tab parameter is missing or invalid
  const rawTab = search?.tab;
  const activeTab: SidebarTab = isValidSidebarTab(rawTab) ? rawTab : "dashboard";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: SidebarTab) => {
    if (activeTab === tab && rawTab === tab) {
      return;
    }
    navigate({
      to: "/vendor-dashboard",
      search: { tab },
    });
  };

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
  const storeName = store?.name || REFERENCE_STORE_NAME;
  const storeSlug = isRohanOrDemo ? REFERENCE_STORE_SLUG : store?.slug || REFERENCE_STORE_SLUG;
  const storeUrl = isRohanOrDemo ? REFERENCE_STORE_URL : `vendora.com/stores/${storeSlug}`;
  const storeImage = store?.cover || storeUrbanNestCover;
  const storeLogo = store?.logoUrl;

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
    originalPrice?: number;
    stock?: number;
    status?: "active" | "draft" | "out_of_stock";
    description?: string;
    badge?: string;
    image?: string;
  }) => {
    const targetStoreId = store?.id || storeSlug;
    const targetStoreName = store?.name || storeName;

    addVendorProduct({
      name: data.name,
      storeId: targetStoreId,
      storeName: targetStoreName,
      category: data.category,
      price: data.price,
      originalPrice: data.originalPrice ?? data.price,
      stock: data.stock !== undefined ? data.stock : 25,
      status: data.status || "active",
      rating: 5.0,
      reviews: 0,
      ...(data.badge ? { badge: data.badge } : {}),
      image:
        data.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      description: data.description || "Handcrafted artisan product with premium materials.",
      featured: true,
    });
    refreshStore();
  };

  const handleSaveStoreSettings = async (data: Partial<NonNullable<typeof store>>) => {
    if (!store) return false;
    const updated = await updateVendorStore(store.id, data);
    if (!updated) return false;
    refreshStore();
    return true;
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
            onSelectTab={handleTabChange}
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
              onSelectTab={(tab) => {
                handleTabChange(tab);
                setIsMobileMenuOpen(false);
              }}
              unreadMessagesCount={5}
              storeName={storeName}
              storeSlug={storeSlug}
              storeImage={storeImage}
              storeLogo={storeLogo}
              storeTagline={store?.tagline}
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
            <VendorDashboardOverview
              displayName={displayName}
              storeName={storeName}
              storeSlug={storeSlug}
              storeUrl={storeUrl}
              storeImage={storeImage}
              completionPercentage={completionPercentage}
              checklistItems={checklistItems}
              onSelectChecklistAction={handleChecklistAction}
              onNavigateTab={handleTabChange}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onOpenStoreSettings={() => setIsStoreSettingsOpen(true)}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
            />
          ) : (
            <VendorNonDashboardView
              activeTab={activeTab}
              onBackToDashboard={() => handleTabChange("dashboard")}
              onAddProductClick={() => setIsAddProductOpen(true)}
              storeName={storeName}
              storeId={storeSlug}
              onProductsChange={() => refreshStore()}
              store={store}
              onEditStore={() => setIsStoreSettingsOpen(true)}
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
        store={store}
        onSave={handleSaveStoreSettings}
      />

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
