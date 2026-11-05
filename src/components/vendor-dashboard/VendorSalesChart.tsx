import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Dot,
} from "recharts";
import { REFERENCE_CHART_DATA, type ChartDataPoint } from "@/lib/vendor-dashboard-data";
import { cn } from "@/lib/utils";

type ChartMetric = "sales" | "orders" | "views";

interface VendorSalesChartProps {
  data?: ChartDataPoint[];
}

export function VendorSalesChart({ data = REFERENCE_CHART_DATA }: VendorSalesChartProps) {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>("sales");
  const [mounted, setMounted] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const metricConfig = {
    sales: {
      dataKey: "sales",
      yTicks: [0, 10000, 20000, 30000, 40000],
      yDomain: [0, 40000],
      yFormatter: (val: number) => (val === 0 ? "₹0" : `₹${val / 1000}K`),
      tooltipFormatter: (val: number) => `₹${val.toLocaleString("en-IN")}`,
      refValue: "₹28,450",
    },
    orders: {
      dataKey: "orders",
      yTicks: [0, 25, 50, 75, 100],
      yDomain: [0, 100],
      yFormatter: (val: number) => `${val}`,
      tooltipFormatter: (val: number) => `${val} orders`,
      refValue: "68 orders",
    },
    views: {
      dataKey: "views",
      yTicks: [0, 1000, 2000, 3000, 4000],
      yDomain: [0, 4000],
      yFormatter: (val: number) => (val === 0 ? "0" : `${val / 1000}K`),
      tooltipFormatter: (val: number) => `${val.toLocaleString("en-IN")} views`,
      refValue: "2,950 views",
    },
  }[activeMetric];

  interface DotProps {
    cx?: number;
    cy?: number;
    payload?: { date?: string };
  }

  interface ChartHoverState {
    activePayload?: Array<{ payload: ChartDataPoint }>;
  }

  // Custom static pin for Oct 15 when not hovered
  const renderCustomDot = (props: DotProps) => {
    const { cx = 0, cy = 0, payload } = props;
    if (payload?.date === "Oct 15") {
      return (
        <g key="oct15-pin">
          {/* Subtle Outer Glow */}
          <circle cx={cx} cy={cy} r={7} fill="#6538F5" fillOpacity={0.25} />
          {/* Inner Highlight Dot */}
          <circle
            cx={cx}
            cy={cy}
            r={4.5}
            fill="#6538F5"
            stroke="#FFFFFF"
            strokeWidth={2}
            className="filter drop-shadow-sm"
          />
        </g>
      );
    }
    return <g key={`dot-${cx}-${cy}`} />;
  };

  return (
    <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Header with Title and Metric Filter Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-base font-bold text-[#110D27]">Sales Overview</h3>

        {/* Segmented Control */}
        <div className="inline-flex items-center gap-1 rounded-xl bg-[#F4F2FB] p-1 text-xs">
          {(["sales", "orders", "views"] as const).map((tab) => {
            const isActive = activeMetric === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveMetric(tab)}
                className={cn(
                  "rounded-lg px-3.5 py-1 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-[#6538F5] text-white shadow-xs"
                    : "text-[#6C7280] hover:text-[#110D27]",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-[260px] sm:h-[280px] w-full pt-2">
        {/* Screenshot Reference Tooltip pinned at Oct 15 */}
        {!hoveredPoint && (
          <div
            className="absolute left-[54%] top-[18%] -translate-x-1/2 z-20 pointer-events-none transition-all hidden sm:block"
            aria-hidden="true"
          >
            <div className="rounded-xl border border-[#ECEAF5] bg-white px-3 py-1.5 shadow-[0_4px_16px_rgba(101,56,245,0.12)] text-center">
              <span className="block text-[10px] font-medium text-[#7A7F93]">Oct 15, 2024</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-[#6538F5]" />
                <span className="text-xs font-bold text-[#110D27]">{metricConfig.refValue}</span>
              </div>
            </div>
            {/* Tooltip pointer triangle */}
            <div className="mx-auto size-2 -mt-1 rotate-45 border-r border-b border-[#ECEAF5] bg-white" />
          </div>
        )}

        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
              onMouseMove={(e: ChartHoverState) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setHoveredPoint(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="salesOverviewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6538F5" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#6538F5" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#ECEAF5"
                vertical={true}
                horizontal={true}
              />

              <XAxis
                dataKey="date"
                stroke="#9AA0B2"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9AA0B2", fontSize: 11, fontWeight: 500 }}
                dy={8}
              />

              <YAxis
                ticks={metricConfig.yTicks}
                domain={metricConfig.yDomain}
                tickFormatter={metricConfig.yFormatter}
                stroke="#9AA0B2"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#9AA0B2", fontSize: 11, fontWeight: 500 }}
                dx={-4}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const first = payload[0];
                    if (!first) return null;
                    const pt = first.payload as ChartDataPoint;
                    const val = pt[activeMetric];
                    return (
                      <div className="rounded-xl border border-[#ECEAF5] bg-white px-3 py-1.5 shadow-[0_4px_16px_rgba(101,56,245,0.12)] text-center animate-in fade-in-50 zoom-in-95">
                        <span className="block text-[10px] font-medium text-[#7A7F93]">
                          {pt.date}, 2024
                        </span>
                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                          <span className="size-1.5 rounded-full bg-[#6538F5]" />
                          <span className="text-xs font-bold text-[#110D27]">
                            {metricConfig.tooltipFormatter(val)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey={metricConfig.dataKey}
                stroke="#6538F5"
                strokeWidth={2.4}
                fill="url(#salesOverviewGrad)"
                dot={renderCustomDot}
                activeDot={{
                  r: 5,
                  fill: "#6538F5",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-[#6538F5] border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
