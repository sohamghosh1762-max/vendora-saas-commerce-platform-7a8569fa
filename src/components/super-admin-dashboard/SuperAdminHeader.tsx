import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  LogOut,
  ShieldCheck,
  User,
  ExternalLink,
} from "lucide-react";
import { REFERENCE_ADMIN } from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

interface SuperAdminHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  adminEmail?: string;
}

export function SuperAdminHeader({
  onOpenMobileSidebar,
  onOpenSearch,
  onOpenNotifications,
  onOpenSettings,
  onSignOut,
  adminEmail,
}: SuperAdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine keyboard shortcut display (⌘ K on Mac, Ctrl K on others)
  const isMac = typeof window !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const shortcutHint = isMac ? "⌘ K" : "Ctrl K";

  return (
    <header className="sticky top-0 z-30 flex h-[65px] w-full items-center justify-between border-b border-[#E8EAF5] bg-[#FFFFFF] px-4 sm:px-6">
      {/* Left Area: Mobile Hamburger + Global Search */}
      <div className="flex flex-1 items-center gap-3">
        {/* Mobile Sidebar Toggle */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="grid size-9 place-items-center rounded-xl text-[#626E9D] hover:bg-[#F8F8FF] hover:text-[#101438] lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-xl">
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex w-full items-center justify-between rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] px-3.5 py-2 text-left text-xs text-[#626E9D] transition-colors hover:border-[#6538F5]/40 hover:bg-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6538F5]"
            aria-label="Search stores, vendors, products, orders, customers"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="size-4 shrink-0 text-[#626E9D]" />
              <span className="truncate">
                Search stores, vendors, products, orders, customers...
              </span>
            </div>

            <kbd className="hidden shrink-0 rounded-md border border-[#E8EAF5] bg-[#FFFFFF] px-2 py-0.5 text-[10px] font-bold text-[#626E9D] sm:inline-block shadow-2xs">
              {shortcutHint}
            </kbd>
          </button>
        </div>
      </div>

      {/* Right Area: Actions + Profile */}
      <div className="flex items-center gap-2 sm:gap-4 pl-3">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative grid size-9.5 place-items-center rounded-xl border border-[#E8EAF5] bg-[#FFFFFF] text-[#626E9D] transition hover:border-[#6538F5]/40 hover:bg-[#F8F8FF] hover:text-[#101438]"
          aria-label="Notifications (3 unread)"
        >
          <Bell className="size-4.5" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[#FF4D5A] ring-2 ring-white" />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="grid size-9.5 place-items-center rounded-xl border border-[#E8EAF5] bg-[#FFFFFF] text-[#626E9D] transition hover:border-[#6538F5]/40 hover:bg-[#F8F8FF] hover:text-[#101438]"
          aria-label="Platform Settings"
        >
          <Settings className="size-4.5" />
        </button>

        <div className="h-6 w-px bg-[#E8EAF5] hidden sm:block" />

        {/* Administrator Profile Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-[#F8F8FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6538F5]"
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            aria-label="Administrator profile menu"
          >
            {/* Circular Administrator Avatar */}
            <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-[#E8EAF5] shadow-xs">
              <img
                src={REFERENCE_ADMIN.avatar}
                alt={REFERENCE_ADMIN.name}
                className="size-full object-cover"
              />
            </div>

            {/* Admin Name & Role Label */}
            <div className="hidden text-left md:block">
              <div className="text-xs font-bold leading-tight text-[#101438]">
                {REFERENCE_ADMIN.name}
              </div>
              <div className="text-[11px] font-semibold text-[#6538F5]">{REFERENCE_ADMIN.role}</div>
            </div>

            <ChevronDown
              className={cn(
                "hidden size-4 text-[#626E9D] transition-transform duration-200 md:block",
                isProfileOpen ? "rotate-180" : "",
              )}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-2 shadow-card z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {/* Profile Card Header */}
              <div className="rounded-xl bg-[#F8F8FF] p-3 text-xs">
                <p className="font-bold text-[#101438]">{REFERENCE_ADMIN.name}</p>
                <p className="font-mono text-[11px] text-[#626E9D] truncate">
                  {adminEmail || REFERENCE_ADMIN.email}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-[#08C784]">
                  <span className="size-1.5 rounded-full bg-[#08C784] animate-pulse" />
                  <span>Platform Session Active</span>
                </div>
              </div>

              <div className="my-1 border-t border-[#E8EAF5]" />

              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#101438] hover:bg-[#F0EBFF] hover:text-[#6538F5] transition-colors"
                >
                  <User className="size-4 text-[#626E9D]" />
                  <span>Administrator Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#101438] hover:bg-[#F0EBFF] hover:text-[#6538F5] transition-colors"
                >
                  <ShieldCheck className="size-4 text-[#626E9D]" />
                  <span>IAM Governance Settings</span>
                </button>
              </div>

              <div className="my-1 border-t border-[#E8EAF5]" />

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  onSignOut();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#FF4D5A] hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-4" />
                <span>Sign Out of Super Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
