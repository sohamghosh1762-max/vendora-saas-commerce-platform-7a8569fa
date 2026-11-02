import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  ShoppingBag,
  Copy,
  Check,
  Calendar,
  Clock,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { getCustomerOrderById } from "@/lib/order-storage";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order-confirmation/$id")({
  loader: ({ params }) => {
    const order = getCustomerOrderById(params.id);
    return { order, orderId: params.id };
  },
  component: OrderConfirmationPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.order
          ? `Order ${loaderData.order.orderId} Confirmed — Vendora`
          : "Order Confirmation — Vendora",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function OrderConfirmationPage() {
  const { order, orderId } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!order) {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="grid size-20 place-items-center rounded-3xl bg-muted text-muted-foreground shadow-soft">
          <Package className="size-10" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Order Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't locate an order with ID{" "}
          <code className="font-mono font-bold text-foreground">{orderId}</code>. The order might
          have been placed in a different browser session.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-dark"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/cart"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <span>Go to Cart</span>
          </Link>
        </div>
      </section>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-muted/20 pb-16 pt-8 sm:pb-24 sm:pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Success Header Card */}
        <section className="overflow-hidden rounded-3xl border bg-card p-6 shadow-soft sm:p-10 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-success/15 text-success shadow-soft">
            <CheckCircle2 className="size-10" />
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
            <ShieldCheck className="size-3.5" />
            <span>Demo Order Placed Successfully</span>
          </span>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Thank you, {order.customer.fullName.split(" ")[0]}!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Your demo order has been confirmed. A simulated order receipt and confirmation have been
            recorded in your local session.
          </p>

          {/* Order ID & Copy Bar */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border bg-muted/50 p-2 text-xs sm:px-4 sm:py-2.5">
            <span className="text-muted-foreground">Order Reference:</span>
            <span className="font-mono font-extrabold text-foreground sm:text-sm">
              {order.orderId}
            </span>
            <button
              type="button"
              onClick={handleCopyOrderId}
              aria-label="Copy Order ID"
              className="inline-flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-accent transition"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-success" />
                  <span className="text-success">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Demo Sandbox Alert */}
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft/40 p-3.5 text-xs text-muted-foreground">
            <span className="font-bold text-primary">DEMO TRANSACTION: </span>
            This order was created in simulation mode for evaluation. No real payment was processed
            and no physical items will be shipped.
          </div>
        </section>

        {/* Order Details Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Shipping & Recipient Card */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-3 border-b pb-4">
              <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
                <MapPin className="size-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground">Delivery Information</h2>
                <p className="text-xs text-muted-foreground">Recipient & shipping destination</p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <p className="font-bold text-foreground text-sm">{order.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.addressLine}
                {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                <span className="font-semibold text-foreground">
                  {order.shippingAddress.pinCode}
                </span>
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>

              <div className="pt-3 border-t space-y-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Phone:</strong> +91{" "}
                  {order.shippingAddress.phone}
                </p>
                <p>
                  <strong className="text-foreground">Email:</strong> {order.shippingAddress.email}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Card */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-6">
            {/* Delivery Method */}
            <div>
              <div className="flex items-center gap-3 border-b pb-3">
                <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Truck className="size-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Delivery Method</h2>
                  <p className="text-xs text-muted-foreground">{order.deliveryMethod.name}</p>
                </div>
              </div>

              <div className="mt-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Arrival:</span>
                  <span className="font-bold text-foreground">
                    {order.deliveryMethod.estimatedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Speed:</span>
                  <span className="font-semibold text-foreground">
                    {order.deliveryMethod.estimatedDays}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee:</span>
                  <span className="font-bold text-foreground">
                    {order.deliveryMethod.fee === 0 ? (
                      <span className="text-success font-bold">FREE</span>
                    ) : (
                      formatINR(order.deliveryMethod.fee)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="flex items-center gap-3 border-b pb-3">
                <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
                  {order.payment.method === "cod" ? (
                    <Banknote className="size-5 text-success" />
                  ) : order.payment.method === "upi" ? (
                    <QrCode className="size-5 text-primary" />
                  ) : (
                    <CreditCard className="size-5 text-primary" />
                  )}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Payment Details</h2>
                  <p className="text-xs uppercase text-muted-foreground font-semibold">
                    {order.payment.method === "cod"
                      ? "Cash on Delivery"
                      : order.payment.method === "upi"
                        ? "UPI Payment (Demo)"
                        : "Credit / Debit Card (Demo)"}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span
                    className={cn(
                      "font-bold",
                      order.payment.status === "CONFIRMED_DEMO"
                        ? "text-success"
                        : "text-warning-foreground",
                    )}
                  >
                    {order.payment.status === "CONFIRMED_DEMO"
                      ? "Demo Confirmed"
                      : "Pending on Doorstep Delivery"}
                  </span>
                </div>
                {order.payment.upiId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UPI ID:</span>
                    <span className="font-mono text-foreground">{order.payment.upiId}</span>
                  </div>
                )}
                {order.payment.cardLast4 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Card:</span>
                    <span className="font-mono text-foreground">
                      •••• •••• •••• {order.payment.cardLast4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="mt-8 rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-base font-bold text-foreground">
              Purchased Items ({order.items.reduce((s, i) => s + i.qty, 0)})
            </h2>
            <span className="text-xs text-muted-foreground">{orderDate}</span>
          </div>

          <ul className="mt-4 divide-y" aria-label="Order items">
            {order.items.map((item) => {
              const itemTotal = item.price * item.qty;
              return (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="size-16 rounded-2xl object-cover bg-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/product/$id"
                      params={{ id: item.id }}
                      className="font-bold text-xs sm:text-sm text-foreground hover:text-primary transition line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Sold by: <span className="font-medium text-foreground">{item.storeName}</span>
                    </p>
                    {item.selectedVariants && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(item.selectedVariants).map(([key, val]) => (
                          <span
                            key={key}
                            className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty: {item.qty} × {formatINR(item.price)}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-extrabold text-foreground">
                    {formatINR(itemTotal)}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Price Breakdown */}
          <div className="mt-6 border-t pt-5">
            <dl className="max-w-xs ml-auto space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items Subtotal</dt>
                <dd className="font-semibold text-foreground">
                  {formatINR(order.priceBreakdown.subtotal)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery Fee</dt>
                <dd className="font-semibold text-foreground">
                  {order.priceBreakdown.deliveryFee === 0 ? (
                    <span className="text-success font-bold">FREE</span>
                  ) : (
                    formatINR(order.priceBreakdown.deliveryFee)
                  )}
                </dd>
              </div>

              {order.priceBreakdown.couponDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <dt className="font-medium">
                    Promo Discount ({order.priceBreakdown.couponCode || "VENDORA10"})
                  </dt>
                  <dd className="font-bold">- {formatINR(order.priceBreakdown.couponDiscount)}</dd>
                </div>
              )}

              <div className="flex justify-between border-t pt-3 text-sm">
                <dt className="font-extrabold text-foreground">Total Paid</dt>
                <dd className="font-extrabold text-foreground sm:text-base">
                  {formatINR(order.priceBreakdown.total)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border bg-card px-6 py-3 text-xs font-semibold text-foreground hover:bg-accent transition"
          >
            <Printer className="size-4" />
            <span>Print Receipt</span>
          </button>

          <Link
            to="/shop"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-8 py-3 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark active:scale-98"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
