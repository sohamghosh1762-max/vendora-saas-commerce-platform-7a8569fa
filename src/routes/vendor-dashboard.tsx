import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Eye,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useVendorAuth } from "@/lib/vendor-context";
import {
  addVendorProduct,
  deleteVendorProduct,
  getVendorOrders,
  getVendorProducts,
  updateVendorStore,
} from "@/lib/vendor-api";
import { formatINR } from "@/lib/format";
import { categories } from "@/data/categories";
import type { Product } from "@/data/products";
import type { VendorOrder } from "@/lib/vendor-types";

export const Route = createFileRoute("/vendor-dashboard")({
  component: VendorDashboardPage,
  head: () => ({
    meta: [
      { title: "Vendor Merchant Dashboard — Vendora" },
      { name: "description", content: "Manage your Vendora storefront, orders, products, and sales." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function VendorDashboardPage() {
  const { isAuthenticated, vendor, store, hydrated, logout, refreshStore } = useVendorAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "settings">("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "fashion",
    price: "",
    originalPrice: "",
    description: "",
    badge: "NEW",
    imageUrl: "",
  });

  // Store Settings Form State
  const [editStore, setEditStore] = useState({
    tagline: "",
    description: "",
    phone: "",
    returnPolicy: "",
    shippingMethod: "",
    processingTime: "",
  });

  useEffect(() => {
    if (store) {
      setProducts(getVendorProducts(store.id));
      setOrders(getVendorOrders(store.id));
      setEditStore({
        tagline: store.tagline || "",
        description: store.description || "",
        phone: store.phone || "",
        returnPolicy: store.returnPolicy || "7-Day Easy Returns",
        shippingMethod: store.shippingMethod || "Vendora Logistics",
        processingTime: store.processingTime || "1-2 Business Days",
      });
    }
  }, [store]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !newProduct.name || !newProduct.price) return;

    const priceNum = parseFloat(newProduct.price) || 999;
    const origPriceNum = parseFloat(newProduct.originalPrice) || priceNum * 1.3;

    addVendorProduct({
      name: newProduct.name.trim(),
      storeId: store.id,
      storeName: store.name,
      category: newProduct.category,
      price: priceNum,
      originalPrice: origPriceNum,
      rating: 5.0,
      reviews: 1,
      badge: newProduct.badge.trim() || undefined,
      image:
        newProduct.imageUrl.trim() ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      description: newProduct.description.trim() || "High quality handcrafted product made with care.",
      featured: true,
    });

    setProducts(getVendorProducts(store.id));
    setIsAddProductOpen(false);
    setNewProduct({
      name: "",
      category: store.category || "fashion",
      price: "",
      originalPrice: "",
      description: "",
      badge: "NEW",
      imageUrl: "",
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (!store) return;
    deleteVendorProduct(id);
    setProducts(getVendorProducts(store.id));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    await updateVendorStore(store.id, editStore);
    refreshStore();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // If still checking hydration
  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium">Loading vendor portal...</span>
        </div>
      </div>
    );
  }

  // Protected route unauthorized state
  if (!isAuthenticated || !vendor || !store) {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <span className="grid size-16 place-items-center rounded-3xl bg-primary-soft text-primary shadow-soft">
          <Store className="size-8" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-foreground">
          Vendor Portal Login Required
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You must be authenticated as an active Vendora merchant to access this dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/signin"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark"
          >
            Sign In with Vendor Account
          </Link>
          <Link
            to="/become-a-vendor"
            className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Register a Store
          </Link>
        </div>
      </section>
    );
  }

  // Calculate metrics
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0) + (products.length > 0 ? 14990 : 0);
  const totalOrdersCount = orders.length;
  const storeViews = 1250 + products.length * 85;

  return (
    <div className="min-h-screen bg-muted/20 py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span
                className={`grid size-16 shrink-0 place-items-center rounded-2xl border-4 border-card text-2xl font-black text-primary-foreground shadow-sm ${store.tint}`}
              >
                {store.name.charAt(0)}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    {store.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" />
                    Store {store.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Owner: <span className="font-semibold text-foreground">{vendor.fullName}</span> ({vendor.email})
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to="/store/$id"
                    params={{ id: store.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    vendora.com/store/{store.slug}
                    <ExternalLink className="size-3" />
                  </Link>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground capitalize">{store.category}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-dark"
              >
                <Plus className="size-4" />
                Add Product
              </button>
              <Link
                to="/store/$id"
                params={{ id: store.slug }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Store className="size-4 text-primary" />
                View Storefront
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign Out of Vendor Portal"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-lavender/30 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Store Setup Progress: 85% Complete</span>
              <span className="font-semibold text-primary">3 of 4 Milestones Reached</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: "85%" }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 text-success font-medium">
                <CheckCircle2 className="size-3.5" /> Identity Verified
              </span>
              <span className="flex items-center gap-1 text-success font-medium">
                <CheckCircle2 className="size-3.5" /> Storefront Registered
              </span>
              <span className="flex items-center gap-1 text-success font-medium">
                <CheckCircle2 className="size-3.5" /> Fulfilment Configured
              </span>
              <span className="flex items-center gap-1 text-primary font-bold">
                <span className="size-2 rounded-full bg-primary" /> Products: {products.length} listed
              </span>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</span>
              <span className="grid size-8 place-items-center rounded-xl bg-success/10 text-success">
                <DollarSign className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-foreground">{formatINR(totalRevenue)}</p>
            <p className="mt-1 text-[11px] text-success font-semibold flex items-center gap-1">
              <TrendingUp className="size-3" /> +18.4% this week
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Products</span>
              <span className="grid size-8 place-items-center rounded-xl bg-primary-soft text-primary">
                <Package className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-foreground">{products.length}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">In active catalog</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Orders</span>
              <span className="grid size-8 place-items-center rounded-xl bg-cat-electronics text-cat-electronics-fg">
                <ShoppingBag className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-foreground">{totalOrdersCount}</p>
            <p className="mt-1 text-[11px] text-success font-semibold flex items-center gap-1">
              <TrendingUp className="size-3" /> All orders on track
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Store Views</span>
              <span className="grid size-8 place-items-center rounded-xl bg-cat-beauty text-cat-beauty-fg">
                <Eye className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-black text-foreground">{storeViews.toLocaleString("en-IN")}</p>
            <p className="mt-1 text-[11px] text-primary font-semibold">+24% visitor growth</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex border-b border-border">
          {[
            { id: "overview", label: "Overview & Orders", icon: Boxes },
            { id: "products", label: `Catalog (${products.length})`, icon: Package },
            { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: "settings", label: "Store Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Recent Orders List */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Recent Customer Orders</h2>
                  <p className="text-xs text-muted-foreground">Live orders placed for your store</p>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View All
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-bold text-foreground">No orders yet</p>
                  <p className="text-xs text-muted-foreground">Orders placed for your store will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">{order.id}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              order.status === "Delivered"
                                ? "bg-success/10 text-success"
                                : order.status === "Shipped"
                                  ? "bg-primary-soft text-primary"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {order.customerName} • {order.items.map((i) => `${i.productName} (x${i.qty})`).join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-foreground">{formatINR(order.total)}</p>
                        <p className="text-[10px] text-muted-foreground">{order.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions & Store Info Sidecard */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h2 className="text-base font-bold text-foreground">Quick Merchant Actions</h2>
                <div className="mt-4 space-y-2.5">
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="flex w-full items-center justify-between rounded-2xl border border-border p-3 text-left transition-colors hover:border-primary hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-xl bg-primary-soft text-primary">
                        <Plus className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground">Add New Product</p>
                        <p className="text-[11px] text-muted-foreground">Upload image, set price and inventory</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </button>

                  <Link
                    to="/store/$id"
                    params={{ id: store.slug }}
                    className="flex w-full items-center justify-between rounded-2xl border border-border p-3 text-left transition-colors hover:border-primary hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-xl bg-cat-electronics text-cat-electronics-fg">
                        <ExternalLink className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground">Preview Public Storefront</p>
                        <p className="text-[11px] text-muted-foreground">Inspect how buyers experience your shop</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>

                  <button
                    onClick={() => setActiveTab("settings")}
                    className="flex w-full items-center justify-between rounded-2xl border border-border p-3 text-left transition-colors hover:border-primary hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-xl bg-cat-home text-cat-home-fg">
                        <Settings className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-foreground">Store Policies & Details</p>
                        <p className="text-[11px] text-muted-foreground">Edit return windows, contacts, and hours</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Development Mode Notice */}
              <div className="rounded-3xl border border-primary/20 bg-lavender/30 p-5 text-xs">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-success" />
                  Local Development Persistence Mode
                </p>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  You are viewing live persistent state stored in your browser session. Adding products or updating store details will be immediately reflected across the entire Vendora marketplace.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === "products" && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Product Catalog</h2>
                <p className="text-xs text-muted-foreground">Manage inventory and pricing for your storefront.</p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark"
              >
                <Plus className="size-3.5" />
                Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="mx-auto size-12 text-muted-foreground" />
                <h3 className="mt-3 text-base font-bold text-foreground">No products listed yet</h3>
                <p className="mt-1 max-w-sm mx-auto text-xs text-muted-foreground">
                  Your store is ready! Click below to add your first product to start selling to customers.
                </p>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-dark"
                >
                  <Plus className="size-3.5" />
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-background p-4 shadow-card"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden rounded-xl bg-muted">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                        {prod.badge && (
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                            {prod.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-3 font-bold text-foreground text-sm line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{prod.description}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                      <div>
                        <span className="text-sm font-extrabold text-foreground">{formatINR(prod.price)}</span>
                        {prod.originalPrice > prod.price && (
                          <span className="ml-1.5 text-xs text-muted-foreground line-through">
                            {formatINR(prod.originalPrice)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Product"
                        aria-label={`Delete ${prod.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === "orders" && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold text-foreground">Order Management</h2>
            <p className="text-xs text-muted-foreground">Track order shipments and customer purchases.</p>

            <div className="mt-6 divide-y divide-border">
              {orders.map((order) => (
                <div key={order.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          order.status === "Delivered"
                            ? "bg-success/10 text-success"
                            : order.status === "Shipped"
                              ? "bg-primary-soft text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-foreground font-semibold">
                      Customer: {order.customerName} ({order.customerEmail})
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Items: {order.items.map((i) => `${i.productName} (x${i.qty} - ${formatINR(i.price)})`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-foreground">{formatINR(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: STORE SETTINGS */}
        {activeTab === "settings" && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft max-w-3xl">
            <h2 className="text-lg font-bold text-foreground">Store Settings & Policies</h2>
            <p className="text-xs text-muted-foreground">Update your publicly visible store information.</p>

            {saveSuccess && (
              <div className="mt-4 rounded-xl border border-success/30 bg-success/10 p-3 text-xs font-semibold text-success flex items-center gap-2">
                <CheckCircle2 className="size-4" />
                Store settings saved successfully!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">Tagline</label>
                <input
                  type="text"
                  value={editStore.tagline}
                  onChange={(e) => setEditStore((p) => ({ ...p, tagline: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Store Description</label>
                <textarea
                  rows={3}
                  value={editStore.description}
                  onChange={(e) => setEditStore((p) => ({ ...p, description: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground">Business Contact Phone</label>
                  <input
                    type="tel"
                    value={editStore.phone}
                    onChange={(e) => setEditStore((p) => ({ ...p, phone: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground">Return Window</label>
                  <select
                    value={editStore.returnPolicy}
                    onChange={(e) => setEditStore((p) => ({ ...p, returnPolicy: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="7-Day Easy Returns">7-Day Easy Returns</option>
                    <option value="14-Day Returns">14-Day Returns</option>
                    <option value="30-Day Returns">30-Day Returns</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-dark transition-colors"
              >
                Save Store Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-lift max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-foreground">Add New Product to Store</h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Handmade Ceramic Bowl"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">Selling Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                    placeholder="999"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground">Original Price (INR)</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct((p) => ({ ...p, originalPrice: e.target.value }))}
                    placeholder="1499"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground">Promotional Badge</label>
                  <input
                    type="text"
                    value={newProduct.badge}
                    onChange={(e) => setNewProduct((p) => ({ ...p, badge: e.target.value }))}
                    placeholder="NEW / 25% OFF"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Image URL (Optional)</label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">Description</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Product specs, materials, and features..."
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="rounded-full border border-border px-5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-dark shadow-sm"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
