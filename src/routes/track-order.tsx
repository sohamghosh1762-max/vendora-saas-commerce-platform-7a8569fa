import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Search,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Info,
  XCircle,
} from "lucide-react";
import { getCustomerOrderById, getCustomerOrders } from "@/lib/order-storage";
import { useCustomerAuth } from "@/lib/customer-context";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CustomerOrder, OrderStatus } from "@/lib/order-types";

export interface TrackOrderSearch {
  orderId?: string | undefined;
}

export const Route = createFileRoute("/track-order")({
  validateSearch: (search: Record<string, unknown>): TrackOrderSearch => {
    const orderId = search["orderId"];
    return {
      orderId: typeof orderId === "string" ? orderId.trim() : undefined,
    };
  },
  component: TrackOrderPage,
  head: () => ({
    meta: [
      { title: "Live Order Tracking — Vendora Marketplace" },
      {
        name: "description",
        content:
          "Track your Vendora order delivery status, milestones, and estimated delivery dates.",
      },
    ],
  }),
});

interface TimelineStage {
  key: OrderStatus;
  label: string;
  description: string;
}

const TIMELINE_STAGES: TimelineStage[] = [
  {
    key: "Placed",
    label: "Order Placed",
    description: "Your order details have been securely recorded.",
  },
  {
    key: "Confirmed",
    label: "Order Confirmed",
    description: "Store confirmed receipt and payment status.",
  },
  {
    key: "Processing",
    label: "Processing & Packing",
    description: "Store merchant is inspecting and boxing your items.",
  },
  {
    key: "Shipped",
    label: "Shipped",
    description: "Handed over to carrier for inter-city dispatch.",
  },
  {
    key: "Out for Delivery",
    label: "Out for Delivery",
    description: "Courier executive is en route to your doorstep.",
  },
  {
    key: "Delivered",
    label: "Delivered",
    description: "Package safely handed to recipient at destination.",
  },
];

const STAGE_ORDER: Record<string, number> = {
  Placed: 1,
  Confirmed: 2,
  Processing: 3,
  Shipped: 4,
  "Out for Delivery": 5,
  Delivered: 6,
};

export function TrackOrderPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { customer, isAuthenticated } = useCustomerAuth();

  const [searchInput, setSearchInput] = useState(() => search.orderId || "");
  const [copied, setCopied] = useState(false);

  // Sync state if URL query param changes
  useEffect(() => {
    if (search.orderId && search.orderId !== searchInput) {
      setSearchInput(search.orderId);
    }
  }, [search.orderId, searchInput]);

  // Query order from local storage
  const activeOrder = useMemo<CustomerOrder | undefined>(() => {
    const id = search.orderId || searchInput;
    if (!id.trim()) return undefined;
    return getCustomerOrderById(id.trim());
  }, [search.orderId, searchInput]);

  // Get recent orders list for quick demonstration test clicks
  const recentOrders = useMemo(() => {
    return getCustomerOrders().slice(0, 4);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    navigate({
      to: "/track-order",
      search: { orderId: searchInput.trim().toUpperCase() },
    });
  };

  const handleCopyOrderId = (id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine stage progression
  const currentStageIndex = useMemo(() => {
    if (!activeOrder) return 0;
    if (activeOrder.orderStatus === "Cancelled") return -1;
    return STAGE_ORDER[activeOrder.orderStatus] || 2;
  }, [activeOrder]);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background pb-16 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to={isAuthenticated ? "/account" : "/shop"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>{isAuthenticated ? "Back to Account Hub" : "Back to Storefront"}</span>
          </Link>

          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Simulated Delivery Tracking
          </span>
        </div>

        {/* Search Order Bar Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
            Track Your Vendora Order
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Enter your Vendora Order ID (e.g. VD-DEMO-9415) to check live simulated delivery stages.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Order ID (e.g. VD-DEMO-9415)..."
                className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-4 text-xs font-mono uppercase outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark active:scale-98"
            >
              <span>Track Order</span>
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Quick Demo Order Links */}
          {recentOrders.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Recent demo orders:</span>
              {recentOrders.map((ro) => (
                <button
                  key={ro.orderId}
                  type="button"
                  onClick={() => {
                    setSearchInput(ro.orderId);
                    navigate({
                      to: "/track-order",
                      search: { orderId: ro.orderId },
                    });
                  }}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-[11px] font-mono font-bold transition",
                    ro.orderId === (activeOrder?.orderId || searchInput)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent text-foreground",
                  )}
                >
                  {ro.orderId} ({ro.orderStatus})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tracking Details View */}
        {activeOrder ? (
          <div className="mt-8 space-y-6 animate-fadeIn">
            {/* Order Overview Header Card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <div className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-foreground sm:text-lg">
                      {activeOrder.orderId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOrderId(activeOrder.orderId)}
                      title="Copy Order ID"
                      className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition"
                    >
                      {copied ? (
                        <Check className="size-4 text-success" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed on{" "}
                    {new Date(activeOrder.createdAt).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Estimated Delivery
                    </span>
                    <span className="text-sm font-extrabold text-foreground">
                      {activeOrder.estimatedDeliveryDate}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "rounded-2xl px-3.5 py-1.5 text-xs font-bold",
                      activeOrder.orderStatus === "Delivered"
                        ? "bg-success/15 text-success"
                        : activeOrder.orderStatus === "Cancelled"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-primary/10 text-primary",
                    )}
                  >
                    {activeOrder.orderStatus}
                  </span>
                </div>
              </div>

              {/* Cancelled Banner State */}
              {activeOrder.orderStatus === "Cancelled" ? (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive"
                >
                  <XCircle className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-sm font-bold">This Order Has Been Cancelled</h2>
                    <p className="mt-1 text-xs leading-relaxed text-destructive/90">
                      This order was cancelled and is no longer moving through delivery. If any
                      charges were simulated, no funds have been deducted.
                    </p>
                  </div>
                </div>
              ) : (
                /* 6-Stage Visual Timeline */
                <div className="mt-8">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-6">
                    Delivery Milestones
                  </h2>

                  <div className="relative">
                    <div className="space-y-8">
                      {TIMELINE_STAGES.map((stage, idx) => {
                        const stageNumber = idx + 1;
                        const isCompleted = currentStageIndex >= stageNumber;
                        const isCurrent = currentStageIndex === stageNumber;
                        const isPending = currentStageIndex < stageNumber;

                        // Check if a timestamp is available for this stage
                        const recordedTime = activeOrder.statusTimestamps?.[stage.key];

                        return (
                          <div key={stage.key} className="relative flex items-start gap-4 sm:gap-6">
                            {/* Connector Line between stages */}
                            {idx < TIMELINE_STAGES.length - 1 && (
                              <span
                                className={cn(
                                  "absolute left-4 top-8 -bottom-8 w-0.5 sm:left-5",
                                  isCompleted && !isCurrent
                                    ? "bg-success"
                                    : isCurrent
                                      ? "bg-gradient-to-b from-primary to-border"
                                      : "border-l-2 border-dashed border-border/80",
                                )}
                                aria-hidden="true"
                              />
                            )}

                            {/* Stage Icon Node */}
                            <div className="relative z-10 shrink-0">
                              {isCompleted && !isCurrent ? (
                                <div className="grid size-8 place-items-center rounded-full bg-success text-success-foreground shadow-xs sm:size-10">
                                  <Check className="size-4 stroke-[3] sm:size-5" />
                                </div>
                              ) : isCurrent ? (
                                <div className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-soft sm:size-10 animate-pulse">
                                  <Truck className="size-4 sm:size-5" />
                                </div>
                              ) : (
                                <div className="grid size-8 place-items-center rounded-full border-2 border-border bg-card text-muted-foreground sm:size-10">
                                  <span className="size-2 rounded-full bg-muted-foreground/40" />
                                </div>
                              )}
                            </div>

                            {/* Stage Content & Timestamp */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={cn(
                                    "text-xs font-bold sm:text-sm",
                                    isCompleted || isCurrent
                                      ? "text-foreground"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {stage.label}
                                </span>

                                <div className="flex items-center gap-2">
                                  {isCurrent && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                                      Active Stage
                                    </span>
                                  )}

                                  {recordedTime && (
                                    <span className="text-[11px] font-medium text-muted-foreground">
                                      {new Date(recordedTime).toLocaleDateString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p
                                className={cn(
                                  "mt-1 text-xs leading-relaxed",
                                  isCompleted || isCurrent
                                    ? "text-muted-foreground"
                                    : "text-muted-foreground/60",
                                )}
                              >
                                {stage.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Courier Simulation Disclaimer */}
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft/30 p-4 text-xs text-muted-foreground">
                <Info className="size-4 shrink-0 text-primary mt-0.5" />
                <p>
                  <strong>Simulated Tracking Disclaimer:</strong> This delivery timeline reflects
                  the order status recorded in your browser's demo storage. Live courier telemetry
                  is simulated for portfolio demonstration and is not connected to a third-party
                  courier API.
                </p>
              </div>

              {/* Navigation Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
                <Link
                  to="/account"
                  search={{ tab: "orders", orderId: activeOrder.orderId }}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-bold text-foreground hover:bg-accent transition"
                >
                  <Package className="size-4 text-primary" />
                  <span>View Order Details</span>
                </Link>

                <Link
                  to="/shop"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-7 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary-dark transition active:scale-98"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Delivery Address and Items Summary */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Shipping Address */}
              <div className="rounded-3xl border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="size-4 text-primary" />
                  <span>Destination Address</span>
                </div>
                <p className="mt-3 text-xs font-bold text-foreground">
                  {activeOrder.shippingAddress.fullName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activeOrder.shippingAddress.addressLine}
                  {activeOrder.shippingAddress.apartment
                    ? `, ${activeOrder.shippingAddress.apartment}`
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} -{" "}
                  {activeOrder.shippingAddress.pinCode}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ph: +91 {activeOrder.shippingAddress.phone}
                </p>
              </div>

              {/* Shipping Method & Carrier */}
              <div className="rounded-3xl border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Truck className="size-4 text-primary" />
                  <span>Dispatch & Courier</span>
                </div>
                <p className="mt-3 text-xs font-bold text-foreground">
                  {activeOrder.deliveryMethod.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activeOrder.deliveryMethod.description}
                </p>
                <p className="mt-2 text-xs font-semibold text-foreground">
                  Estimated Delivery: {activeOrder.estimatedDeliveryDate}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total Items: {activeOrder.items.reduce((s, i) => s + i.qty, 0)} • Amount:{" "}
                  {formatINR(activeOrder.priceBreakdown.total)}
                </p>
              </div>
            </div>
          </div>
        ) : search.orderId ? (
          /* Order Not Found State */
          <div className="mt-8 rounded-3xl border border-destructive/30 bg-card p-8 text-center shadow-soft sm:p-12 animate-fadeIn">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            <h2 className="mt-4 text-base font-bold text-foreground">
              Order "{search.orderId}" Not Found
            </h2>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              We couldn't locate this order in local storage. Please verify the ID format (e.g.
              VD-DEMO-9415) or select one of your existing orders from your account.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/account"
                search={{ tab: "orders" }}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary-dark transition"
              >
                <span>View My Orders</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition"
              >
                <span>Clear Search</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
