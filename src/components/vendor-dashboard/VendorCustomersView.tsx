import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type { CustomerTier, VendorCustomer } from "@/lib/vendor-types";
import { getVendorCustomers, saveVendorCustomerNote } from "@/lib/vendor-api";
import { formatINR } from "@/lib/format";
import { CustomerDetailModal } from "./VendorModals";
import { cn } from "@/lib/utils";

export interface VendorCustomersViewProps {
  storeId?: string | undefined;
  storeName?: string | undefined;
}

export type CustomerFilterTab = "all" | CustomerTier;

export type CustomerSortOption =
  | "spent-desc"
  | "orders-desc"
  | "recent-desc"
  | "name-asc";

export function VendorCustomersView({
  storeId = "the-urban-nest",
  storeName = "The Urban Nest",
}: VendorCustomersViewProps) {
  const [customers, setCustomers] = useState<VendorCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<CustomerFilterTab>("all");
  const [sortBy, setSortBy] = useState<CustomerSortOption>("spent-desc");
  const [selectedCustomer, setSelectedCustomer] = useState<VendorCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadCustomers = () => {
    try {
      const items = getVendorCustomers(storeId);
      setCustomers(items);
      setError(null);
    } catch {
      setError("Customer directory could not be loaded. Check browser storage and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    reloadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // Handle note save
  const handleSaveNote = (customerEmail: string, note: string) => {
    saveVendorCustomerNote(storeId, customerEmail, note);
    // Update local state
    setCustomers((prev) =>
      prev.map((c) =>
        c.email.toLowerCase() === customerEmail.toLowerCase() ? { ...c, notes: note } : c,
      ),
    );
    if (selectedCustomer && selectedCustomer.email.toLowerCase() === customerEmail.toLowerCase()) {
      setSelectedCustomer((prev) => (prev ? { ...prev, notes: note } : null));
    }
  };

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = customers.filter((customer) => {
      // Search filter
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone && customer.phone.toLowerCase().includes(query)) ||
        (customer.shippingAddress && customer.shippingAddress.toLowerCase().includes(query));

      // Tier filter
      const matchesTier =
        tierFilter === "all" ||
        (tierFilter === "Repeat" && customer.totalOrders > 1) ||
        (tierFilter === "VIP" && (customer.totalSpent >= 2500 || customer.tier === "VIP")) ||
        (tierFilter === "New" && customer.totalOrders === 1);

      return matchesSearch && matchesTier;
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === "spent-desc") {
        return b.totalSpent - a.totalSpent;
      }
      if (sortBy === "orders-desc") {
        return b.totalOrders - a.totalOrders;
      }
      if (sortBy === "recent-desc") {
        const timeA = new Date(a.lastOrderDate).getTime() || 0;
        const timeB = new Date(b.lastOrderDate).getTime() || 0;
        return timeB - timeA;
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [customers, search, tierFilter, sortBy]);

  // Aggregated KPIs
  const totalCustomersCount = customers.length;
  const repeatCustomersCount = customers.filter((c) => c.totalOrders > 1).length;
  const repeatRate =
    totalCustomersCount > 0
      ? Math.round((repeatCustomersCount / totalCustomersCount) * 100)
      : 0;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageCustomerSpend =
    totalCustomersCount > 0 ? Math.round(totalRevenue / totalCustomersCount) : 0;

  // Counts for filter tabs
  const tabCounts = useMemo(() => {
    return {
      all: customers.length,
      Repeat: customers.filter((c) => c.totalOrders > 1).length,
      VIP: customers.filter((c) => c.totalSpent >= 2500 || c.tier === "VIP").length,
      New: customers.filter((c) => c.totalOrders === 1).length,
    };
  }, [customers]);

  const resetFilters = () => {
    setSearch("");
    setTierFilter("all");
    setSortBy("spent-desc");
  };

  const tierBadgeStyle: Record<CustomerTier, { bg: string; text: string; border: string }> = {
    VIP: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    Repeat: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    New: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  };

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Total Customers
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-[#F0EBFE] text-[#6538F5]">
              <Users className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-[#110D27]">{totalCustomersCount}</p>
          <p className="mt-0.5 text-[11px] text-[#7A7F93]">Scoped to {storeName}</p>
        </div>

        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Repeat Buyers
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <UserCheck className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-[#110D27]">
            {repeatCustomersCount}{" "}
            <span className="text-xs font-bold text-blue-600">({repeatRate}%)</span>
          </p>
          <p className="mt-0.5 text-[11px] text-[#7A7F93]">Ordered multiple times</p>
        </div>

        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Lifetime Revenue
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-[#110D27]">{formatINR(totalRevenue)}</p>
          <p className="mt-0.5 text-[11px] text-[#7A7F93]">From store orders</p>
        </div>

        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Avg Customer Value
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-[#110D27]">
            {formatINR(averageCustomerSpend)}
          </p>
          <p className="mt-0.5 text-[11px] text-[#7A7F93]">Spend per buyer</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Controls Toolbar */}
        <div className="border-b border-[#ECEAF5] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A7F93]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name, email, phone, or city..."
                aria-label="Search customers"
                className="w-full rounded-xl border border-[#ECEAF5] bg-[#FDFCFE] py-2 pl-10 pr-9 text-xs text-[#110D27] outline-none transition placeholder:text-[#908DA3] focus:border-[#6538F5] focus:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear customer search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7F93] hover:text-[#110D27]"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#7A7F93] whitespace-nowrap">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as CustomerSortOption)}
                aria-label="Sort customers"
                className="rounded-xl border border-[#ECEAF5] bg-white px-3 py-2 text-xs font-semibold text-[#110D27] outline-none focus:border-[#6538F5]"
              >
                <option value="spent-desc">Highest Spent</option>
                <option value="orders-desc">Most Orders</option>
                <option value="recent-desc">Most Recent</option>
                <option value="name-asc">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTierFilter("all")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
                tierFilter === "all"
                  ? "bg-[#6538F5] text-white"
                  : "bg-[#F4F2FC] text-[#554F6D] hover:bg-[#EBE7FA]",
              )}
            >
              <span>All Customers</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  tierFilter === "all" ? "bg-white/20 text-white" : "bg-white text-[#6538F5]",
                )}
              >
                {tabCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTierFilter("Repeat")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
                tierFilter === "Repeat"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100",
              )}
            >
              <span>Repeat Buyers</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  tierFilter === "Repeat" ? "bg-white/20 text-white" : "bg-white text-blue-700",
                )}
              >
                {tabCounts.Repeat}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTierFilter("VIP")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
                tierFilter === "VIP"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100",
              )}
            >
              <span>VIP Clients</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  tierFilter === "VIP" ? "bg-white/20 text-white" : "bg-white text-purple-700",
                )}
              >
                {tabCounts.VIP}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTierFilter("New")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
                tierFilter === "New"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
              )}
            >
              <span>First-Time</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  tierFilter === "New" ? "bg-white/20 text-white" : "bg-white text-emerald-700",
                )}
              >
                {tabCounts.New}
              </span>
            </button>

            {(search || tierFilter !== "all" || sortBy !== "spent-desc") && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-auto flex items-center gap-1 text-xs font-bold text-[#6538F5] hover:underline"
              >
                <RotateCcw className="size-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div role="status" className="py-20 text-center text-sm text-[#7A7F93]">
            Loading customer directory...
          </div>
        ) : error ? (
          <div role="alert" className="p-10 text-center space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle className="size-6" />
            </div>
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button
              type="button"
              onClick={reloadCustomers}
              className="rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white hover:bg-[#5228D9]"
            >
              Try Again
            </button>
          </div>
        ) : customers.length === 0 ? (
          /* Empty Store State */
          <div
            data-testid="customers-empty-state"
            className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center"
          >
            <div className="grid size-14 place-items-center rounded-2xl bg-[#F0EBFE] text-[#6538F5]">
              <Users className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#110D27]">No customers yet</h3>
            <p className="mt-1 max-w-sm text-xs text-[#7A7F93]">
              When buyers place orders with {storeName}, their profile, order frequency, and purchase
              history will appear here.
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          /* Empty Search/Filter State */
          <div
            data-testid="customers-no-results"
            className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center"
          >
            <div className="grid size-12 place-items-center rounded-2xl bg-[#F4F2FC] text-[#7A7F93]">
              <Search className="size-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-[#110D27]">No matching customers</h3>
            <p className="mt-1 max-w-xs text-xs text-[#7A7F93]">
              No customers match your query "{search || tierFilter}". Try adjusting your filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white hover:bg-[#5228D9]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Customers Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FE] text-[10px] font-bold uppercase tracking-wider text-[#7A7F93] border-b border-[#ECEAF5]">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Contact & Location</th>
                  <th className="px-4 py-3.5">Segment</th>
                  <th className="px-4 py-3.5">Orders</th>
                  <th className="px-4 py-3.5">Total Spent</th>
                  <th className="px-4 py-3.5">Latest Purchase</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAF5]">
                {filteredCustomers.map((customer) => {
                  const initials =
                    customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "CU";

                  const badge = tierBadgeStyle[customer.tier] || tierBadgeStyle.New;

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-[#FDFCFE] transition-colors"
                      data-testid={`customer-row-${customer.id}`}
                    >
                      {/* Customer Name & Initials */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-[#6538F5] to-[#8C62FF] text-xs font-extrabold text-white shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-[#110D27] block text-xs">
                              {customer.name}
                            </span>
                            <span className="text-[11px] text-[#7A7F93] block">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="px-4 py-4 text-[#7A7F93]">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-[#110D27]">
                            <Phone className="size-3 text-[#7A7F93]" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.shippingAddress ? (
                          <div className="flex items-center gap-1 text-[11px] text-[#7A7F93] mt-0.5 line-clamp-1 max-w-[200px]">
                            <MapPin className="size-3 shrink-0" />
                            <span className="truncate">{customer.shippingAddress}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#908DA3] italic">No address</span>
                        )}
                      </td>

                      {/* Segment Tier */}
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                            badge.bg,
                            badge.text,
                            badge.border,
                          )}
                        >
                          {customer.tier}
                        </span>
                      </td>

                      {/* Total Orders */}
                      <td className="px-4 py-4">
                        <span className="font-extrabold text-[#110D27]">
                          {customer.totalOrders} {customer.totalOrders === 1 ? "order" : "orders"}
                        </span>
                      </td>

                      {/* Total Spent & AOV */}
                      <td className="px-4 py-4">
                        <span className="font-extrabold text-[#110D27] block">
                          {formatINR(customer.totalSpent)}
                        </span>
                        <span className="text-[10px] text-[#7A7F93]">
                          AOV: {formatINR(customer.averageOrderValue)}
                        </span>
                      </td>

                      {/* Latest Order */}
                      <td className="px-4 py-4 text-[#7A7F93]">
                        <span className="block text-xs font-semibold text-[#110D27]">
                          {customer.lastOrderDate}
                        </span>
                        {customer.orders[0] && (
                          <span className="text-[10px] text-[#7A7F93]">
                            {customer.orders[0].orderNumber || customer.orders[0].id}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          aria-label={`View details for ${customer.name}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECEAF5] bg-white px-3 py-1.5 text-xs font-bold text-[#6538F5] shadow-2xs hover:border-[#6538F5] hover:bg-[#F0EBFE] transition"
                        >
                          <Eye className="size-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onSaveNote={handleSaveNote}
        />
      )}
    </div>
  );
}

