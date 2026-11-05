import { TOP_STORES, type TopStore } from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

interface SuperAdminTopStoresProps {
  stores?: TopStore[];
  onViewAll?: () => void;
  onSelectStore?: (store: TopStore) => void;
}

export function SuperAdminTopStores({
  stores = TOP_STORES,
  onViewAll,
  onSelectStore,
}: SuperAdminTopStoresProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-5 shadow-2xs">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-base font-extrabold text-[#101438]">Top Performing Stores</h2>
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E8EAF5] text-[11px] font-bold text-[#626E9D]">
              <th className="pb-2.5 font-semibold w-6">#</th>
              <th className="pb-2.5 font-semibold">Store Name</th>
              <th className="pb-2.5 font-semibold">Vendor</th>
              <th className="pb-2.5 font-semibold text-right">Total Sales</th>
              <th className="pb-2.5 font-semibold text-center">Orders</th>
              <th className="pb-2.5 font-semibold text-right">Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EAF5]/60">
            {stores.map((store) => (
              <tr
                key={store.rank}
                onClick={() => onSelectStore?.(store)}
                className={cn(
                  "group transition-colors hover:bg-[#F8F8FF]",
                  onSelectStore ? "cursor-pointer" : "",
                )}
              >
                {/* Rank */}
                <td className="py-3 pr-2 font-bold text-[#626E9D]">{store.rank}</td>

                {/* Store Name + Logo */}
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="size-7 rounded-lg object-cover border border-[#E8EAF5]"
                    />
                    <span className="font-bold text-[#101438] group-hover:text-[#6538F5] transition-colors whitespace-nowrap">
                      {store.name}
                    </span>
                  </div>
                </td>

                {/* Vendor Name */}
                <td className="py-3 px-2 text-[#626E9D] font-medium whitespace-nowrap">
                  {store.vendor}
                </td>

                {/* Total Sales */}
                <td className="py-3 px-2 text-right font-bold text-[#101438] whitespace-nowrap">
                  {store.totalSales}
                </td>

                {/* Orders */}
                <td className="py-3 px-2 text-center text-[#101438] font-semibold">
                  {store.orders}
                </td>

                {/* Growth Badge */}
                <td className="py-3 pl-2 text-right whitespace-nowrap">
                  <span className="inline-flex items-center rounded-md bg-[#EBFBF5] px-1.5 py-0.5 text-[10px] font-bold text-[#08C784]">
                    {store.growth}
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
