import { RECENT_ORDERS, type RecentOrder } from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

interface SuperAdminRecentOrdersProps {
  orders?: RecentOrder[];
  onViewAll?: () => void;
  onSelectOrder?: (order: RecentOrder) => void;
}

export function SuperAdminRecentOrders({
  orders = RECENT_ORDERS,
  onViewAll,
  onSelectOrder,
}: SuperAdminRecentOrdersProps) {
  const statusStyles = {
    Delivered: "bg-[#EBFBF5] text-[#08C784]",
    Shipped: "bg-[#EBF3FF] text-[#1685FF]",
    Processing: "bg-[#FFF4EB] text-[#FF8A00]",
    Cancelled: "bg-[#FFEBEF] text-[#FF4D5A]",
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-5 shadow-2xs">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-base font-extrabold text-[#101438]">Recent Orders</h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-[#6538F5] hover:text-[#4B20D8] transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E8EAF5] text-[11px] font-bold text-[#626E9D]">
              <th className="pb-2.5 font-semibold">Order ID</th>
              <th className="pb-2.5 font-semibold">Customer</th>
              <th className="pb-2.5 font-semibold">Store</th>
              <th className="pb-2.5 font-semibold text-right">Amount</th>
              <th className="pb-2.5 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EAF5]/60">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder?.(order)}
                className={cn(
                  "group transition-colors hover:bg-[#F8F8FF]",
                  onSelectOrder ? "cursor-pointer" : "",
                )}
              >
                {/* Order ID */}
                <td className="py-3 pr-2 font-mono font-bold text-[#101438]">
                  {order.orderNumber}
                </td>

                {/* Customer with Avatar */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={order.customerAvatar}
                      alt={order.customer}
                      className="size-6 rounded-full object-cover border border-[#E8EAF5]"
                    />
                    <span className="font-semibold text-[#101438] whitespace-nowrap">
                      {order.customer}
                    </span>
                  </div>
                </td>

                {/* Store Name */}
                <td className="py-3 px-2 text-[#626E9D] font-medium whitespace-nowrap">
                  {order.store}
                </td>

                {/* Amount */}
                <td className="py-3 px-2 text-right font-bold text-[#101438] whitespace-nowrap">
                  {order.amount}
                </td>

                {/* Status Badge */}
                <td className="py-3 pl-2 text-right">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold",
                      statusStyles[order.status] || statusStyles.Delivered,
                    )}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
