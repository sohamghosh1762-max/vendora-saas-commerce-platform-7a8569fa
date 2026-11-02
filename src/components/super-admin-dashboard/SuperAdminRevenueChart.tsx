import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  REVENUE_DAILY_DATA,
  REVENUE_WEEKLY_DATA,
  REVENUE_MONTHLY_DATA,
  REVENUE_YEARLY_DATA,
  type RevenueDataPoint,
} from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

type Timeframe = "Daily" | "Weekly" | "Monthly" | "Yearly";

export function SuperAdminRevenueChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("Daily");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = {
    Daily: REVENUE_DAILY_DATA,
    Weekly: REVENUE_WEEKLY_DATA,
    Monthly: REVENUE_MONTHLY_DATA,
    Yearly: REVENUE_YEARLY_DATA,
  }[timeframe];

  const formatYAxis = (val: number) => {
    if (val === 0) return "₹0";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-5 shadow-2xs">
      {/* Chart Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
        <div>
          <h2 className="text-base font-extrabold text-[#101438]">Revenue Overview</h2>
          <p className="mt-0.5 text-xs text-[#626E9D]">
            Consolidated platform revenue across all merchant storefronts
          </p>
        </div>

        {/* Segmented Timeframe Selector: Daily | Weekly | Monthly | Yearly */}
        <div className="inline-flex rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] p-1 text-xs">
          {(["Daily", "Weekly", "Monthly", "Yearly"] as Timeframe[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTimeframe(tab)}
              className={cn(
                "rounded-lg px-3 py-1 font-semibold transition-all",
                timeframe === tab
                  ? "bg-[#6538F5] text-white shadow-xs"
                  : "text-[#626E9D] hover:text-[#101438]",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="mt-2 h-[260px] w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6538F5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6538F5" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EAF5" />

              <XAxis
                dataKey="date"
                stroke="#626E9D"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E8EAF5" }}
              />

              <YAxis
                stroke="#626E9D"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]?.payload as RevenueDataPoint;
                    return (
                      <div className="rounded-xl border border-[#E8EAF5] bg-[#FFFFFF] p-2.5 shadow-card text-xs">
                        <div className="font-semibold text-[#626E9D]">{data.date}, 2024</div>
                        <div className="mt-1 text-sm font-extrabold text-[#6538F5]">
                          ₹{data.revenue.toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-[#626E9D] mt-0.5">
                          {data.orders.toLocaleString()} total orders
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6538F5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{
                  r: 6,
                  fill: "#6538F5",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#626E9D]">
            Loading revenue trends...
          </div>
        )}
      </div>
    </div>
  );
}
