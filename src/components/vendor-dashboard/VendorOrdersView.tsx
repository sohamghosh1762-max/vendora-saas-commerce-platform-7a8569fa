import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Eye,
  FileText,
  Package,
  RotateCcw,
  Search,
  ShoppingCart,
} from "lucide-react";
import type { OrderStatus, VendorOrder } from "@/lib/vendor-types";
import { getVendorOrders, updateVendorOrderStatus } from "@/lib/vendor-api";
import { formatINR } from "@/lib/format";
import { OrderDetailModal, type DetailedOrder } from "./VendorModals";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  Pending: {
    label: "Pending",
    bg: "bg-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-600",
  },
  Processing: {
    label: "Processing",
    bg: "bg-blue-100",
    text: "text-blue-800",
    dot: "bg-blue-600",
  },
  Shipped: {
    label: "Shipped",
    bg: "bg-purple-100",
    text: "text-purple-800",
    dot: "bg-purple-600",
  },
  Delivered: {
    label: "Delivered",
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-600",
  },
  Cancelled: {
    label: "Cancelled",
    bg: "bg-rose-100",
    text: "text-rose-800",
    dot: "bg-rose-600",
  },
};

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export interface VendorOrdersViewProps {
  storeId?: string | undefined;
  onOrdersChange?: (() => void) | undefined;
}

export function VendorOrdersView({
  storeId = "the-urban-nest",
  onOrdersChange,
}: VendorOrdersViewProps) {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);

  const reloadOrders = () => {
    try {
      const items = getVendorOrders(storeId);
      setOrders(items);
      setError(null);
    } catch {
      setError("Orders could not be loaded. Check browser storage and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    reloadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const orderIdStr = (order.id || "").toLowerCase();
      const orderNumStr = (order.orderNumber || "").toLowerCase();
      const customerStr = (order.customerName || "").toLowerCase();
      const emailStr = (order.customerEmail || "").toLowerCase();

      const matchesQuery =
        !query ||
        orderIdStr.includes(query) ||
        orderNumStr.includes(query) ||
        customerStr.includes(query) ||
        emailStr.includes(query);

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<"all" | OrderStatus, number> = {
      all: orders.length,
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };
    for (const ord of orders) {
      if (counts[ord.status] !== undefined) {
        counts[ord.status]++;
      }
    }
    return counts;
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const result = updateVendorOrderStatus(orderId, newStatus, storeId);
    if (!result.success) {
      setFeedback({ message: result.error || "Failed to update order status.", error: true });
      return;
    }

    if (result.order) {
      const updatedOrder = result.order;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          ...updatedOrder,
        });
      }
    }

    setFeedback({
      message: `Order ${orderId} status updated to ${newStatus}.`,
      error: false,
    });
    setError(null);
    onOrdersChange?.();
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <section className="space-y-4" aria-label="Order management">
      {/* Feedback & Error banners */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800"
        >
          <span>{error}</span>
          <button type="button" onClick={reloadOrders} className="underline">
            Retry
          </button>
        </div>
      )}

      {feedback && (
        <div
          role={feedback.error ? "alert" : "status"}
          className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-xs font-semibold ${
            feedback.error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.error ? <AlertCircle className="size-4" /> : <Check className="size-4" />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[11px] underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Top Header & Search/Filter Controls */}
        <div className="flex flex-col gap-4 border-b border-[#ECEAF5] pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#110D27]">Orders</h3>
                <span className="rounded-full bg-[#F0EBFE] px-2.5 py-0.5 text-xs font-bold text-[#6538F5]">
                  {orders.length} {orders.length === 1 ? "order" : "orders"}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#7A7F93]">
                Manage, search, track fulfillments, and update order statuses.
              </p>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7A7F93]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID or customer"
                  aria-label="Search orders"
                  className="w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#6538F5]"
                />
              </div>

              {(search || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  aria-label="Clear order filters"
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#ECEAF5] text-[#7A7F93] hover:bg-[#F4F2FC] transition"
                  title="Clear filters"
                >
                  <RotateCcw className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div
            className="flex flex-wrap items-center gap-2 pt-1"
            role="tablist"
            aria-label="Filter orders by status"
          >
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === "all"
                  ? "bg-[#6538F5] text-white shadow-xs"
                  : "border border-[#ECEAF5] bg-white text-[#7A7F93] hover:border-[#6538F5] hover:text-[#6538F5]"
              }`}
            >
              <span>All Orders</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  statusFilter === "all" ? "bg-white/20 text-white" : "bg-[#F4F2FC] text-[#6538F5]"
                }`}
              >
                {statusCounts.all}
              </span>
            </button>

            {ALL_ORDER_STATUSES.map((status) => {
              const cfg = ORDER_STATUS_CONFIG[status];
              const isSelected = statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-[#6538F5] text-white shadow-xs"
                      : "border border-[#ECEAF5] bg-white text-[#7A7F93] hover:border-[#6538F5] hover:text-[#6538F5]"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${isSelected ? "bg-white" : cfg.dot}`}
                  />
                  <span>{cfg.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#F4F2FC] text-[#6538F5]"
                    }`}
                  >
                    {statusCounts[status]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 p-12 text-sm text-[#7A7F93]"
          >
            <Package className="size-4 animate-pulse" />
            <span>Loading orders…</span>
          </div>
        ) : error ? null : orders.length === 0 ? (
          /* Empty Store Orders State */
          <div className="my-8 flex flex-col items-center rounded-2xl border border-dashed border-[#ECEAF5] bg-[#FBFBFE] p-10 text-center">
            <ShoppingCart className="size-8 text-[#6538F5]" />
            <h4 className="mt-3 text-sm font-bold text-[#110D27]">No orders yet</h4>
            <p className="mt-1 text-xs text-[#7A7F93]">
              When customers purchase products from your storefront, orders will appear here.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty Filter State */
          <div className="my-8 flex flex-col items-center rounded-2xl border border-dashed border-[#ECEAF5] bg-[#FBFBFE] p-10 text-center">
            <Search className="size-7 text-[#6538F5]" />
            <h4 className="mt-3 text-sm font-bold text-[#110D27]">No matching orders found</h4>
            <p className="mt-1 text-xs text-[#7A7F93]">
              Try adjusting your search query or selecting a different status filter.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 text-xs font-bold text-[#6538F5] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Orders Table */
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="border-b border-[#ECEAF5] text-[10px] font-bold uppercase tracking-wide text-[#908DA3]">
                <tr>
                  <th className="px-3 py-3">Order ID</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Products</th>
                  <th className="px-3 py-3">Total Amount</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFF7]">
                {filteredOrders.map((order) => {
                  const displayId = order.orderNumber || order.id;
                  const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.Pending;
                  const itemsSummary =
                    order.items && order.items.length > 0
                      ? order.items
                          .map((item) => `${item.productName} × ${item.qty}`)
                          .join(", ")
                      : "1 item";

                  const isTerminal = order.status === "Delivered" || order.status === "Cancelled";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F9F8FD] transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order ID */}
                      <td className="px-3 py-3.5 font-bold text-[#110D27]">{displayId}</td>

                      {/* Customer */}
                      <td className="px-3 py-3.5">
                        <div className="font-bold text-[#110D27]">{order.customerName}</div>
                        <div className="text-[11px] text-[#7A7F93]">{order.customerEmail}</div>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3.5 text-[#4B5264]">{order.date}</td>

                      {/* Products */}
                      <td className="px-3 py-3.5 max-w-[220px]">
                        <span className="block truncate text-[#110D27]" title={itemsSummary}>
                          {itemsSummary}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="px-3 py-3.5 font-bold text-[#110D27]">
                        {formatINR(order.total)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.bg} ${cfg.text}`}
                        >
                          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-3 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-2">
                          {/* Quick Status Select */}
                          <select
                            aria-label={`Update status for ${order.id}`}
                            value={order.status}
                            disabled={isTerminal}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className={`rounded-lg border border-[#ECEAF5] bg-white px-2 py-1 text-[11px] font-semibold outline-none focus:border-[#6538F5] ${
                              isTerminal
                                ? "opacity-50 cursor-not-allowed bg-[#F9F8FD]"
                                : "text-[#110D27] hover:border-[#6538F5]"
                            }`}
                          >
                            {ALL_ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>

                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            aria-label={`View details for ${order.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#ECEAF5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6538F5] hover:bg-[#F4F2FC] transition"
                          >
                            <Eye className="size-3" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={(orderId, nextStatus) => {
          const res = updateVendorOrderStatus(orderId, nextStatus, storeId);
          if (res.success && res.order) {
            const updated = res.order;
            setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
            setSelectedOrder(updated);
            setFeedback({
              message: `Order ${orderId} status updated to ${nextStatus}.`,
              error: false,
            });
            onOrdersChange?.();
          }
          return res;
        }}
      />
    </section>
  );
}

