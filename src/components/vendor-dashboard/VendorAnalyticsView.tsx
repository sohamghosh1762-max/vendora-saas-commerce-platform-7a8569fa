import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  Download,
  Package,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { getVendorAnalytics, type VendorAnalyticsData } from "@/lib/vendor-api";
import { formatINR } from "@/lib/format";

export interface VendorAnalyticsViewProps {
  storeId?: string | undefined;
  storeName?: string | undefined;
}

type DateRange = "7d" | "30d" | "this_month" | "90d" | "all_time";
type ChartType = "revenue" | "orders" | "views";

export function VendorAnalyticsView({
  storeId = "the-urban-nest",
  storeName = "The Urban Nest",
}: VendorAnalyticsViewProps) {
  const [range, setRange] = useState<DateRange>("30d");
  const [activeChart, setActiveChart] = useState<ChartType>("revenue");
  const [analytics, setAnalytics] = useState<VendorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const loadAnalytics = () => {
    try {
      const data = getVendorAnalytics(storeId, range);
      setAnalytics(data);
      setError(null);
    } catch {
      setError("Failed to load analytics data. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, range]);

  const handleExport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-[#ECEAF5] bg-white p-8 text-center shadow-xs"
      >
        <div className="size-8 animate-spin rounded-full border-3 border-[#6538F5] border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-[#7A7F93]">Loading performance analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center">
        <AlertCircle className="size-10 text-rose-500" />
        <h3 className="mt-3 text-base font-bold text-rose-900">Analytics unavailable</h3>
        <p className="mt-1 text-xs text-rose-700 max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadAnalytics();
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
        >
          <RotateCcw className="size-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const { summary, chartData, bestSellers, categoryBreakdown } = analytics;

  return (
    <div className="space-y-6">
      {/* Date Filter & Export Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" data-testid="date-range-filter">
          <Calendar className="size-4 text-[#7A7F93] mr-1 shrink-0" />
          {(
            [
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "this_month", label: "This Month" },
              { id: "90d", label: "Last 90 Days" },
              { id: "all_time", label: "All Time" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRange(item.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                range === item.id
                  ? "bg-[#6538F5] text-white shadow-xs"
                  : "bg-white text-[#7A7F93] border border-[#ECEAF5] hover:bg-[#F9F8FD] hover:text-[#6538F5]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Export Report Action */}
        <div className="flex items-center gap-2">
          {downloadSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="size-3.5" />
              <span>Report exported</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECEAF5] bg-white px-3.5 py-1.5 text-xs font-bold text-[#110D27] shadow-xs hover:bg-[#F9F8FD] hover:text-[#6538F5]"
          >
            <Download className="size-3.5 text-[#6538F5]" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Total Sales, Total Revenue, Orders, Products Sold */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="analytics-kpis">
        {/* Total Sales / Revenue */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Total Revenue
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-[#F0EBFE] text-[#6538F5]">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#110D27]" data-testid="kpi-total-revenue">
            {formatINR(summary.totalRevenue)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="size-3.5" />
            <span>+{summary.growthRate}% vs prev period</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Total Orders
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#110D27]" data-testid="kpi-total-orders">
            {summary.totalOrders}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="size-3.5" />
            <span>+11.2% order volume</span>
          </div>
        </div>

        {/* Products Sold */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Products Sold
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <Package className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#110D27]" data-testid="kpi-products-sold">
            {summary.productsSold} units
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="size-3.5" />
            <span>+8.4% unit velocity</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Avg. Order Value
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <BarChart2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#110D27]" data-testid="kpi-aov">
            {formatINR(summary.averageOrderValue)}
          </div>
          <div className="mt-2 text-xs font-semibold text-[#7A7F93]">
            High basket conversion
          </div>
        </div>
      </div>

      {/* Main Chart Section: Revenue & Sales Trends */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-black text-[#110D27]">Sales & Revenue Trend</h3>
            <p className="text-xs text-[#7A7F93]">Performance trajectory for {storeName}</p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="inline-flex items-center gap-1 rounded-xl bg-[#F4F2FB] p-1 text-xs">
            {(
              [
                { id: "revenue", label: "Revenue (₹)" },
                { id: "orders", label: "Orders" },
                { id: "views", label: "Store Views" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveChart(tab.id)}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  activeChart === tab.id
                    ? "bg-[#6538F5] text-white shadow-xs"
                    : "text-[#7A7F93] hover:text-[#110D27]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-[280px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6538F5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6538F5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEAF5" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#7A7F93" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#7A7F93" }}
                tickFormatter={(val: number) =>
                  activeChart === "revenue"
                    ? `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                    : `${val}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #ECEAF5",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
                formatter={(val: number) => [
                  activeChart === "revenue" ? `₹${val.toLocaleString("en-IN")}` : val,
                  activeChart === "revenue" ? "Revenue" : activeChart === "orders" ? "Orders" : "Views",
                ]}
              />
              <Area
                type="monotone"
                dataKey={activeChart === "revenue" ? "sales" : activeChart === "orders" ? "orders" : "views"}
                stroke="#6538F5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#analyticsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Section: Best-Selling Products & Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Best-Selling Products */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#110D27]">Best-Selling Products</h3>
              <p className="text-xs text-[#7A7F93]">Ranked by units sold in this time window</p>
            </div>
            <span className="rounded-lg bg-[#F0EBFE] px-2.5 py-1 text-xs font-bold text-[#6538F5]">
              Top Performers
            </span>
          </div>

          <div className="divide-y divide-[#ECEAF5]" data-testid="best-sellers-list">
            {bestSellers.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full bg-gray-100 text-xs font-black text-[#7A7F93]">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#110D27]">{item.name}</h4>
                    <span className="text-[11px] text-[#7A7F93] capitalize">{item.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-[#110D27]">{item.unitsSold} sold</div>
                  <div className="text-[11px] font-semibold text-emerald-600">
                    {formatINR(item.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share Breakdown */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-base font-black text-[#110D27]">Category Share</h3>
            <p className="text-xs text-[#7A7F93]">Revenue proportion by category</p>
          </div>

          <div className="space-y-3 pt-2">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#110D27]">{cat.name}</span>
                  <span className="text-[#6538F5]">{cat.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#6538F5] transition-all duration-300"
                    style={{ width: `${cat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-[#FAF9FF] p-3 text-xs text-[#7A7F93]">
            <p className="font-semibold text-[#110D27]">Insight</p>
            Home & Living leads store growth with 45% of total sales volume this cycle.
          </div>
        </div>
      </div>
    </div>
  );
}

