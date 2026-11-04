import { Link } from "@tanstack/react-router";
import {
  BarChart2,
  Boxes,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Home,
  Mail,
  Megaphone,
  Package,
  Paintbrush,
  Settings,
  Star,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import logoMark from "@/assets/logo-mark.png";
import storeUrbanNestCover from "@/assets/store-urban-nest.jpg";
import { cn } from "@/lib/utils";

export type SidebarTab =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "customers"
  | "analytics"
  | "settings"
  | "marketing"
  | "payouts"
  | "messages"
  | "reviews"
  | "appearance"
  | "integrations";

interface VendorSidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  unreadMessagesCount?: number;
  storeName?: string;
  storeSlug?: string;
  storeImage?: string;
  onCloseMobile?: () => void;
}

export function VendorSidebar({
  activeTab,
  onSelectTab,
  unreadMessagesCount = 5,
  storeName = "The Urban Nest",
  storeSlug = "the-urban-nest",
  storeImage = storeUrbanNestCover,
  onCloseMobile,
}: VendorSidebarProps) {
  const navItems: {
    id: SidebarTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "products", label: "Products", icon: Package },
    { id: "inventory", label: "Inventory", icon: Warehouse },
    { id: "orders", label: "Orders", icon: FileText },
    { id: "customers", label: "Customers", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "settings", label: "Store Settings", icon: Settings },
    { id: "marketing", label: "Marketing", icon: Megaphone },
    { id: "payouts", label: "Payouts", icon: CreditCard },
    { id: "messages", label: "Messages", icon: Mail, badge: unreadMessagesCount },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "appearance", label: "Appearance", icon: Paintbrush },
    { id: "integrations", label: "Integrations", icon: Boxes },
  ];

  return (
    <aside className="flex h-full w-[240px] flex-col justify-between border-r border-[#ECEAF5] bg-white px-3.5 py-4 shrink-0 select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-5">
          <Link
            to="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            aria-label="Vendora Platform Home"
          >
            <div className="relative size-9 shrink-0 overflow-hidden rounded-xl bg-[#6538F5] shadow-xs">
              <img src={logoMark} alt="Vendora Mark" className="size-full object-contain p-1" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[17px] font-extrabold tracking-tight text-[#110D27]">
                Vendora
              </span>
              <span className="text-[8.5px] font-bold tracking-wider text-[#908DA3] uppercase">
                SAAS COMMERCE PLATFORM
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-[#7A7F93] hover:bg-[#F4F2FC] lg:hidden"
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Sidebar Menu Items */}
        <nav className="mt-1 space-y-1" aria-label="Vendor sidebar navigation">
          {navItems.map((item) => {
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
                  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors text-left",
                  isActive
                    ? "bg-[#6538F5] text-white shadow-xs font-semibold"
                    : "text-[#6C7280] hover:bg-[#F7F6FE] hover:text-[#110D27]",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-[#7A7F93] group-hover:text-[#110D27]",
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "grid size-4.5 place-items-center rounded-full text-[10px] font-bold shrink-0",
                      isActive ? "bg-white text-[#6538F5]" : "bg-[#EF4444] text-white",
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

      {/* Bottom Store Card */}
      <div className="pt-4 border-t border-[#ECEAF5]">
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#ECEAF5] bg-white p-2 shadow-xs transition-shadow hover:shadow-sm">
          <img
            src={storeImage}
            alt={storeName}
            className="size-9 rounded-lg object-cover shrink-0 bg-[#F4F2FC]"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs font-bold text-[#110D27] leading-tight">{storeName}</h4>
            <Link
              to="/store/$id"
              params={{ id: storeSlug }}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6538F5] hover:underline leading-tight"
            >
              <span>View Store</span>
              <ExternalLink className="size-2.5" />
            </Link>
          </div>
          <ChevronRight className="size-4 shrink-0 text-[#A0A3BD]" />
        </div>
      </div>
    </aside>
  );
}
