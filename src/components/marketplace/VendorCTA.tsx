import { Link } from "@tanstack/react-router";
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
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const salesData = [
  { month: "Jan", sales: 42000 },
  { month: "Feb", sales: 58000 },
  { month: "Mar", sales: 52000 },
  { month: "Apr", sales: 76000 },
  { month: "May", sales: 91000 },
  { month: "Jun", sales: 124000 },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Package, label: "Products" },
  { icon: ShoppingCart, label: "Orders" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Users, label: "Customers" },
  { icon: Wallet, label: "Payouts" },
];

const stats = [
  { value: "320", label: "Products", delta: "+15%" },
  { value: "56", label: "Orders", delta: "+14%" },
  { value: "12,450", label: "Store Views", delta: "+22%" },
];

const recentOrders = [
  { id: "#1024", item: "Skincare Set", amount: "₹1,499", status: "Delivered" },
  { id: "#1023", item: "Running Shoes", amount: "₹3,499", status: "Shipped" },
];

/** Static preview of the vendor dashboard — demo data, not a live product. */
function DashboardPreview() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="w-full max-w-xl rounded-3xl bg-card p-4 text-left shadow-lift lg:p-5">
      <div className="flex">
        <aside className="hidden w-40 shrink-0 flex-col gap-1 border-r pr-4 sm:flex">
          <div className="mb-3 scale-90 origin-left">
            <Logo />
          </div>
          {sidebarItems.map((item) => (
            <span
              key={item.label}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium ${
                item.active
                  ? "bg-primary-soft font-semibold text-primary-dark"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </span>
          ))}
        </aside>

        <div className="min-w-0 flex-1 pl-0 sm:pl-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-foreground">Sales Overview</h4>
              <p className="text-xl font-extrabold text-foreground">
                ₹1,24,560{" "}
                <span className="text-xs font-semibold text-success">+10%</span>
              </p>
              <p className="text-[10px] text-muted-foreground">Total Sales · This Month</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">
              <TrendingUp className="size-3" />
              On track
            </span>
          </div>

          <div className="mt-2 h-28">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide domain={["dataMin - 5000", "dataMax + 5000"]} />
                  <Tooltip
                    formatter={(value) => [`₹${(value as number).toLocaleString("en-IN")}`, "Sales"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      fontSize: 11,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#salesFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 border-t pt-3">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-sm font-extrabold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">
                  {s.label} <span className="font-semibold text-success">{s.delta}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 hidden border-t pt-3 sm:block">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Orders
            </p>
            <ul className="space-y-1">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-md bg-muted/60 px-2.5 py-1.5 text-[11px]"
                >
                  <span className="font-semibold text-foreground">{o.id}</span>
                  <span className="text-muted-foreground">{o.item}</span>
                  <span className="font-semibold text-foreground">{o.amount}</span>
                  <span className="rounded-full bg-success/10 px-2 py-0.5 font-semibold text-success">
                    {o.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VendorCTA() {
  return (
    <section className="bg-cta-gradient relative overflow-hidden py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Start Your Online Store
            <span className="block">
              with <span className="text-primary">Vendora</span>
            </span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Join hundreds of independent sellers and reach thousands of customers, with no
            technical hassle, just pure growth.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/become-a-vendor"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-float transition-colors hover:bg-primary-dark"
            >
              Become a Vendor
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              View Pricing
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
