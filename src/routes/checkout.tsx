import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Package,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getProduct, type Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  shippingAddressSchema,
  paymentSelectionSchema,
  INDIAN_STATES,
  type ShippingAddressFormValues,
  type PaymentSelectionFormValues,
} from "@/lib/checkout-schema";
import {
  getDeliveryMethods,
  generateOrderId,
  saveCustomerOrder,
  saveCheckoutDraft,
  getCheckoutDraft,
  clearCheckoutDraft,
} from "@/lib/order-storage";
import type {
  CustomerOrder,
  DeliveryMethodId,
  PaymentMethodType,
  ShippingAddress,
  OrderItem,
} from "@/lib/order-types";
import { getProductVariants } from "@/lib/product-details";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Secure Checkout — Vendora Marketplace" },
      {
        name: "description",
        content: "Complete your purchase securely on Vendora Marketplace.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const STEPS = [
  { id: 1, name: "Delivery Info", label: "Address & Contact" },
  { id: 2, name: "Delivery Method", label: "Speed & Carrier" },
  { id: 3, name: "Payment", label: "Demo Payment" },
  { id: 4, name: "Review Order", label: "Verify & Place" },
] as const;

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart, hydrated, coupon } = useCart();

  // Load existing draft if present
  const [draft] = useState(() => getCheckoutDraft());

  // Checkout step: 1 (Address), 2 (Delivery Method), 3 (Payment), 4 (Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(() => draft?.step ?? 1);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const s = draft?.step ?? 1;
    if (s === 4) return [1, 2, 3];
    if (s === 3) return [1, 2];
    if (s === 2) return [1];
    return [];
  });

  // Delivery options state
  const deliveryMethods = useMemo(() => getDeliveryMethods(), []);
  const [selectedDeliveryMethodId, setSelectedDeliveryMethodId] = useState<DeliveryMethodId>(
    () => draft?.deliveryMethodId ?? "standard",
  );

  // Payment options state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>(
    () => draft?.paymentMethod ?? "cod",
  );
  const [paymentFormValues, setPaymentFormValues] = useState<{
    upiId: string;
    cardholderName: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
  }>(() => ({
    upiId: draft?.paymentForm.upiId ?? "",
    cardholderName: draft?.paymentForm.cardholderName ?? "",
    cardNumber: draft?.paymentForm.cardNumber ?? "",
    cardExpiry: draft?.paymentForm.cardExpiry ?? "",
    cardCvv: draft?.paymentForm.cardCvv ?? "",
  }));
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  // Submitting / order placement state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Shipping Address Form via React Hook Form + Zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: draft?.shippingAddress.fullName ?? "",
      email: draft?.shippingAddress.email ?? "",
      phone: draft?.shippingAddress.phone ?? "",
      addressLine: draft?.shippingAddress.addressLine ?? "",
      apartment: draft?.shippingAddress.apartment ?? "",
      city: draft?.shippingAddress.city ?? "",
      state: draft?.shippingAddress.state ?? "Maharashtra",
      pinCode: draft?.shippingAddress.pinCode ?? "",
      country: draft?.shippingAddress.country ?? "India",
    },
  });

  const addressWatch = watch();

  // Selected delivery method object
  const activeDeliveryMethod = useMemo(
    () =>
      deliveryMethods.find((d) => d.id === selectedDeliveryMethodId) ??
      deliveryMethods[0] ?? {
        id: "standard" as const,
        name: "Standard Delivery",
        description: "Reliable doorstep delivery in 3–5 business days",
        estimatedDays: "3–5 Days",
        estimatedDate: "In 3–5 business days",
        fee: 0,
      },
    [deliveryMethods, selectedDeliveryMethodId],
  );

  // Cart products & quantities
  const cartEntries = useMemo(() => {
    return Object.entries(cartItems)
      .map(([id, qty]) => ({ id, qty, product: getProduct(id) }))
      .filter((e): e is { id: string; qty: number; product: Product } => Boolean(e.product));
  }, [cartItems]);

  // Pricing calculations
  const subtotal = useMemo(
    () => cartEntries.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cartEntries],
  );

  const deliveryFee = activeDeliveryMethod.fee;
  const couponDiscount = coupon === "VENDORA10" ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);

  // Check out of stock items
  const outOfStockItems = useMemo(() => {
    return cartEntries.filter((item) => (item.product.stockCount ?? 1) <= 0);
  }, [cartEntries]);

  // Autosave checkout draft
  useEffect(() => {
    if (cartEntries.length === 0) return;

    saveCheckoutDraft({
      step: currentStep,
      shippingAddress: {
        fullName: addressWatch.fullName ?? "",
        email: addressWatch.email ?? "",
        phone: addressWatch.phone ?? "",
        addressLine: addressWatch.addressLine ?? "",
        apartment: addressWatch.apartment ?? "",
        city: addressWatch.city ?? "",
        state: addressWatch.state ?? "Maharashtra",
        pinCode: addressWatch.pinCode ?? "",
        country: addressWatch.country ?? "India",
      },
      deliveryMethodId: selectedDeliveryMethodId,
      paymentMethod: selectedPaymentMethod,
      paymentForm: paymentFormValues,
      updatedAt: new Date().toISOString(),
    });
  }, [
    currentStep,
    addressWatch,
    selectedDeliveryMethodId,
    selectedPaymentMethod,
    paymentFormValues,
    cartEntries.length,
  ]);

  // Advance from Step 1 to Step 2
  const onAddressSubmit = (data: ShippingAddressFormValues) => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, 1])));
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Advance from Step 2 to Step 3
  const onDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompletedSteps((prev) => Array.from(new Set([...prev, 2])));
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Validate payment and advance from Step 3 to Step 4
  const onPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentErrors({});

    const result = paymentSelectionSchema.safeParse({
      paymentMethod: selectedPaymentMethod,
      upiId: paymentFormValues.upiId,
      cardholderName: paymentFormValues.cardholderName,
      cardNumber: paymentFormValues.cardNumber,
      cardExpiry: paymentFormValues.cardExpiry,
      cardCvv: paymentFormValues.cardCvv,
    });

    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key && typeof key === "string") {
          errs[key] = issue.message;
        }
      });
      setPaymentErrors(errs);
      return;
    }

    setCompletedSteps((prev) => Array.from(new Set([...prev, 3])));
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Order Placement
  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setOrderError(null);

    if (cartEntries.length === 0) {
      setOrderError("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (outOfStockItems.length > 0) {
      setOrderError("Some items in your cart are currently out of stock. Please remove them.");
      return;
    }

    // Verify address
    const addressResult = shippingAddressSchema.safeParse(addressWatch);
    if (!addressResult.success) {
      setOrderError("Please complete all required shipping details.");
      setCurrentStep(1);
      return;
    }

    // Verify payment
    const paymentResult = paymentSelectionSchema.safeParse({
      paymentMethod: selectedPaymentMethod,
      upiId: paymentFormValues.upiId,
      cardholderName: paymentFormValues.cardholderName,
      cardNumber: paymentFormValues.cardNumber,
      cardExpiry: paymentFormValues.cardExpiry,
      cardCvv: paymentFormValues.cardCvv,
    });
    if (!paymentResult.success) {
      setOrderError("Please complete demo payment details.");
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = generateOrderId();
      const shippingAddress: ShippingAddress = addressResult.data;

      // Construct order items
      const items: OrderItem[] = cartEntries.map(({ id, qty, product }) => {
        const variants = getProductVariants(product);
        const selectedVariants: Record<string, string> = {};
        if (variants.length > 0) {
          variants.forEach((v) => {
            const first = v.options[0];
            if (first) {
              selectedVariants[v.name] = first;
            }
          });
        }

        return {
          id,
          name: product.name,
          storeId: product.storeId,
          storeName: product.storeName,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice ?? product.price,
          qty,
          image: product.image,
          selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
        };
      });

      // Construct payment details
      const paymentDetails = {
        method: selectedPaymentMethod,
        status:
          selectedPaymentMethod === "cod"
            ? ("PENDING_ON_DELIVERY" as const)
            : ("CONFIRMED_DEMO" as const),
        upiId: selectedPaymentMethod === "upi" ? paymentFormValues.upiId : undefined,
        cardLast4:
          selectedPaymentMethod === "card"
            ? paymentFormValues.cardNumber.replace(/\s+/g, "").slice(-4) || "4242"
            : undefined,
        cardholderName:
          selectedPaymentMethod === "card" ? paymentFormValues.cardholderName : undefined,
      };

      const newOrder: CustomerOrder = {
        orderId,
        customer: {
          fullName: shippingAddress.fullName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
        },
        shippingAddress,
        items,
        priceBreakdown: {
          subtotal,
          couponCode: coupon,
          couponDiscount,
          deliveryFee,
          total: finalTotal,
        },
        deliveryMethod: activeDeliveryMethod,
        payment: paymentDetails,
        orderStatus: "Confirmed",
        createdAt: new Date().toISOString(),
        estimatedDeliveryDate: activeDeliveryMethod.estimatedDate,
      };

      // Persist order in localStorage
      const saved = saveCustomerOrder(newOrder);
      if (!saved) {
        throw new Error("Failed to save order to local persistence.");
      }

      // Clear draft and cart ONLY after successful order save
      clearCheckoutDraft();
      clearCart();

      // Navigate to order confirmation
      navigate({
        to: "/order-confirmation/$id",
        params: { id: orderId },
      });
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : "An unexpected error occurred while placing order.",
      );
      setIsSubmitting(false);
    }
  };

  // Empty cart view
  if (hydrated && cartEntries.length === 0) {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <span className="grid size-20 place-items-center rounded-3xl bg-primary-soft text-primary shadow-soft">
          <ShoppingBag className="size-10" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Your Cart is Empty
        </h1>
        <p className="mt-2.5 text-sm text-muted-foreground">
          You don't have any items ready for checkout. Explore top-rated products from independent
          verified merchants on Vendora.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-200 hover:bg-primary-dark active:scale-98"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/cart"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <span>View Saved Cart</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-16 pt-6 sm:pb-24 sm:pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/cart" className="hover:text-foreground">
            Cart
          </Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-foreground">Checkout</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Checkout
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Fast, encrypted demo checkout • Step {currentStep} of 4:{" "}
              {STEPS[currentStep - 1]?.name}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
            <ShieldCheck className="size-4 text-success" />
            <span>256-Bit SSL Demo Sandbox</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <nav aria-label="Checkout Progress" className="mt-6">
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {STEPS.map((s) => {
              const isCurrent = currentStep === s.id;
              const isCompleted = completedSteps.includes(s.id);
              const canClick = isCompleted || s.id < currentStep;

              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={!canClick && !isCurrent}
                    onClick={() => {
                      if (canClick) {
                        setCurrentStep(s.id);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-all duration-200 sm:p-3",
                      isCurrent
                        ? "border-primary bg-primary-soft/50 ring-2 ring-primary/20 shadow-xs"
                        : isCompleted
                          ? "border-border/80 bg-card hover:border-primary/50 cursor-pointer"
                          : "border-border/40 bg-card/60 opacity-60 cursor-not-allowed",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-success text-success-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : s.id}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "truncate text-xs font-bold",
                          isCurrent ? "text-primary" : "text-foreground",
                        )}
                      >
                        {s.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground hidden sm:block">
                        {s.label}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Out of stock warning banner */}
        {outOfStockItems.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <div>
              <p className="font-bold">Items Unavailable or Out of Stock</p>
              <p className="mt-0.5">
                The following products in your cart are currently out of stock:{" "}
                {outOfStockItems.map((i) => i.product.name).join(", ")}. Please remove them in your
                cart before placing this order.
              </p>
              <Link
                to="/cart"
                className="mt-2 inline-flex items-center gap-1 font-bold underline hover:no-underline"
              >
                Return to Cart to adjust items
              </Link>
            </div>
          </div>
        )}

        {/* Global order error message */}
        {orderError && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        {/* Main Content Grid: Forms (Left) + Live Sticky Order Summary (Right) */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
          {/* Main Checkout Step Content */}
          <div className="space-y-6">
            {/* STEP 1: Delivery Information Form */}
            {currentStep === 1 && (
              <section className="rounded-3xl border bg-card p-5 sm:p-7 shadow-soft">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">1. Delivery Information</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Where should we deliver your order? Enter your delivery & contact details.
                    </p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
                    <MapPin className="size-5" />
                  </span>
                </div>

                <form onSubmit={handleSubmit(onAddressSubmit)} className="mt-6 space-y-4">
                  {/* Contact Details */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-xs font-semibold text-foreground"
                      >
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        {...register("fullName")}
                        className={cn(
                          "mt-1.5 w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.fullName && "border-destructive bg-destructive/5",
                        )}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-[11px] text-destructive">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-semibold text-foreground"
                      >
                        Mobile Number <span className="text-destructive">*</span>
                      </label>
                      <div className="mt-1.5 flex rounded-xl border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                        <span className="flex items-center border-r px-3 text-xs font-semibold text-muted-foreground">
                          +91
                        </span>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          {...register("phone")}
                          className="w-full bg-transparent px-3 py-2.5 text-xs outline-none"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-[11px] text-destructive">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-foreground">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="e.g. priya@example.com"
                      {...register("email")}
                      className={cn(
                        "mt-1.5 w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.email && "border-destructive bg-destructive/5",
                      )}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Order confirmation, invoices, and shipment tracking will be sent here.
                    </p>
                    {errors.email && (
                      <p className="mt-1 text-[11px] text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Address Line */}
                  <div>
                    <label
                      htmlFor="addressLine"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Street Address / House No. <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="addressLine"
                      type="text"
                      placeholder="e.g. Flat 402, Sunshine Residency, MG Road"
                      {...register("addressLine")}
                      className={cn(
                        "mt-1.5 w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
                        errors.addressLine && "border-destructive bg-destructive/5",
                      )}
                    />
                    {errors.addressLine && (
                      <p className="mt-1 text-[11px] text-destructive">
                        {errors.addressLine.message}
                      </p>
                    )}
                  </div>

                  {/* Apartment / Landmark */}
                  <div>
                    <label
                      htmlFor="apartment"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Apartment, Suite, Unit, Landmark{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      id="apartment"
                      type="text"
                      placeholder="e.g. Near Metro Station / Landmark"
                      {...register("apartment")}
                      className="mt-1.5 w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* City, State, PIN code */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="city" className="block text-xs font-semibold text-foreground">
                        City / Town <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        placeholder="e.g. Mumbai"
                        {...register("city")}
                        className={cn(
                          "mt-1.5 w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.city && "border-destructive bg-destructive/5",
                        )}
                      />
                      {errors.city && (
                        <p className="mt-1 text-[11px] text-destructive">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-xs font-semibold text-foreground"
                      >
                        State <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="state"
                        {...register("state")}
                        className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="mt-1 text-[11px] text-destructive">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="pinCode"
                        className="block text-xs font-semibold text-foreground"
                      >
                        PIN Code <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="pinCode"
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 400001"
                        {...register("pinCode")}
                        className={cn(
                          "mt-1.5 w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
                          errors.pinCode && "border-destructive bg-destructive/5",
                        )}
                      />
                      {errors.pinCode && (
                        <p className="mt-1 text-[11px] text-destructive">
                          {errors.pinCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Country
                    </label>
                    <input
                      id="country"
                      type="text"
                      readOnly
                      defaultValue="India"
                      {...register("country")}
                      className="mt-1.5 w-full rounded-xl border bg-muted/60 px-3.5 py-2.5 text-xs text-muted-foreground outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                    <Link
                      to="/cart"
                      className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Return to Cart</span>
                    </Link>

                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark active:scale-98"
                    >
                      <span>Continue to Delivery Method</span>
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* STEP 2: Delivery Method Selection */}
            {currentStep === 2 && (
              <section className="rounded-3xl border bg-card p-5 sm:p-7 shadow-soft">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">2. Select Delivery Method</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Choose between standard free delivery and express priority courier.
                    </p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Truck className="size-5" />
                  </span>
                </div>

                <form onSubmit={onDeliverySubmit} className="mt-6 space-y-4">
                  <div className="space-y-3" role="radiogroup" aria-label="Delivery options">
                    {deliveryMethods.map((method) => {
                      const isSelected = selectedDeliveryMethodId === method.id;

                      return (
                        <label
                          key={method.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary-soft/40 ring-2 ring-primary/20 shadow-xs"
                              : "border-border bg-card hover:border-primary/40",
                          )}
                        >
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={() => setSelectedDeliveryMethodId(method.id)}
                            className="mt-1 size-4 accent-primary"
                          />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-bold text-foreground">
                                {method.name}
                              </span>
                              <span className="text-sm font-extrabold text-foreground">
                                {method.fee === 0 ? (
                                  <span className="text-success">FREE</span>
                                ) : (
                                  formatINR(method.fee)
                                )}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {method.description}
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                                <Clock className="size-3 text-primary" />
                                Estimated: {method.estimatedDays} ({method.estimatedDate})
                              </span>
                              {method.id === "express" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-0.5 text-[11px] font-bold text-warning-foreground">
                                  <Sparkles className="size-3" />
                                  Fastest Dispatch
                                </span>
                              )}
                              {method.id === "standard" && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-bold text-success">
                                  Most Economical
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Back to Address</span>
                    </button>

                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark active:scale-98"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* STEP 3: Demo Payment Method Selection */}
            {currentStep === 3 && (
              <section className="rounded-3xl border bg-card p-5 sm:p-7 shadow-soft">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">3. Demo Payment Selection</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Simulated demo payment environment. No real funds will be transferred.
                    </p>
                  </div>
                  <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
                    <CreditCard className="size-5" />
                  </span>
                </div>

                {/* DEMO Disclaimer Banner */}
                <div className="mt-5 rounded-2xl border border-primary/30 bg-primary-soft/50 p-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <ShieldCheck className="size-4" />
                    <span>DEMO / NOT ACTUALLY PROCESSED</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    This checkout is running in demo mode. Sensitive payment credentials (real
                    credit card numbers, bank CVVs, or UPI PINs) are never required and will not be
                    stored.
                  </p>
                </div>

                <form onSubmit={onPaymentSubmit} className="mt-6 space-y-4">
                  {/* Payment Options Radio List */}
                  <div className="space-y-3" role="radiogroup" aria-label="Payment methods">
                    {/* COD Option */}
                    <label
                      className={cn(
                        "block cursor-pointer rounded-2xl border p-4 transition-all duration-200",
                        selectedPaymentMethod === "cod"
                          ? "border-primary bg-primary-soft/40 ring-2 ring-primary/20 shadow-xs"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={selectedPaymentMethod === "cod"}
                          onChange={() => setSelectedPaymentMethod("cod")}
                          className="size-4 accent-primary"
                        />
                        <div className="grid size-8 place-items-center rounded-lg bg-accent text-foreground">
                          <Banknote className="size-4 text-success" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground sm:text-sm">
                              Cash on Delivery (COD)
                            </span>
                            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                              Available
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Pay with cash or UPI QR scan at your doorstep upon package arrival.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* UPI Option */}
                    <div
                      className={cn(
                        "rounded-2xl border p-4 transition-all duration-200",
                        selectedPaymentMethod === "upi"
                          ? "border-primary bg-primary-soft/40 ring-2 ring-primary/20 shadow-xs"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={selectedPaymentMethod === "upi"}
                          onChange={() => setSelectedPaymentMethod("upi")}
                          className="size-4 accent-primary"
                        />
                        <div className="grid size-8 place-items-center rounded-lg bg-accent text-foreground">
                          <QrCode className="size-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground sm:text-sm">
                              UPI (Instant Simulation)
                            </span>
                            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                              Google Pay / PhonePe / Paytm
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Simulate UPI intent or VPA address verification.
                          </p>
                        </div>
                      </label>

                      {/* UPI Expanded Fields */}
                      {selectedPaymentMethod === "upi" && (
                        <div className="mt-4 border-t pt-3">
                          <label
                            htmlFor="upiId"
                            className="block text-xs font-semibold text-foreground"
                          >
                            Demo UPI ID / VPA <span className="text-destructive">*</span>
                          </label>
                          <div className="mt-1 flex gap-2">
                            <input
                              id="upiId"
                              type="text"
                              value={paymentFormValues.upiId}
                              onChange={(e) =>
                                setPaymentFormValues((p) => ({ ...p, upiId: e.target.value }))
                              }
                              placeholder="e.g. yourname@okhdfcbank"
                              className={cn(
                                "flex-1 rounded-xl border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
                                paymentErrors["upiId"] && "border-destructive bg-destructive/5",
                              )}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPaymentFormValues((p) => ({
                                  ...p,
                                  upiId: "demo.shopper@okhdfcbank",
                                }))
                              }
                              className="rounded-xl border bg-card px-3 py-2 text-[11px] font-bold text-primary hover:bg-accent"
                            >
                              Fill Demo UPI
                            </button>
                          </div>
                          {paymentErrors["upiId"] && (
                            <p className="mt-1 text-[11px] text-destructive">
                              {paymentErrors["upiId"]}
                            </p>
                          )}
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Demo simulation only. No UPI PIN or payment authentication required.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Option */}
                    <div
                      className={cn(
                        "rounded-2xl border p-4 transition-all duration-200",
                        selectedPaymentMethod === "card"
                          ? "border-primary bg-primary-soft/40 ring-2 ring-primary/20 shadow-xs"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={selectedPaymentMethod === "card"}
                          onChange={() => setSelectedPaymentMethod("card")}
                          className="size-4 accent-primary"
                        />
                        <div className="grid size-8 place-items-center rounded-lg bg-accent text-foreground">
                          <CreditCard className="size-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground sm:text-sm">
                              Credit or Debit Card (Simulated)
                            </span>
                            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-foreground">
                              Visa / RuPay / Mastercard
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Simulated test cards only. Never enter real card data.
                          </p>
                        </div>
                      </label>

                      {/* Card Expanded Fields */}
                      {selectedPaymentMethod === "card" && (
                        <div className="mt-4 space-y-3 border-t pt-3">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setPaymentFormValues((p) => ({
                                  ...p,
                                  cardholderName: "Demo Shopper",
                                  cardNumber: "4242 4242 4242 4242",
                                  cardExpiry: "12/28",
                                  cardCvv: "123",
                                }))
                              }
                              className="text-[11px] font-bold text-primary hover:underline"
                            >
                              ⚡ Auto-Fill Demo Card
                            </button>
                          </div>

                          <div>
                            <label
                              htmlFor="cardholderName"
                              className="block text-xs font-semibold text-foreground"
                            >
                              Name on Card <span className="text-destructive">*</span>
                            </label>
                            <input
                              id="cardholderName"
                              type="text"
                              value={paymentFormValues.cardholderName}
                              onChange={(e) =>
                                setPaymentFormValues((p) => ({
                                  ...p,
                                  cardholderName: e.target.value,
                                }))
                              }
                              placeholder="e.g. Priya Sharma"
                              className={cn(
                                "mt-1 w-full rounded-xl border bg-background px-3.5 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                                paymentErrors["cardholderName"] &&
                                  "border-destructive bg-destructive/5",
                              )}
                            />
                            {paymentErrors["cardholderName"] && (
                              <p className="mt-1 text-[11px] text-destructive">
                                {paymentErrors["cardholderName"]}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="cardNumber"
                              className="block text-xs font-semibold text-foreground"
                            >
                              16-Digit Demo Card Number <span className="text-destructive">*</span>
                            </label>
                            <input
                              id="cardNumber"
                              type="text"
                              maxLength={19}
                              value={paymentFormValues.cardNumber}
                              onChange={(e) =>
                                setPaymentFormValues((p) => ({
                                  ...p,
                                  cardNumber: e.target.value,
                                }))
                              }
                              placeholder="4242 4242 4242 4242"
                              className={cn(
                                "mt-1 w-full rounded-xl border bg-background px-3.5 py-2 text-xs font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                                paymentErrors["cardNumber"] &&
                                  "border-destructive bg-destructive/5",
                              )}
                            />
                            {paymentErrors["cardNumber"] && (
                              <p className="mt-1 text-[11px] text-destructive">
                                {paymentErrors["cardNumber"]}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor="cardExpiry"
                                className="block text-xs font-semibold text-foreground"
                              >
                                Expiry (MM/YY) <span className="text-destructive">*</span>
                              </label>
                              <input
                                id="cardExpiry"
                                type="text"
                                maxLength={5}
                                value={paymentFormValues.cardExpiry}
                                onChange={(e) =>
                                  setPaymentFormValues((p) => ({
                                    ...p,
                                    cardExpiry: e.target.value,
                                  }))
                                }
                                placeholder="12/28"
                                className={cn(
                                  "mt-1 w-full rounded-xl border bg-background px-3.5 py-2 text-xs font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                                  paymentErrors["cardExpiry"] &&
                                    "border-destructive bg-destructive/5",
                                )}
                              />
                              {paymentErrors["cardExpiry"] && (
                                <p className="mt-1 text-[11px] text-destructive">
                                  {paymentErrors["cardExpiry"]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor="cardCvv"
                                className="block text-xs font-semibold text-foreground"
                              >
                                Demo CVV <span className="text-destructive">*</span>
                              </label>
                              <input
                                id="cardCvv"
                                type="password"
                                maxLength={4}
                                value={paymentFormValues.cardCvv}
                                onChange={(e) =>
                                  setPaymentFormValues((p) => ({
                                    ...p,
                                    cardCvv: e.target.value,
                                  }))
                                }
                                placeholder="123"
                                className={cn(
                                  "mt-1 w-full rounded-xl border bg-background px-3.5 py-2 text-xs font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
                                  paymentErrors["cardCvv"] && "border-destructive bg-destructive/5",
                                )}
                              />
                              {paymentErrors["cardCvv"] && (
                                <p className="mt-1 text-[11px] text-destructive">
                                  {paymentErrors["cardCvv"]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Back to Delivery Method</span>
                    </button>

                    <button
                      type="submit"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark active:scale-98"
                    >
                      <span>Review Your Order</span>
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* STEP 4: Order Review & Placement */}
            {currentStep === 4 && (
              <section className="space-y-6">
                <div className="rounded-3xl border bg-card p-5 sm:p-7 shadow-soft">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">4. Review & Place Order</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Please review your shipping details, selected delivery option, and demo
                        payment before confirming.
                      </p>
                    </div>
                    <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Package className="size-5" />
                    </span>
                  </div>

                  {/* Summary Blocks */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {/* Shipping Address Summary */}
                    <div className="rounded-2xl border bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Delivery To</span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-foreground">
                        {addressWatch.fullName || "Recipient Name"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {addressWatch.addressLine || "Address line"}
                        {addressWatch.apartment ? `, ${addressWatch.apartment}` : ""}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {addressWatch.city}, {addressWatch.state} - {addressWatch.pinCode}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Phone: +91 {addressWatch.phone}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{addressWatch.email}</p>
                    </div>

                    {/* Delivery Option Summary */}
                    <div className="rounded-2xl border bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Delivery Speed</span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-foreground">
                        {activeDeliveryMethod.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Estimated arrival: {activeDeliveryMethod.estimatedDate}
                      </p>
                      <p className="mt-1 text-xs font-bold text-foreground">
                        Fee:{" "}
                        {activeDeliveryMethod.fee === 0 ? (
                          <span className="text-success">FREE</span>
                        ) : (
                          formatINR(activeDeliveryMethod.fee)
                        )}
                      </p>
                    </div>

                    {/* Payment Method Summary */}
                    <div className="rounded-2xl border bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Payment Method</span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-[11px] font-bold text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-foreground uppercase">
                        {selectedPaymentMethod === "cod"
                          ? "Cash on Delivery"
                          : selectedPaymentMethod === "upi"
                            ? "UPI Payment (Demo)"
                            : "Credit/Debit Card (Demo)"}
                      </p>
                      {selectedPaymentMethod === "upi" && (
                        <p className="text-[11px] text-muted-foreground font-mono">
                          VPA: {paymentFormValues.upiId}
                        </p>
                      )}
                      {selectedPaymentMethod === "card" && (
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Ending in ••••{" "}
                          {paymentFormValues.cardNumber.replace(/\s+/g, "").slice(-4) || "4242"}
                        </p>
                      )}
                      <span className="mt-2 inline-block rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                        Demo Sandbox
                      </span>
                    </div>
                  </div>

                  {/* Itemized Order List */}
                  <div className="mt-6 border-t pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Ordered Products ({cartEntries.length})
                    </h3>
                    <ul className="mt-3 divide-y" aria-label="Review cart items">
                      {cartEntries.map(({ id, qty, product }) => {
                        const itemTotal = product.price * qty;
                        return (
                          <li key={id} className="flex items-center gap-3 py-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              width={56}
                              height={56}
                              className="size-14 rounded-xl object-cover bg-muted shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs font-bold text-foreground">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Sold by: {product.storeName} • Qty: {qty} ×{" "}
                                {formatINR(product.price)}
                              </p>
                            </div>
                            <span className="text-xs font-extrabold text-foreground sm:text-sm">
                              {formatINR(itemTotal)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Actions & Place Order */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Back to Payment</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting || outOfStockItems.length > 0}
                      onClick={handlePlaceOrder}
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          <span>Placing Demo Order...</span>
                        </>
                      ) : (
                        <>
                          <span>Place Demo Order ({formatINR(finalTotal)})</span>
                          <Check className="size-4 stroke-[3]" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Live Sticky Order Summary */}
          <aside className="h-fit rounded-3xl border bg-card p-5 sm:p-6 shadow-soft">
            <h2 className="text-base font-bold text-foreground">Order Summary</h2>

            {/* Quick Item Previews */}
            <div className="mt-4 max-h-52 overflow-y-auto space-y-3 pr-1">
              {cartEntries.map(({ id, qty, product }) => (
                <div key={id} className="flex items-center gap-2.5 text-xs">
                  <img
                    src={product.image}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="size-10 rounded-lg object-cover bg-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-foreground">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty: {qty}</p>
                  </div>
                  <span className="font-bold text-foreground">
                    {formatINR(product.price * qty)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <dl className="mt-5 space-y-2.5 border-t pt-4 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items Subtotal</dt>
                <dd className="font-semibold text-foreground">{formatINR(subtotal)}</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Delivery ({activeDeliveryMethod.name.split(" ")[0]})
                </dt>
                <dd className="font-semibold text-foreground">
                  {deliveryFee === 0 ? (
                    <span className="text-success font-bold">FREE</span>
                  ) : (
                    formatINR(deliveryFee)
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
                <dt className="font-extrabold text-foreground">Total Payable</dt>
                <dd className="font-extrabold text-foreground sm:text-base">
                  {formatINR(finalTotal)}
                </dd>
              </div>
            </dl>

            {/* Delivery speed estimate reminder */}
            <div className="mt-4 rounded-xl bg-muted/50 p-3 text-[11px] text-muted-foreground">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Truck className="size-3.5 text-primary" />
                <span>Estimated Arrival: {activeDeliveryMethod.estimatedDate}</span>
              </p>
              <p className="mt-0.5">Carrier partner assigned automatically upon dispatch.</p>
            </div>

            {/* Security Guarantee */}
            <div className="mt-4 flex items-center justify-center gap-2 border-t pt-4 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-4 text-success" />
              <span>Vendora 100% Purchase Protection</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
