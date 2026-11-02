import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";

import {
  User,
  MapPin,
  Package,
  ShoppingBag,
  LogOut,
  Edit3,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  ArrowRight,
  ArrowLeft,
  X,
  CreditCard,
  QrCode,
  Banknote,
  Search,
  Filter,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useCustomerAuth } from "@/lib/customer-context";
import { useCart } from "@/lib/cart";
import { getOrdersByCustomer, seedDemoOrdersForCustomer } from "@/lib/order-storage";
import { getProduct } from "@/data/products";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { INDIAN_STATES } from "@/lib/checkout-schema";
import type { CustomerAddress, AddressLabel } from "@/lib/customer-types";
import type { CustomerOrder, OrderStatus } from "@/lib/order-types";

export interface AccountSearch {
  tab?: "overview" | "profile" | "addresses" | "orders";
  orderId?: string;
}

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>): AccountSearch => {
    const tab = search["tab"];
    const orderId = search["orderId"];
    const validTabs = ["overview", "profile", "addresses", "orders"] as const;
    const resolvedTab = validTabs.includes(tab as (typeof validTabs)[number])
      ? (tab as AccountSearch["tab"])
      : "overview";
    return {
      tab: resolvedTab,
      orderId: typeof orderId === "string" ? orderId : undefined,
    };
  },
  component: AccountPage,
  head: () => ({
    meta: [
      { title: "My Customer Account — Vendora" },
      {
        name: "description",
        content:
          "Manage your profile, saved addresses, order history, and reorder from previous purchases.",
      },
    ],
  }),
});

export function AccountPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const {
    customer,
    isAuthenticated,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    signOut,
  } = useCustomerAuth();
  const { addToCart, cartItems } = useCart();

  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "addresses" | "orders">(
    () => search.tab || "overview",
  );

  // Sync tab with URL search parameter
  useEffect(() => {
    if (search.tab && search.tab !== activeTab) {
      setActiveTab(search.tab);
    }
  }, [search.tab, activeTab]);

  // Orders list for currently signed-in customer
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    () => search.orderId || null,
  );

  // Load and refresh customer orders
  const refreshOrders = useCallback(() => {
    if (!customer) {
      setOrders([]);
      return;
    }
    seedDemoOrdersForCustomer(customer);
    const list = getOrdersByCustomer(customer.id);
    setOrders(list);
  }, [customer]);

  useEffect(() => {
    if (customer) {
      refreshOrders();
    } else {
      setOrders([]);
    }
  }, [customer, refreshOrders]);

  // Order filters and sorting
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Reorder feedback state
  const [reorderNotification, setReorderNotification] = useState<{
    type: "success" | "warning";
    message: string;
  } | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(() => customer?.name || "");
  const [editPhone, setEditPhone] = useState(() => customer?.phone || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (customer) {
      setEditName(customer.name);
      setEditPhone(customer.phone);
    }
  }, [customer]);

  // Address Modal State (Add / Edit)
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    apartment: "",
    city: "",
    state: "Maharashtra",
    pinCode: "",
    country: "India",
    label: "Home" as AddressLabel,
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [addressSaving, setAddressSaving] = useState(false);

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (statusFilter === "all") return true;
        return order.orderStatus.toLowerCase() === statusFilter.toLowerCase();
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
      });
  }, [orders, statusFilter, sortOrder]);

  const activeOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((o) => o.orderId.toUpperCase() === selectedOrderId.toUpperCase()) || null;
  }, [orders, selectedOrderId]);

  // Profile Update Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);

    if (!editName.trim() || editName.trim().length < 2) {
      setProfileFeedback({
        type: "error",
        message: "Full name must be at least 2 characters.",
      });
      return;
    }

    const cleanPhone = editPhone.trim().replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setProfileFeedback({
        type: "error",
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
      return;
    }

    setProfileSaving(true);
    const success = updateProfile({
      name: editName.trim(),
      phone: cleanPhone,
    });
    setProfileSaving(false);

    if (success) {
      setProfileFeedback({
        type: "success",
        message: "Profile details updated successfully!",
      });
      setTimeout(() => setProfileFeedback(null), 3500);
    } else {
      setProfileFeedback({
        type: "error",
        message: "Failed to update profile. Please try again.",
      });
    }
  };

  // Address Form Open
  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: customer?.name || "",
      phone: customer?.phone || "",
      addressLine: "",
      apartment: "",
      city: "",
      state: "Maharashtra",
      pinCode: "",
      country: "India",
      label: "Home",
      isDefault: (customer?.addresses?.length ?? 0) === 0,
    });
    setAddressErrors({});
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: CustomerAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      apartment: addr.apartment || "",
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      country: addr.country || "India",
      label: addr.label,
      isDefault: Boolean(addr.isDefault),
    });
    setAddressErrors({});
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!addressForm.fullName.trim() || addressForm.fullName.trim().length < 2) {
      errors["fullName"] = "Full name must be at least 2 characters.";
    }

    const phoneClean = addressForm.phone.trim().replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      errors["phone"] = "Valid 10-digit Indian phone number required.";
    }

    if (!addressForm.addressLine.trim() || addressForm.addressLine.trim().length < 5) {
      errors["addressLine"] = "Street address must be at least 5 characters.";
    }

    if (!addressForm.city.trim() || addressForm.city.trim().length < 2) {
      errors["city"] = "City name is required.";
    }

    if (!/^[1-9][0-9]{5}$/.test(addressForm.pinCode.trim())) {
      errors["pinCode"] = "Valid 6-digit Indian PIN code required.";
    }

    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setAddressSaving(true);
    if (editingAddressId) {
      updateAddress(editingAddressId, {
        fullName: addressForm.fullName.trim(),
        phone: phoneClean,
        addressLine: addressForm.addressLine.trim(),
        apartment: addressForm.apartment.trim() || undefined,
        city: addressForm.city.trim(),
        state: addressForm.state,
        pinCode: addressForm.pinCode.trim(),
        country: addressForm.country,
        label: addressForm.label,
        isDefault: addressForm.isDefault,
      });
    } else {
      addAddress({
        fullName: addressForm.fullName.trim(),
        phone: phoneClean,
        addressLine: addressForm.addressLine.trim(),
        apartment: addressForm.apartment.trim() || undefined,
        city: addressForm.city.trim(),
        state: addressForm.state,
        pinCode: addressForm.pinCode.trim(),
        country: addressForm.country,
        label: addressForm.label,
        isDefault: addressForm.isDefault,
      });
    }
    setAddressSaving(false);
    setAddressModalOpen(false);
  };

  // Reorder Functionality (Prompt 6 - Section 9)
  const handleReorder = (order: CustomerOrder) => {
    setReorderNotification(null);
    let addedCount = 0;
    const skippedItems: string[] = [];

    order.items.forEach((item) => {
      const product = getProduct(item.id);
      if (!product) {
        skippedItems.push(`"${item.name}" (no longer available)`);
        return;
      }

      const inStock = (product.stockCount ?? 1) > 0;
      if (!inStock) {
        skippedItems.push(`"${product.name}" (out of stock)`);
        return;
      }

      // Check current in-cart count and cap at available stock
      const currentInCart = cartItems[item.id] || 0;
      const availableStock = product.stockCount ?? 999;
      const canAdd = Math.max(0, Math.min(item.qty, availableStock - currentInCart));

      if (canAdd > 0) {
        addToCart(item.id, canAdd);
        addedCount += canAdd;
      } else if (currentInCart >= availableStock) {
        skippedItems.push(`"${product.name}" (max available stock already in cart)`);
      }
    });

    if (addedCount > 0) {
      let msg = `Successfully added ${addedCount} item${addedCount > 1 ? "s" : ""} to your cart!`;
      if (skippedItems.length > 0) {
        msg += ` Skipped: ${skippedItems.join(", ")}.`;
      }
      setReorderNotification({ type: "success", message: msg });
      setTimeout(() => {
        navigate({ to: "/cart" });
      }, 1200);
    } else {
      setReorderNotification({
        type: "warning",
        message: `Could not reorder items: ${skippedItems.join(", ") || "All items currently unavailable."}`,
      });
    }
  };

  // Guest or Not Authenticated View
  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-background px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-soft sm:p-10">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-soft text-primary">
            <User className="size-8" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Customer Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to view your orders, manage saved delivery addresses, and update your
            profile.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/signin"
              search={{ role: "customer" }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark"
            >
              <span>Sign In to Account</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-3 text-xs font-semibold text-foreground hover:bg-accent transition"
            >
              <span>Create Account</span>
            </Link>
          </div>

          <div className="mt-8 border-t pt-4 text-xs text-muted-foreground">
            <p>
              Looking for vendor store operations?{" "}
              <Link
                to="/signin"
                search={{ role: "vendor" }}
                className="font-bold text-primary hover:underline"
              >
                Vendor Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background pb-16 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Account Header Banner */}
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-gradient-to-r from-primary-soft/60 via-card to-lavender/30 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-extrabold text-primary-foreground shadow-sm">
              {(customer.name || customer.fullName || "Customer").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
                  {customer.name || customer.fullName || "Customer"}
                </h1>
                <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-extrabold text-success">
                  Verified Customer
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                {customer.email} • +91 {customer.phone}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Member since:{" "}
                {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/shop"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-primary/30 bg-card px-4 py-2 text-xs font-bold text-primary shadow-xs transition hover:bg-primary-soft"
            >
              <ShoppingBag className="size-3.5" />
              <span>Browse Storefront</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                signOut();
                navigate({ to: "/" });
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Reorder Notification Banner */}
        {reorderNotification && (
          <div
            role="alert"
            className={cn(
              "mt-6 flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-medium animate-fadeIn",
              reorderNotification.type === "success"
                ? "border-success/30 bg-success/10 text-success"
                : "border-warning/30 bg-warning/10 text-warning-foreground",
            )}
          >
            <div className="flex items-center gap-2">
              {reorderNotification.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{reorderNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setReorderNotification(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation Navigation Bar */}
        <div className="mt-8 flex overflow-x-auto border-b border-border no-scrollbar">
          <div className="flex gap-2">
            {[
              { id: "overview", label: "Overview", icon: Sparkles },
              { id: "orders", label: `Orders (${orders.length})`, icon: Package },
              {
                id: "addresses",
                label: `Saved Addresses (${customer.addresses.length})`,
                icon: MapPin,
              },
              { id: "profile", label: "Profile & Settings", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setSelectedOrderId(null);
                  }}
                  className={cn(
                    "flex min-h-[44px] items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3 text-xs font-bold transition-all",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="mt-8 space-y-8">
            {/* Quick Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div
                onClick={() => setActiveTab("orders")}
                className="cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Total Orders</span>
                  <span className="grid size-8 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Package className="size-4" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-foreground">{orders.length}</p>
                <p className="mt-1 text-[11px] font-medium text-primary hover:underline flex items-center gap-1">
                  View order history <ChevronRight className="size-3" />
                </p>
              </div>

              <div
                onClick={() => setActiveTab("addresses")}
                className="cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Saved Addresses
                  </span>
                  <span className="grid size-8 place-items-center rounded-xl bg-accent text-foreground">
                    <MapPin className="size-4 text-primary" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-foreground">
                  {customer.addresses.length}
                </p>
                <p className="mt-1 text-[11px] font-medium text-primary hover:underline flex items-center gap-1">
                  Manage address book <ChevronRight className="size-3" />
                </p>
              </div>

              <div
                onClick={() => setActiveTab("profile")}
                className="cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Account Status
                  </span>
                  <span className="grid size-8 place-items-center rounded-xl bg-success/15 text-success">
                    <ShieldCheck className="size-4" />
                  </span>
                </div>
                <p className="mt-2 text-base font-extrabold text-foreground">Active Shopper</p>
                <p className="mt-1 text-[11px] font-medium text-primary hover:underline flex items-center gap-1">
                  Edit profile details <ChevronRight className="size-3" />
                </p>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
                  <p className="text-xs text-muted-foreground">Your latest purchases on Vendora</p>
                </div>
                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View All ({orders.length})
                  </button>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                    <ShoppingBag className="size-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-foreground">No orders placed yet</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Explore products from hundreds of independent brands and place your first order!
                  </p>
                  <Link
                    to="/shop"
                    className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary-dark transition"
                  >
                    <span>Start Shopping</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {orders.slice(0, 3).map((order) => (
                    <OrderCard
                      key={order.orderId}
                      order={order}
                      onViewDetails={() => {
                        setSelectedOrderId(order.orderId);
                        setActiveTab("orders");
                      }}
                      onReorder={() => handleReorder(order)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & DETAILS */}
        {activeTab === "orders" && (
          <div className="mt-8 space-y-6">
            {/* If an individual order is selected, show the detailed view */}
            {activeOrder ? (
              <OrderDetailsView
                order={activeOrder}
                onBack={() => setSelectedOrderId(null)}
                onReorder={() => handleReorder(activeOrder)}
              />
            ) : (
              <>
                {/* Orders Filter & Search Toolbar */}
                <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-soft">
                  {/* Status Filters */}
                  <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {[
                      { id: "all", label: "All Orders" },
                      { id: "processing", label: "Processing" },
                      { id: "confirmed", label: "Confirmed" },
                      { id: "shipped", label: "Shipped" },
                      { id: "out for delivery", label: "Out for Delivery" },
                      { id: "delivered", label: "Delivered" },
                      { id: "cancelled", label: "Cancelled" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setStatusFilter(f.id)}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                          statusFilter === f.id
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Sorting dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Sort:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                      className="rounded-xl border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                      <Package className="size-6" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-foreground">
                      {statusFilter === "all"
                        ? "You haven't placed any orders yet"
                        : `No ${statusFilter} orders found`}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Browse unique items from stores and experience smooth doorstep delivery.
                    </p>
                    <Link
                      to="/shop"
                      className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary-dark transition"
                    >
                      <span>Explore Marketplace</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order) => (
                      <OrderCard
                        key={order.orderId}
                        order={order}
                        onViewDetails={() => setSelectedOrderId(order.orderId)}
                        onReorder={() => handleReorder(order)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 3: ADDRESS BOOK */}
        {activeTab === "addresses" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Address Book</h2>
                <p className="text-xs text-muted-foreground">
                  Saved delivery locations for seamless 1-click checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddAddressModal}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-soft transition hover:bg-primary-dark"
              >
                <Plus className="size-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {customer.addresses.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <MapPin className="size-6" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground">No saved addresses</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add a delivery address to speed up checkout on your future orders.
                </p>
                <button
                  type="button"
                  onClick={openAddAddressModal}
                  className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary-dark transition"
                >
                  <Plus className="size-4" />
                  <span>Add First Address</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-foreground">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary flex items-center gap-1">
                            <Check className="size-3" /> Default Address
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-foreground">{addr.fullName}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {addr.addressLine}
                        {addr.apartment ? `, ${addr.apartment}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {addr.country || "India"}
                      </p>
                      <p className="mt-2 text-xs font-medium text-foreground">
                        Phone: +91 {addr.phone}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditAddressModal(addr)}
                          className="font-bold text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-muted-foreground/40">•</span>
                        <button
                          type="button"
                          onClick={() => deleteAddress(addr.id)}
                          className="font-semibold text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>

                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFILE & SETTINGS */}
        {activeTab === "profile" && (
          <div className="mt-8 max-w-2xl">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <h2 className="text-lg font-bold text-foreground">Profile Information</h2>
              <p className="text-xs text-muted-foreground">
                Update your personal name and contact number. Changes persist in local storage.
              </p>

              {profileFeedback && (
                <div
                  role="alert"
                  className={cn(
                    "mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold",
                    profileFeedback.type === "success"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {profileFeedback.type === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  <span>{profileFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="edit-name"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border bg-background px-3.5 py-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    readOnly
                    value={customer.email}
                    className="mt-1.5 w-full rounded-xl border bg-muted/60 px-3.5 py-2.5 text-xs text-muted-foreground outline-none cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Your email address is your unique account identifier.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="edit-phone"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-1.5 flex rounded-xl border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <span className="flex items-center border-r px-3 text-xs font-semibold text-muted-foreground">
                      +91
                    </span>
                    <input
                      id="edit-phone"
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-transparent px-3 py-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-7 py-2.5 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark disabled:opacity-50"
                  >
                    {profileSaving ? "Saving Changes..." : "Save Profile Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ADDRESS MODAL (ADD / EDIT) */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-base font-bold text-foreground">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Address Label <span className="text-destructive">*</span>
                </label>
                <div className="mt-1.5 flex gap-2">
                  {(["Home", "Work", "Other"] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressForm((f) => ({ ...f, label: lbl }))}
                      className={cn(
                        "flex-1 rounded-xl border py-2 text-xs font-bold transition",
                        addressForm.label === lbl
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-accent text-foreground",
                      )}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="addr-name"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="addr-name"
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm((f) => ({ ...f, fullName: e.target.value }))}
                    className={cn(
                      "mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary",
                      addressErrors["fullName"] && "border-destructive bg-destructive/5",
                    )}
                  />
                  {addressErrors["fullName"] && (
                    <p className="mt-1 text-[11px] text-destructive">{addressErrors["fullName"]}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="addr-phone"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Mobile Phone <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-1 flex rounded-xl border bg-background focus-within:border-primary">
                    <span className="flex items-center border-r px-2.5 text-xs text-muted-foreground font-semibold">
                      +91
                    </span>
                    <input
                      id="addr-phone"
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="9876543210"
                      className="w-full bg-transparent px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  {addressErrors["phone"] && (
                    <p className="mt-1 text-[11px] text-destructive">{addressErrors["phone"]}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="addr-street"
                  className="block text-xs font-semibold text-foreground"
                >
                  House / Flat / Street <span className="text-destructive">*</span>
                </label>
                <input
                  id="addr-street"
                  type="text"
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm((f) => ({ ...f, addressLine: e.target.value }))}
                  placeholder="e.g. 402, Lotus Grand Residency"
                  className={cn(
                    "mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary",
                    addressErrors["addressLine"] && "border-destructive bg-destructive/5",
                  )}
                />
                {addressErrors["addressLine"] && (
                  <p className="mt-1 text-[11px] text-destructive">
                    {addressErrors["addressLine"]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="addr-apt" className="block text-xs font-semibold text-foreground">
                  Apartment, Landmark, Suite{" "}
                  <span className="text-muted-foreground">(Optional)</span>
                </label>
                <input
                  id="addr-apt"
                  type="text"
                  value={addressForm.apartment}
                  onChange={(e) => setAddressForm((f) => ({ ...f, apartment: e.target.value }))}
                  placeholder="e.g. Near Metro Station"
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="addr-city"
                    className="block text-xs font-semibold text-foreground"
                  >
                    City <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                    className={cn(
                      "mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary",
                      addressErrors["city"] && "border-destructive bg-destructive/5",
                    )}
                  />
                  {addressErrors["city"] && (
                    <p className="mt-1 text-[11px] text-destructive">{addressErrors["city"]}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="addr-state"
                    className="block text-xs font-semibold text-foreground"
                  >
                    State <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="addr-state"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))}
                    className="mt-1 w-full rounded-xl border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="addr-pin" className="block text-xs font-semibold text-foreground">
                    PIN Code <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="addr-pin"
                    type="text"
                    maxLength={6}
                    value={addressForm.pinCode}
                    onChange={(e) => setAddressForm((f) => ({ ...f, pinCode: e.target.value }))}
                    placeholder="400001"
                    className={cn(
                      "mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-primary",
                      addressErrors["pinCode"] && "border-destructive bg-destructive/5",
                    )}
                  />
                  {addressErrors["pinCode"] && (
                    <p className="mt-1 text-[11px] text-destructive">{addressErrors["pinCode"]}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="addr-default"
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="size-4 accent-primary rounded"
                />
                <label
                  htmlFor="addr-default"
                  className="text-xs font-semibold text-foreground cursor-pointer"
                >
                  Make this my default delivery address
                </label>
              </div>

              <div className="flex justify-end gap-2.5 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="rounded-full border px-5 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="rounded-full bg-primary px-6 py-2 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary-dark disabled:opacity-50"
                >
                  {addressSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Single Order Card Component
 */
function OrderCard({
  order,
  onViewDetails,
  onReorder,
}: {
  order: CustomerOrder;
  onViewDetails: () => void;
  onReorder: () => void;
}) {
  const statusColor =
    {
      Placed: "bg-primary/10 text-primary",
      Confirmed: "bg-primary/10 text-primary",
      Processing: "bg-warning/15 text-warning-foreground",
      Shipped: "bg-accent text-accent-foreground font-bold",
      "Out for Delivery": "bg-warning/20 text-warning-foreground font-bold",
      Delivered: "bg-success/15 text-success font-bold",
      Cancelled: "bg-destructive/15 text-destructive font-bold",
    }[order.orderStatus] || "bg-muted text-muted-foreground";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40 hover:shadow-card">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-foreground">{order.orderId}</span>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", statusColor)}>
            {order.orderStatus}
          </span>
        </div>

        <p className="mt-1 text-[11px] text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>

        {/* Thumbnail Preview Images */}
        <div className="mt-3 flex items-center gap-2 overflow-hidden">
          {order.items.slice(0, 3).map((item) => (
            <img
              key={item.id}
              src={item.image}
              alt={item.name}
              className="size-12 rounded-xl object-cover bg-muted shrink-0 border"
            />
          ))}
          {order.items.length > 3 && (
            <span className="grid size-12 place-items-center rounded-xl bg-accent text-xs font-bold text-muted-foreground shrink-0 border">
              +{order.items.length - 3}
            </span>
          )}
        </div>

        {/* Product Names Snippet */}
        <p className="mt-2 text-xs font-semibold text-foreground line-clamp-1">
          {order.items.map((i) => i.name).join(", ")}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs border-t border-border/60 pt-3">
          <span className="text-muted-foreground">
            {order.items.reduce((s, i) => s + i.qty, 0)} Items
          </span>
          <span className="font-extrabold text-foreground sm:text-sm">
            {formatINR(order.priceBreakdown.total)}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <button
          type="button"
          onClick={onViewDetails}
          className="flex-1 rounded-xl border bg-card py-2 text-center text-xs font-bold text-foreground hover:bg-accent transition"
        >
          View Details
        </button>

        <Link
          to="/track-order"
          search={{ orderId: order.orderId }}
          className="rounded-xl border border-primary/30 bg-primary-soft/50 px-3 py-2 text-xs font-bold text-primary hover:bg-primary-soft transition"
        >
          Track
        </Link>

        <button
          type="button"
          onClick={onReorder}
          title="Add items to cart"
          className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary-dark transition flex items-center gap-1"
        >
          <RotateCcw className="size-3.5" />
          <span>Reorder</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Full Itemized Order Details View
 */
function OrderDetailsView({
  order,
  onBack,
  onReorder,
}: {
  order: CustomerOrder;
  onBack: () => void;
  onReorder: () => void;
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="size-4" />
        <span>Back to all orders</span>
      </button>

      {/* Order Header Summary */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-foreground">Order #{order.orderId}</h2>
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
              {order.orderStatus}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/track-order"
            search={{ orderId: order.orderId }}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-primary/30 bg-primary-soft/60 px-5 py-2 text-xs font-bold text-primary shadow-xs hover:bg-primary-soft transition"
          >
            <Truck className="size-4" />
            <span>Track Delivery</span>
          </Link>

          <button
            type="button"
            onClick={onReorder}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-primary px-6 py-2 text-xs font-bold text-primary-foreground shadow-soft hover:bg-primary-dark transition active:scale-98"
          >
            <RotateCcw className="size-4" />
            <span>Reorder Items</span>
          </button>
        </div>
      </div>

      {/* Grid: Items + Shipping/Billing */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Itemized List */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft sm:p-7">
          <h3 className="text-sm font-bold text-foreground">
            Order Items ({order.items.reduce((s, i) => s + i.qty, 0)})
          </h3>

          <ul className="mt-4 divide-y divide-border/60">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-16 rounded-2xl object-cover bg-muted shrink-0 border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="truncate text-xs font-bold text-foreground sm:text-sm">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Store: {item.storeName}</p>
                  {item.selectedVariants && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(item.selectedVariants).map(([k, v]) => (
                        <span
                          key={k}
                          className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                        >
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-foreground font-medium">
                    Qty: {item.qty} × {formatINR(item.price)}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-foreground sm:text-sm">
                  {formatINR(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Order Details & Summary Card */}
        <div className="space-y-5">
          {/* Delivery Address Card */}
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Delivery Address
            </span>
            <p className="mt-2 text-xs font-bold text-foreground">
              {order.shippingAddress.fullName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {order.shippingAddress.addressLine}
              {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
              {order.shippingAddress.pinCode}
            </p>
            <p className="mt-1 text-xs font-medium text-foreground">
              Ph: +91 {order.shippingAddress.phone}
            </p>
          </div>

          {/* Delivery & Payment Method Card */}
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Delivery & Payment
            </span>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Speed:</span>
                <span className="font-semibold text-foreground">{order.deliveryMethod.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Delivery:</span>
                <span className="font-semibold text-foreground">{order.estimatedDeliveryDate}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Payment:</span>
                <span className="font-semibold text-foreground">
                  {order.payment.label ||
                    (order.payment.method === "cod"
                      ? "Cash on Delivery"
                      : order.payment.method === "upi"
                        ? "UPI Payment (Demo)"
                        : "Credit/Debit Card (Demo)")}
                </span>
              </div>
            </div>
          </div>

          {/* Price Breakdown Card */}
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Payment Summary
            </span>
            <dl className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold text-foreground">
                  {formatINR(order.priceBreakdown.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
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
                  <dt className="font-medium">Coupon Discount</dt>
                  <dd className="font-bold">- {formatINR(order.priceBreakdown.couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border/80 pt-2 text-sm font-extrabold text-foreground">
                <dt>Total Amount</dt>
                <dd>{formatINR(order.priceBreakdown.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
