import { REFERENCE_ORDERS, type DashboardOrder } from "@/lib/vendor-dashboard-data";
import { cn } from "@/lib/utils";

interface VendorRecentOrdersProps {
  orders?: DashboardOrder[];
  onViewAll?: () => void;
  onSelectOrder?: (order: DashboardOrder) => void;
}

export function VendorRecentOrders({
  orders = REFERENCE_ORDERS,
  onViewAll,
  onSelectOrder,
}: VendorRecentOrdersProps) {
  const statusStyles = {
    Pending: "bg-[#FEF3C7] text-[#D97706]",
    Delivered: "bg-[#DCFCE7] text-[#15803D]",
    Shipped: "bg-[#DBEAFE] text-[#1D4ED8]",
    Processing: "bg-[#FEF3C7] text-[#D97706]",
    Cancelled: "bg-[#FEE2E2] text-[#DC2626]",
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-base font-bold text-[#110D27]">Recent Orders</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-[#6538F5] transition hover:underline"
        >
          View All
        </button>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-[#F1EFF7]">
        {orders.map((o) => (
          <div
            key={o.id}
            onClick={() => onSelectOrder?.(o)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectOrder?.(o);
              }
            }}
            className="flex items-center justify-between py-2.5 transition hover:bg-[#F9F8FD] rounded-xl px-1.5 cursor-pointer"
          >
            {/* Left: Thumbnail & Customer info */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={o.image}
                alt={o.customerName}
                className="size-9 rounded-lg object-cover bg-[#F4F2FC] shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-xs font-bold text-[#110D27] leading-tight">
                  {o.orderNumber}
                </span>
                <span className="block truncate text-xs text-[#7A7F93] leading-tight mt-0.5">
                  {o.customerName}
                </span>
              </div>
            </div>

            {/* Middle: Date */}
            <div className="hidden sm:block text-xs font-medium text-[#7A7F93]">{o.date}</div>

            {/* Right: Amount & Status Pill */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#110D27]">{o.formattedAmount}</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0",
                  statusStyles[o.status] || "bg-muted text-foreground",
                )}
              >
                {o.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
