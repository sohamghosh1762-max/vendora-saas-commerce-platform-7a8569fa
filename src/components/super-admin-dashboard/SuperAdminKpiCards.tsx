import { Store, Users, Package, ShoppingCart, IndianRupee } from "lucide-react";
import { REFERENCE_KPIS, type AdminKpiItem } from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

interface SuperAdminKpiCardsProps {
  metrics?: AdminKpiItem[];
  onSelectKpi?: (kpiId: string) => void;
}

const ICON_MAP = {
  stores: Store,
  vendors: Users,
  products: Package,
  orders: ShoppingCart,
  revenue: IndianRupee,
};

export function SuperAdminKpiCards({
  metrics = REFERENCE_KPIS,
  onSelectKpi,
}: SuperAdminKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((kpi) => {
        const IconComponent = ICON_MAP[kpi.id] || Store;

        return (
          <div
            key={kpi.id}
            onClick={() => onSelectKpi?.(kpi.id)}
            role={onSelectKpi ? "button" : undefined}
            tabIndex={onSelectKpi ? 0 : undefined}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-4.5 shadow-2xs transition-all duration-200 hover:border-[#6538F5]/30 hover:shadow-soft",
              onSelectKpi ? "cursor-pointer" : "",
            )}
          >
            {/* Top Row: Icon Tile + Title & Value */}
            <div className="flex items-start gap-3.5">
              {/* Colored Icon Tile */}
              <div
                className="grid size-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: kpi.bgHex,
                  color: kpi.colorHex,
                }}
              >
                <IconComponent className="size-5" />
              </div>

              {/* Title & Value */}
              <div className="flex-1 min-w-0">
                <span className="block text-[11px] font-semibold text-[#626E9D] truncate">
                  {kpi.title}
                </span>
                <span className="block mt-0.5 text-xl font-extrabold text-[#101438] tracking-tight">
                  {kpi.value}
                </span>
              </div>
            </div>

            {/* Middle: Growth Rate Badge & Comparison */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px]">
              <span className="inline-flex items-center rounded-md bg-[#EBFBF5] px-1.5 py-0.5 font-bold text-[#08C784]">
                {kpi.growth}
              </span>
              <span className="text-[#626E9D] truncate">{kpi.comparison}</span>
            </div>

            {/* Bottom: Sparkline Trend Line SVG */}
            <div className="mt-3 h-9 w-full overflow-hidden">
              <svg
                viewBox="0 0 240 40"
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={kpi.sparkline.fillGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={kpi.sparkline.stroke} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={kpi.sparkline.stroke} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={kpi.sparkline.path}
                  fill={`url(#${kpi.sparkline.fillGradId})`}
                  className="transition-opacity group-hover:opacity-90"
                />
                <path
                  d={kpi.sparkline.line}
                  fill="none"
                  stroke={kpi.sparkline.stroke}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
