import { Search, Plus, RotateCcw, Filter, ArrowUpDown } from "lucide-react";
import type { SuperAdminStoresSummary, StoreStatus } from "@/lib/super-admin-types";

interface SuperAdminStoresToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: "All" | StoreStatus;
  onStatusChange: (status: "All" | StoreStatus) => void;
  category: string;
  onCategoryChange: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  summary: SuperAdminStoresSummary;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenAddModal: () => void;
}

const CATEGORIES = [
  { value: "All", label: "All Categories" },
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "home-living", label: "Home & Living" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "books", label: "Books & Stationery" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name", label: "Store Name (A-Z)" },
  { value: "revenue", label: "Highest Revenue" },
  { value: "products", label: "Most Products" },
  { value: "orders", label: "Most Orders" },
];

export function SuperAdminStoresToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  sortBy,
  onSortChange,
  summary,
  onRefresh,
  isRefreshing,
  onOpenAddModal,
}: SuperAdminStoresToolbarProps) {
  const statusTabs: Array<{ id: "All" | StoreStatus; label: string; count: number }> = [
    { id: "All", label: "All", count: summary.total },
    { id: "Active", label: "Active", count: summary.active },
    { id: "Pending", label: "Pending", count: summary.pending },
    { id: "Suspended", label: "Suspended", count: summary.suspended },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-[#E8EAF5] bg-white p-5 shadow-2xs">
      {/* Top Row: Search Input + Status Pills + Action Button */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#626E9D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by store name, ID, vendor, email..."
            className="w-full rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] py-2.5 pl-10 pr-4 text-xs font-medium text-[#101438] placeholder:text-[#626E9D]/70 outline-none transition focus:border-[#6538F5] focus:bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#626E9D] hover:text-[#101438]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] p-1">
          {statusTabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-[#6538F5] shadow-xs"
                    : "text-[#626E9D] hover:text-[#101438]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-[#F0EBFF] text-[#6538F5]" : "bg-[#E8EAF5] text-[#626E9D]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add Store Action Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6538F5] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#4B20D8] active:scale-95 shrink-0"
        >
          <Plus className="size-4" />
          <span>Add New Store</span>
        </button>
      </div>

      {/* Bottom Row: Category Dropdown + Sort By Dropdown + Refresh Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EAF5] pt-3.5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-[#626E9D]" />
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="rounded-lg border border-[#E8EAF5] bg-[#F8F8FF] px-2.5 py-1.5 text-xs font-semibold text-[#101438] outline-none transition focus:border-[#6538F5]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-3.5 text-[#626E9D]" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="rounded-lg border border-[#E8EAF5] bg-[#F8F8FF] px-2.5 py-1.5 text-xs font-semibold text-[#101438] outline-none transition focus:border-[#6538F5]"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8EAF5] bg-white px-3 py-1.5 text-xs font-semibold text-[#626E9D] transition hover:bg-[#F8F8FF] hover:text-[#101438] disabled:opacity-50"
          title="Refresh Stores List"
        >
          <RotateCcw className={`size-3.5 ${isRefreshing ? "animate-spin text-[#6538F5]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
