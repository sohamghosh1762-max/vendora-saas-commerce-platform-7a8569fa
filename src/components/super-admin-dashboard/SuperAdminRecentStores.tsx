import { RECENT_STORES, type RecentStore } from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

interface SuperAdminRecentStoresProps {
  stores?: RecentStore[];
  onViewAll?: () => void;
  onSelectStore?: (store: RecentStore) => void;
}

export function SuperAdminRecentStores({
  stores = RECENT_STORES,
  onViewAll,
  onSelectStore,
}: SuperAdminRecentStoresProps) {
  const statusStyles = {
    Active: "bg-[#EBFBF5] text-[#08C784]",
    Pending: "bg-[#FFF4EB] text-[#FF8A00]",
    Suspended: "bg-[#FFEBEF] text-[#FF4D5A]",
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-5 shadow-2xs">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-base font-extrabold text-[#101438]">Recent Stores</h2>
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

      {/* Stores Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E8EAF5] text-[11px] font-bold text-[#626E9D]">
              <th className="pb-2.5 font-semibold">Store Name</th>
              <th className="pb-2.5 font-semibold">Vendor</th>
              <th className="pb-2.5 font-semibold text-center">Products</th>
              <th className="pb-2.5 font-semibold">Status</th>
              <th className="pb-2.5 font-semibold text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EAF5]/60">
            {stores.map((store) => (
              <tr
                key={store.id}
                onClick={() => onSelectStore?.(store)}
                className={cn(
                  "group transition-colors hover:bg-[#F8F8FF]",
                  onSelectStore ? "cursor-pointer" : "",
                )}
              >
                {/* Store Name + Logo */}
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="size-7 rounded-lg object-cover border border-[#E8EAF5]"
                    />
                    <span className="font-bold text-[#101438] group-hover:text-[#6538F5] transition-colors">
                      {store.name}
                    </span>
                  </div>
                </td>

                {/* Vendor Name */}
                <td className="py-3 px-2 text-[#626E9D] font-medium whitespace-nowrap">
                  {store.vendor}
                </td>

                {/* Products Count */}
                <td className="py-3 px-2 text-center text-[#101438] font-semibold">
                  {store.products}
                </td>

                {/* Status Pill */}
                <td className="py-3 px-2">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold",
                      statusStyles[store.status] || statusStyles.Active,
                    )}
                  >
                    {store.status}
                  </span>
                </td>

                {/* Joined Date */}
                <td className="py-3 pl-2 text-right text-[11px] text-[#626E9D] font-medium whitespace-nowrap">
                  {store.joined}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
