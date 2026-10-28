import { BarChart2, Package, ShoppingBag, Users } from "lucide-react";
import { REFERENCE_KPIS, type KpiMetric } from "@/lib/vendor-dashboard-data";
import { cn } from "@/lib/utils";

interface VendorKpiCardsProps {
  metrics?: KpiMetric[];
  onSelectMetric?: (metricId: string) => void;
}

export function VendorKpiCards({ metrics = REFERENCE_KPIS, onSelectMetric }: VendorKpiCardsProps) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    sales: ShoppingBag,
    orders: Package,
    customers: Users,
    views: BarChart2,
  };

  const styleMap = {
    purple: {
      bgIcon: "bg-[#F0EBFE] text-[#6538F5]",
      stroke: "#6538F5",
      fillGradId: "purpleKpiGrad",
      stopColor: "#6538F5",
      path: "M0,38 C25,32 45,39 65,28 C85,18 105,30 125,22 C145,14 165,24 185,18 C205,12 225,20 240,16 L240,48 L0,48 Z",
      line: "M0,38 C25,32 45,39 65,28 C85,18 105,30 125,22 C145,14 165,24 185,18 C205,12 225,20 240,16",
    },
    blue: {
      bgIcon: "bg-[#EFF6FF] text-[#2563EB]",
      stroke: "#2563EB",
      fillGradId: "blueKpiGrad",
      stopColor: "#2563EB",
      path: "M0,40 C30,36 50,42 80,30 C110,18 140,32 170,20 C200,8 220,16 240,12 L240,48 L0,48 Z",
      line: "M0,40 C30,36 50,42 80,30 C110,18 140,32 170,20 C200,8 220,16 240,12",
    },
    green: {
      bgIcon: "bg-[#ECFDF5] text-[#10B981]",
      stroke: "#10B981",
      fillGradId: "greenKpiGrad",
      stopColor: "#10B981",
      path: "M0,36 C35,32 60,18 90,20 C120,22 150,34 180,24 C210,14 225,22 240,18 L240,48 L0,48 Z",
      line: "M0,36 C35,32 60,18 90,20 C120,22 150,34 180,24 C210,14 225,22 240,18",
    },
    orange: {
      bgIcon: "bg-[#FFFBEB] text-[#F59E0B]",
      stroke: "#F59E0B",
      fillGradId: "orangeKpiGrad",
      stopColor: "#F59E0B",
      path: "M0,42 C30,40 60,34 90,32 C120,30 150,20 180,22 C210,24 225,14 240,10 L240,48 L0,48 Z",
      line: "M0,42 C30,40 60,34 90,32 C120,30 150,20 180,22 C210,24 225,14 240,10",
    },
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => {
        const Icon = iconMap[m.id] || ShoppingBag;
        const config = styleMap[m.color] || styleMap.purple;

        return (
          <div
            key={m.id}
            onClick={() => onSelectMetric?.(m.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectMetric?.(m.id);
              }
            }}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-[#6538F5]/30 hover:shadow-md cursor-pointer",
            )}
          >
            {/* Top row: Icon on left, Content on right */}
            <div className="flex items-start gap-3.5 z-10">
              <div
                className={cn(
                  "grid size-11 place-items-center rounded-xl shrink-0 transition-transform group-hover:scale-105",
                  config.bgIcon,
                )}
              >
                <Icon className="size-5" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-medium text-[#7A7F93] block leading-tight">
                  {m.title}
                </span>
                <span className="mt-1 text-2xl font-black text-[#110D27] block tracking-tight leading-tight">
                  {m.value}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#10B981] leading-tight">
                  {m.growth}
                </span>
              </div>
            </div>

            {/* Bottom Sparkline Wave */}
            <div className="relative mt-4 -mx-5 -mb-5 h-12 w-[calc(100%+2.5rem)] overflow-hidden pointer-events-none">
              <svg viewBox="0 0 240 48" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id={config.fillGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.stopColor} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={config.stopColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={config.path} fill={`url(#${config.fillGradId})`} />
                <path
                  d={config.line}
                  fill="none"
                  stroke={config.stroke}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
