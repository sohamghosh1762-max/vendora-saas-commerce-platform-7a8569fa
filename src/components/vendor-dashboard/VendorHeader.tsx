import { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Store,
  User,
  X,
} from "lucide-react";
import avatarRohan from "@/assets/avatar-rohan.jpg";
import {
  REFERENCE_NOTIFICATIONS,
  REFERENCE_ORDERS,
  REFERENCE_TOP_PRODUCTS,
} from "@/lib/vendor-dashboard-data";

interface VendorHeaderProps {
  vendorName?: string;
  vendorRole?: string;
  vendorAvatar?: string;
  unreadNotificationsCount?: number;
  onOpenMobileMenu?: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onSelectSearchResult?: (type: "order" | "product", id: string) => void;
}

export function VendorHeader({
  vendorName = "Rohan Mehta",
  vendorRole = "Store Owner",
  vendorAvatar = avatarRohan,
  unreadNotificationsCount = 3,
  onOpenMobileMenu,
  onLogout,
  onOpenSettings,
  onSelectSearchResult,
}: VendorHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = trimmedQuery
    ? REFERENCE_ORDERS.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(trimmedQuery) ||
          o.customerName.toLowerCase().includes(trimmedQuery),
      )
    : [];

  const filteredProducts = trimmedQuery
    ? REFERENCE_TOP_PRODUCTS.filter((p) => p.name.toLowerCase().includes(trimmedQuery))
    : [];

  const hasSearchResults = filteredOrders.length > 0 || filteredProducts.length > 0;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#ECEAF5] bg-white px-4 sm:px-6 md:px-8">
      {/* Left Area: Mobile menu trigger + Search */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="rounded-xl p-2 text-[#6C7280] hover:bg-[#F4F2FC] hover:text-[#110D27] lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        {/* Search Bar */}
        <div ref={searchContainerRef} className="relative w-72 sm:w-80 md:w-96">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 size-4 text-[#9AA0B2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search orders, products, customers..."
              className="h-10 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] py-2 pl-10 pr-8 text-xs text-[#110D27] placeholder:text-[#9AA0B2] transition focus:border-[#6538F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6538F5]/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-[#9AA0B2] hover:text-[#110D27]"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && trimmedQuery.length > 0 && (
            <div className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-2xl border border-[#ECEAF5] bg-white p-2 shadow-lg animate-in fade-in-50 zoom-in-95">
              {hasSearchResults ? (
                <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
                  {filteredProducts.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9AA0B2]">
                        Products
                      </div>
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            if (onSelectSearchResult) {
                              onSelectSearchResult("product", p.id);
                            }
                            setIsSearchOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-[#F7F6FE]"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="size-7 rounded-md object-cover"
                          />
                          <span className="flex-1 font-semibold text-[#110D27] truncate">
                            {p.name}
                          </span>
                          <span className="font-bold text-[#6538F5]">{p.formattedRevenue}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredOrders.length > 0 && (
                    <div className="border-t border-[#ECEAF5] pt-1">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9AA0B2]">
                        Orders
                      </div>
                      {filteredOrders.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            if (onSelectSearchResult) {
                              onSelectSearchResult("order", o.id);
                            }
                            setIsSearchOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition hover:bg-[#F7F6FE]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#110D27]">{o.orderNumber}</span>
                            <span className="text-[#7A7F93]">{o.customerName}</span>
                          </div>
                          <span className="font-bold text-[#110D27]">{o.formattedAmount}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-[#7A7F93]">
                  No matching orders, products, or customers found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Notifications, Help, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen((v) => !v)}
            aria-label="Notifications"
            className="relative flex size-9 items-center justify-center rounded-xl text-[#5B6275] transition hover:bg-[#F7F6FE] hover:text-[#110D27]"
          >
            <Bell className="size-4.5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 grid size-3.5 place-items-center rounded-full bg-[#EF4444] text-[9px] font-extrabold text-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-[#ECEAF5] bg-white p-3 shadow-xl animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-2.5 px-1">
                <span className="text-xs font-bold text-[#110D27]">Notifications</span>
                <span className="rounded-full bg-[#F0EBFE] px-2 py-0.5 text-[10px] font-bold text-[#6538F5]">
                  {unreadNotificationsCount} New
                </span>
              </div>
              <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto">
                {REFERENCE_NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-2.5 rounded-xl p-2 transition hover:bg-[#F9F8FD]"
                  >
                    <div className="mt-0.5 size-2 rounded-full bg-[#6538F5] shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#110D27]">{n.title}</p>
                      <p className="text-[11px] text-[#7A7F93]">{n.message}</p>
                      <span className="text-[10px] text-[#9AA0B2]">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Icon */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsHelpOpen((v) => !v)}
            aria-label="Merchant Help & Documentation"
            className="flex size-9 items-center justify-center rounded-xl text-[#5B6275] transition hover:bg-[#F7F6FE] hover:text-[#110D27]"
          >
            <HelpCircle className="size-4.5" />
          </button>

          {/* Help Modal/Dropdown */}
          {isHelpOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[#ECEAF5] bg-white p-3.5 shadow-xl animate-in fade-in-50 zoom-in-95">
              <h4 className="text-xs font-bold text-[#110D27]">Merchant Help Center</h4>
              <p className="mt-1 text-[11px] text-[#7A7F93]">
                Need assistance managing your storefront or understanding analytics?
              </p>
              <div className="mt-3 space-y-1.5 text-xs font-medium text-[#6538F5]">
                <a href="/help-center" className="block rounded-lg p-1.5 hover:bg-[#F7F6FE]">
                  📖 Vendor Knowledge Base
                </a>
                <a href="/seller-resources" className="block rounded-lg p-1.5 hover:bg-[#F7F6FE]">
                  📦 Shipping & Fulfillment Guide
                </a>
                <a href="/contact-us" className="block rounded-lg p-1.5 hover:bg-[#F7F6FE]">
                  💬 Contact Merchant Support
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Vendor Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl p-1 transition hover:bg-[#F7F6FE]"
            aria-expanded={isProfileOpen}
            aria-label="Vendor profile menu"
          >
            <img
              src={vendorAvatar}
              alt={vendorName}
              className="size-8.5 rounded-full object-cover border border-[#ECEAF5] shadow-xs"
            />
            <div className="hidden text-left sm:block leading-none">
              <span className="block text-xs font-bold text-[#110D27]">{vendorName}</span>
              <span className="mt-0.5 block text-[10px] font-medium text-[#8C93A4]">
                {vendorRole}
              </span>
            </div>
            <ChevronDown className="size-3.5 text-[#8C93A4]" />
          </button>

          {/* Profile Menu Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-[#ECEAF5] bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
              <div className="border-b border-[#ECEAF5] px-3 py-2">
                <p className="text-xs font-bold text-[#110D27]">{vendorName}</p>
                <p className="text-[11px] text-[#7A7F93]">{vendorRole}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#110D27] transition hover:bg-[#F7F6FE]"
                >
                  <Store className="size-3.5 text-[#6538F5]" />
                  <span>Store Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#110D27] transition hover:bg-[#F7F6FE]"
                >
                  <User className="size-3.5 text-[#6538F5]" />
                  <span>Merchant Profile</span>
                </button>
              </div>

              {onLogout && (
                <div className="border-t border-[#ECEAF5] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#EF4444] transition hover:bg-[#FEE2E2]/40"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
