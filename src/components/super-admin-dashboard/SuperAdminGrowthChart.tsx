import { useState, useEffect } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PLATFORM_GROWTH_DATA, type GrowthDataPoint } from "@/lib/super-admin-dashboard-data";
import { ChevronDown } from "lucide-react";

export function SuperAdminGrowthChart() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<string>("Last 6 Months");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-5 shadow-2xs">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-extrabold text-[#101438]">Platform Growth</h2>

        {/* Period Selector */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-[#E8EAF5] bg-[#F8F8FF] px-2.5 py-1 text-xs font-semibold text-[#101438] hover:bg-[#FFFFFF]"
          >
            <span>{period}</span>
            <ChevronDown className="size-3.5 text-[#626E9D]" />
          </button>
        </div>
      </div>

      {/* Compact Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold text-[#626E9D] mb-1">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-xs bg-[#6538F5]" />
          <span>New Stores</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-xs bg-[#C4B5FD]" />
          <span>New Vendors</span>
        </div>
      </div>

      {/* Recharts Bar Container */}
      <div className="mt-2 h-[260px] w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={PLATFORM_GROWTH_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EAF5" />

              <XAxis
                dataKey="month"
                stroke="#626E9D"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E8EAF5" }}
              />

              <YAxis stroke="#626E9D" fontSize={11} tickLine={false} axisLine={false} />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]?.payload as GrowthDataPoint;
                    return (
                      <div className="rounded-xl border border-[#E8EAF5] bg-[#FFFFFF] p-2.5 shadow-card text-xs">
                        <div className="font-bold text-[#101438] mb-1">{data.month} Growth</div>
                        <div className="flex items-center gap-2 text-[#6538F5]">
                          <span className="size-2 rounded-full bg-[#6538F5]" />
                          <span>
                            New Stores: <strong>{data.newStores}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#7C3AED] mt-0.5">
                          <span className="size-2 rounded-full bg-[#C4B5FD]" />
                          <span>
                            New Vendors: <strong>{data.newVendors}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar dataKey="newStores" fill="#6538F5" radius={[4, 4, 0, 0]} maxBarSize={18} />

              <Bar dataKey="newVendors" fill="#C4B5FD" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#626E9D]">
            Loading growth metrics...
          </div>
        )}
      </div>
    </div>
  );
}
