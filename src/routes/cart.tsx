import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
} from "lucide-react";
import { useState } from "react";
import { getProduct, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Your Cart — Vendora Marketplace" },
      {
        name: "description",
        content: "Review and manage the items in your Vendora shopping cart.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CartPage() {
  const { cartItems, setQty, removeFromCart, clearCart, hydrated } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const entries = Object.entries(cartItems)
    .map(([id, qty]) => ({ id, qty, product: getProduct(id) }))
    .filter((e): e is { id: string; qty: number; product: Product } => Boolean(e.product));

  const subtotal = entries.reduce((sum, e) => sum + e.product.price * e.qty, 0);
  const shippingFee = subtotal >= 499 || entries.length === 0 ? 0 : 79;
  const couponDiscount = appliedCoupon === "VENDORA10" ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal + shippingFee - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleaned = couponCode.trim().toUpperCase();
    if (cleaned === "VENDORA10" || cleaned === "WELCOME10") {
      setAppliedCoupon("VENDORA10");
      setCouponError("");
    } else if (cleaned === "") {
      setCouponError("Please enter a promo code");
    } else {
      setCouponError("Invalid promo code. Try 'VENDORA10' for 10% off");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleImgError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  if (hydrated && entries.length === 0) {
    return (
      <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="grid size-20 place-items-center rounded-3xl bg-primary-soft text-primary shadow-soft">
          <ShoppingBag className="size-10" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Looks like you haven't added any items to your cart yet. Explore thousands of verified
          products from independent stores.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-200 hover:bg-primary-dark active:scale-98"
        >
          <span>Start Shopping</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      {/* Header & Actions */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Shopping Cart
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {entries.length} {entries.length === 1 ? "product" : "products"} in your cart
          </p>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-destructive"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-10">
        {/* Left Column: Cart Items List */}
        <div className="space-y-4">
          <ul className="space-y-4" aria-label="Cart items">
            {entries.map(({ id, qty, product }) => {
              const maxStock = product.stockCount ?? 99;
              const isAtMaxStock = qty >= maxStock;
              const itemTotal = product.price * qty;

              return (
                <li
                  key={id}
                  className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft transition-all sm:flex-row sm:items-center sm:gap-5"
                >
                  {/* Item Image with Fallback */}
                  <Link
                    to="/product/$id"
                    params={{ id }}
                    className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                  >
                    <img
                      src={
                        imgErrors[id]
                          ? `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f5f3ff"/><text x="50%" y="55%" font-family="system-ui" font-size="12" font-weight="bold" fill="%237c3aed" text-anchor="middle">${encodeURIComponent(product.category.toUpperCase())}</text></svg>`
                          : product.image
                      }
                      alt={product.name}
                      width={80}
                      height={80}
                      onError={() => handleImgError(id)}
                      className="size-full object-cover"
                    />
                  </Link>

                  {/* Item Meta */}
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/product/$id"
                      params={{ id }}
                      className="line-clamp-1 text-sm font-bold text-foreground transition-colors hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Sold by{" "}
                      <span className="font-medium text-foreground">{product.storeName}</span>
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-foreground">
                        {formatINR(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <del className="text-xs text-muted-foreground">
                          {formatINR(product.originalPrice)}
                        </del>
                      )}
                    </div>

                    {isAtMaxStock && (
                      <p className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        Max available stock ({maxStock}) reached
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper with Stock Limit */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t pt-3 sm:border-t-0 sm:pt-0">
                    <div className="flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 shadow-soft">
                      <button
                        type="button"
                        onClick={() => setQty(id, qty - 1)}
                        aria-label={`Decrease quantity of ${product.name}`}
                        className="grid size-7 place-items-center rounded-full text-foreground hover:bg-accent disabled:opacity-40"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-foreground">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAtMaxStock) {
                            setQty(id, qty + 1);
                          }
                        }}
                        disabled={isAtMaxStock}
                        aria-label={`Increase quantity of ${product.name}`}
                        className="grid size-7 place-items-center rounded-full text-foreground hover:bg-accent disabled:opacity-40"
                        title={
                          isAtMaxStock ? `Max available stock (${maxStock}) reached` : undefined
                        }
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <span className="w-20 text-right text-sm font-extrabold text-foreground sm:text-base">
                      {formatINR(itemTotal)}
                    </span>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(id)}
                      aria-label={`Remove ${product.name} from cart`}
                      className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Remove from cart"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <aside className="h-fit rounded-3xl border bg-card p-6 shadow-soft">
          <h2 className="text-base font-bold text-foreground">Order Summary</h2>

          {/* Promo Code Form */}
          <form onSubmit={handleApplyCoupon} className="mt-4">
            <label htmlFor="coupon" className="text-xs font-semibold text-muted-foreground">
              Promo or Gift Code
            </label>
            <div className="mt-1.5 flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  id="coupon"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. VENDORA10"
                  disabled={Boolean(appliedCoupon)}
                  className="w-full rounded-full border bg-background py-2 pl-9 pr-3 text-xs uppercase tracking-wider outline-none placeholder:normal-case placeholder:tracking-normal focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                />
              </div>
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="rounded-full border border-destructive/40 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-full bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  Apply
                </button>
              )}
            </div>
            {couponError && <p className="mt-1 text-[11px] text-destructive">{couponError}</p>}
            {appliedCoupon && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-success">
                <Check className="size-3" />
                Promo code 10% discount applied!
              </p>
            )}
          </form>

          {/* Pricing Breakdown */}
          <dl className="mt-5 space-y-2.5 border-t pt-4 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items Subtotal</dt>
              <dd className="font-semibold text-foreground">{formatINR(subtotal)}</dd>
            </div>

            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estimated Delivery</dt>
              <dd className="font-semibold text-foreground">
                {shippingFee === 0 ? (
                  <span className="text-success font-bold">FREE</span>
                ) : (
                  formatINR(shippingFee)
                )}
              </dd>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-success">
                <dt className="font-medium">Promo Discount (10%)</dt>
                <dd className="font-bold">- {formatINR(couponDiscount)}</dd>
              </div>
            )}

            <div className="flex justify-between border-t pt-3 text-sm">
              <dt className="font-extrabold text-foreground">Estimated Total</dt>
              <dd className="font-extrabold text-foreground sm:text-base">{formatINR(total)}</dd>
            </div>
          </dl>

          {subtotal < 499 && (
            <p className="mt-3 rounded-lg bg-primary-soft/60 p-2.5 text-center text-[11px] font-medium text-primary">
              Add {formatINR(499 - subtotal)} more for <strong>FREE Doorstep Delivery</strong>!
            </p>
          )}

          {/* Checkout Button */}
          <button
            type="button"
            disabled
            title="Demo checkout preview"
            className="mt-5 w-full cursor-not-allowed rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground opacity-75 shadow-soft"
          >
            Proceed to Checkout
          </button>
          <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
            Demo experience — payment gateway integration active in production.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 border-t pt-4 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-4 text-success" />
            <span>Vendora Safe Checkout & Encrypted Payment</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
