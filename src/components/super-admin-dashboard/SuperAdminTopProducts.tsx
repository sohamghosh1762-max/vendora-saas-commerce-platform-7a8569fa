import { TOP_PRODUCTS, type TopProduct } from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

interface SuperAdminTopProductsProps {
  products?: TopProduct[];
  onViewAll?: () => void;
  onSelectProduct?: (product: TopProduct) => void;
}

export function SuperAdminTopProducts({
  products = TOP_PRODUCTS,
  onViewAll,
  onSelectProduct,
}: SuperAdminTopProductsProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-5 shadow-2xs">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-base font-extrabold text-[#101438]">Top Selling Products</h2>
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
              <th className="pb-2.5 font-semibold">Product</th>
              <th className="pb-2.5 font-semibold">Store</th>
              <th className="pb-2.5 font-semibold text-center">Sold</th>
              <th className="pb-2.5 font-semibold text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EAF5]/60">
            {products.map((prod) => (
              <tr
                key={prod.id}
                onClick={() => onSelectProduct?.(prod)}
                className={cn(
                  "group transition-colors hover:bg-[#F8F8FF]",
                  onSelectProduct ? "cursor-pointer" : "",
                )}
              >
                {/* Product Name + Thumbnail */}
                <td className="py-3 pr-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="size-8 rounded-lg object-cover border border-[#E8EAF5]"
                    />
                    <span className="font-bold text-[#101438] group-hover:text-[#6538F5] transition-colors">
                      {prod.name}
                    </span>
                  </div>
                </td>

                {/* Store Name */}
                <td className="py-3 px-2 text-[#626E9D] font-medium whitespace-nowrap">
                  {prod.store}
                </td>

                {/* Units Sold */}
                <td className="py-3 px-2 text-center text-[#101438] font-bold">{prod.sold}</td>

                {/* Revenue */}
                <td className="py-3 pl-2 text-right font-bold text-[#101438] whitespace-nowrap">
                  {prod.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
