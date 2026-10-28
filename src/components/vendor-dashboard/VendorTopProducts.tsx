import { REFERENCE_TOP_PRODUCTS, type DashboardProduct } from "@/lib/vendor-dashboard-data";

interface VendorTopProductsProps {
  products?: DashboardProduct[];
  onViewAll?: () => void;
  onSelectProduct?: (product: DashboardProduct) => void;
}

export function VendorTopProducts({
  products = REFERENCE_TOP_PRODUCTS,
  onViewAll,
  onSelectProduct,
}: VendorTopProductsProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-base font-bold text-[#110D27]">Top Products</h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-[#6538F5] transition hover:underline"
        >
          View All
        </button>
      </div>

      {/* Products List */}
      <div className="divide-y divide-[#F1EFF7]">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectProduct?.(p)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectProduct?.(p);
              }
            }}
            className="flex items-center justify-between py-2.5 transition hover:bg-[#F9F8FD] rounded-xl px-1.5 cursor-pointer"
          >
            {/* Left: Thumbnail + Title + Sold count + Progress line */}
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
              <img
                src={p.image}
                alt={p.name}
                className="size-9 rounded-lg object-cover bg-[#F4F2FC] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="block truncate text-xs font-bold text-[#110D27] leading-tight">
                  {p.name}
                </span>
                <span className="block text-[11px] text-[#7A7F93] leading-tight mt-0.5">
                  {p.unitsSold} sold
                </span>
                {/* Thin Purple Progress Bar */}
                <div className="mt-1 h-1 w-full max-w-[140px] rounded-full bg-[#F0EBFE]">
                  <div
                    className="h-full rounded-full bg-[#6538F5]"
                    style={{ width: `${p.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Revenue */}
            <div className="shrink-0 text-right">
              <span className="text-xs font-bold text-[#110D27]">{p.formattedRevenue}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
