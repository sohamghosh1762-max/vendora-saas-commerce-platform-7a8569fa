import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  ShoppingCart,
  UserCheck,
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
  HelpCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSidebarTab =
  | "dashboard"
  | "stores"
  | "vendors"
  | "products"
  | "orders"
  | "customers"
  | "analytics"
  | "payouts"
  | "marketing"
  | "coupons"
  | "reports"
  | "settings"
  | "user-management"
  | "integrations"
  | "appearance"
  | "notifications"
  | "audit-logs";

interface SuperAdminSidebarProps {
  activeTab: AdminSidebarTab;
  onSelectTab: (tab: AdminSidebarTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenDocModal?: () => void;
}

interface NavItemConfig {
  id: AdminSidebarTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "stores", label: "Stores", icon: Store },
  { id: "vendors", label: "Vendors", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: UserCheck },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "payouts", label: "Payouts", icon: CreditCard },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "coupons", label: "Coupons & Deals", icon: Tag },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Platform Settings", icon: Settings },
  { id: "user-management", label: "User Management", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 3 },
  { id: "audit-logs", label: "Audit Logs", icon: ScrollText },
];

export function SuperAdminSidebar({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  onOpenDocModal,
}: SuperAdminSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Container: Fixed 255px on Desktop */}
      <aside
        aria-label="Super Admin Navigation Sidebar"
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-[255px] flex-col justify-between border-r border-[#E8EAF5] bg-[#FFFFFF] transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Top: Brand Section & Navigation List */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5 custom-scrollbar">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              {/* Rounded-square violet logo containing white 'V' */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#6538F5] text-white shadow-sm">
                <span className="font-extrabold text-xl leading-none tracking-tight">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold leading-none tracking-tight text-[#101438]">
                  Vendora
                </span>
                <span className="mt-1 text-[9px] font-bold tracking-widest text-[#626E9D] uppercase">
                  SAAS COMMERCE PLATFORM
                </span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="grid size-8 place-items-center rounded-lg text-[#626E9D] hover:bg-[#F0EBFF] hover:text-[#6538F5] lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          <div className="my-2 border-t border-[#E8EAF5]" />

          {/* Navigation Items (17 Items in Exact Order) */}
          <nav className="mt-2 space-y-1" aria-label="Administrative Areas">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150",
                    isActive
                      ? "bg-[#6538F5] text-white shadow-sm"
                      : "text-[#626E9D] hover:bg-[#F8F8FF] hover:text-[#101438]",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        isActive ? "text-white" : "text-[#626E9D] group-hover:text-[#6538F5]",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {/* Badge (e.g. Notifications: 3) */}
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "grid size-5 place-items-center rounded-full text-[10px] font-bold",
                        isActive ? "bg-white text-[#6538F5]" : "bg-[#FF4D5A] text-white shadow-xs",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Need Help? Card */}
        <div className="border-t border-[#E8EAF5] p-4">
          <div className="flex items-center justify-between rounded-2xl border border-[#E8EAF5] bg-[#F8F8FF] p-3 transition-colors hover:border-[#6538F5]/30">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#F0EBFF] text-[#6538F5]">
                <HelpCircle className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#101438]">Need Help?</span>
                <span className="text-[11px] text-[#626E9D]">View documentation</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenDocModal}
              className="rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-[#6538F5] shadow-xs border border-[#E8EAF5] hover:bg-[#6538F5] hover:text-white transition-all"
            >
              Docs
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
