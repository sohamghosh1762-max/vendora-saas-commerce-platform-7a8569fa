import { useState } from "react";
import {
  Search,
  X,
  Store,
  Users,
  Package,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Bell,
  Check,
  ShieldCheck,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  RECENT_STORES,
  RECENT_ORDERS,
  TOP_PRODUCTS,
  REFERENCE_NOTIFICATIONS,
  type RecentStore,
  type RecentOrder,
  type TopProduct,
  type AdminNotification,
} from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// 1. Global Search Modal (⌘ K)
// -----------------------------------------------------------------------------
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (type: string, name: string) => void;
}

export function SuperAdminSearchModal({ isOpen, onClose, onSelectItem }: SearchModalProps) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const filteredStores = RECENT_STORES.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.vendor.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredOrders = RECENT_ORDERS.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customer.toLowerCase().includes(query.toLowerCase()) ||
      o.store.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredProducts = TOP_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[#E8EAF5] px-4 py-3.5">
          <Search className="size-4.5 text-[#626E9D]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stores, vendors, products, orders, customers..."
            className="ml-3 flex-1 bg-transparent text-sm text-[#101438] placeholder-[#626E9D] outline-none"
          />
          <kbd className="rounded-md border border-[#E8EAF5] bg-[#F8F8FF] px-2 py-0.5 text-[10px] font-bold text-[#626E9D]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Stores */}
          {filteredStores.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-bold uppercase text-[#626E9D] tracking-wider">
                Stores
              </div>
              <div className="space-y-1">
                {filteredStores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      onSelectItem?.("store", store.name);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-[#F0EBFF] hover:text-[#6538F5] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="size-4 text-[#6538F5]" />
                      <span className="font-bold text-[#101438]">{store.name}</span>
                      <span className="text-[#626E9D] font-normal">by {store.vendor}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#08C784] bg-[#EBFBF5] px-2 py-0.5 rounded-md">
                      {store.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders */}
          {filteredOrders.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-bold uppercase text-[#626E9D] tracking-wider">
                Orders
              </div>
              <div className="space-y-1">
                {filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => {
                      onSelectItem?.("order", order.orderNumber);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-[#F0EBFF] hover:text-[#6538F5] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingCart className="size-4 text-[#FF8A00]" />
                      <span className="font-mono font-bold text-[#101438]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[#626E9D] font-normal">
                        {order.customer} ({order.store})
                      </span>
                    </div>
                    <span className="font-bold text-[#101438]">{order.amount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[11px] font-bold uppercase text-[#626E9D] tracking-wider">
                Products
              </div>
              <div className="space-y-1">
                {filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      onSelectItem?.("product", prod.name);
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-[#F0EBFF] hover:text-[#6538F5] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="size-4 text-[#08C784]" />
                      <span className="font-bold text-[#101438]">{prod.name}</span>
                      <span className="text-[#626E9D] font-normal">{prod.store}</span>
                    </div>
                    <span className="font-bold text-[#6538F5]">{prod.revenue}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredStores.length === 0 &&
            filteredOrders.length === 0 &&
            filteredProducts.length === 0 && (
              <div className="py-8 text-center text-xs text-[#626E9D]">
                No matching stores, orders, or products found for "{query}".
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 2. Notifications Dialog / Panel
// -----------------------------------------------------------------------------
interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuperAdminNotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(REFERENCE_NOTIFICATIONS);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-20">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#E8EAF5] px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="size-4.5 text-[#6538F5]" />
            <h3 className="text-sm font-extrabold text-[#101438]">Platform Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-[#6538F5] hover:underline"
            >
              Mark all read
            </button>
            <button type="button" onClick={onClose} className="text-[#626E9D] hover:text-[#101438]">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#E8EAF5] p-2 max-h-80 overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="p-3 rounded-xl transition hover:bg-[#F8F8FF] text-xs">
              <div className="flex items-start justify-between">
                <span className="font-bold text-[#101438]">{n.title}</span>
                <span className="text-[10px] text-[#626E9D]">{n.time}</span>
              </div>
              <p className="mt-1 text-[#626E9D] leading-relaxed">{n.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 3. Add New Store Modal
// -----------------------------------------------------------------------------
interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreAdded?: (name: string) => void;
}

export function SuperAdminAddStoreModal({ isOpen, onClose, onStoreAdded }: AddStoreModalProps) {
  const [storeName, setStoreName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [category, setCategory] = useState("fashion");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onStoreAdded?.(storeName);
      setIsSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF5]">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-[#F0EBFF] text-[#6538F5]">
              <Store className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#101438]">Add New Merchant Store</h3>
              <p className="text-xs text-[#626E9D]">
                Provision a new store directly on the Vendora platform
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[#626E9D] hover:text-[#101438]">
            <X className="size-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center text-xs">
            <CheckCircle2 className="mx-auto size-10 text-[#08C784]" />
            <h4 className="mt-3 text-sm font-bold text-[#101438]">
              Store Successfully Provisioned!
            </h4>
            <p className="mt-1 text-[#626E9D]">{storeName} is now active on the platform.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-[#101438]">Store Name</label>
              <input
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Aura Artisan Goods"
                className="mt-1 w-full rounded-xl border border-[#E8EAF5] px-3.5 py-2 text-xs outline-none focus:border-[#6538F5]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#101438]">Merchant Name</label>
                <input
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Devendra Patel"
                  className="mt-1 w-full rounded-xl border border-[#E8EAF5] px-3.5 py-2 text-xs outline-none focus:border-[#6538F5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#101438]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#E8EAF5] px-3 py-2 text-xs outline-none focus:border-[#6538F5]"
                >
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="electronics">Consumer Tech</option>
                  <option value="home-living">Home & Living</option>
                  <option value="beauty">Beauty & Wellness</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#101438]">Merchant Business Email</label>
              <input
                required
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="devendra@auraartisan.in"
                className="mt-1 w-full rounded-xl border border-[#E8EAF5] px-3.5 py-2 text-xs outline-none focus:border-[#6538F5]"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E8EAF5] px-4 py-2 font-semibold text-[#626E9D] hover:bg-[#F8F8FF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#6538F5] px-5 py-2 font-bold text-white shadow-xs hover:bg-[#4B20D8]"
              >
                Create Store
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 4. Approve Vendors Modal
// -----------------------------------------------------------------------------
interface ApproveVendorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PendingVendor {
  id: string;
  name: string;
  store: string;
  email: string;
  category: string;
  status: "Pending" | "Approved" | "Rejected";
}

export function SuperAdminApproveVendorsModal({ isOpen, onClose }: ApproveVendorsModalProps) {
  const [vendors, setVendors] = useState<PendingVendor[]>([
    {
      id: "v_1",
      name: "Siddharth Sen",
      store: "Zenith Home & Living",
      email: "siddharth@zenithliving.co",
      category: "Home & Living",
      status: "Pending",
    },
    {
      id: "v_2",
      name: "Devendra Patel",
      store: "Artisan Leathercraft",
      email: "devendra@artisanleather.in",
      category: "Fashion",
      status: "Pending",
    },
    {
      id: "v_3",
      name: "Ananya Deshmukh",
      store: "AyurVeda Botanicals",
      email: "ananya@ayurbotanicals.com",
      category: "Beauty",
      status: "Pending",
    },
  ]);

  if (!isOpen) return null;

  const handleAction = (id: string, newStatus: "Approved" | "Rejected") => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF5]">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-[#EBF3FF] text-[#1685FF]">
              <Users className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#101438]">Pending Vendor Approvals</h3>
              <p className="text-xs text-[#626E9D]">
                Review KYC credentials and grant storefront selling permissions
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[#626E9D] hover:text-[#101438]">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-[#E8EAF5] max-h-80 overflow-y-auto">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-[#101438]">{vendor.name}</p>
                <p className="text-[#626E9D] font-medium">
                  {vendor.store} • {vendor.category}
                </p>
                <p className="font-mono text-[11px] text-[#626E9D]">{vendor.email}</p>
              </div>

              <div className="flex items-center gap-2">
                {vendor.status === "Pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction(vendor.id, "Rejected")}
                      className="rounded-lg border border-[#FF4D5A]/30 bg-red-50 px-3 py-1.5 font-bold text-[#FF4D5A] hover:bg-red-100 transition"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(vendor.id, "Approved")}
                      className="rounded-lg bg-[#08C784] px-3.5 py-1.5 font-bold text-white hover:bg-emerald-600 shadow-xs transition"
                    >
                      Approve
                    </button>
                  </>
                ) : (
                  <span
                    className={cn(
                      "rounded-md px-2.5 py-1 font-bold text-xs",
                      vendor.status === "Approved"
                        ? "bg-[#EBFBF5] text-[#08C784]"
                        : "bg-[#FFEBEF] text-[#FF4D5A]",
                    )}
                  >
                    {vendor.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// 5. Documentation Modal
// -----------------------------------------------------------------------------
interface DocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuperAdminDocModal({ isOpen, onClose }: DocModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF5]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#6538F5]" />
            <h3 className="text-base font-extrabold text-[#101438]">
              Super Admin Platform Documentation
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-[#626E9D] hover:text-[#101438]">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-[#101438] leading-relaxed">
          <p>
            Welcome to the <strong>Vendora SaaS Commerce Platform</strong> administration console.
            Super Admin credentials provide root governance over tenant merchants, store catalogues,
            order settlements, and cloud infrastructure.
          </p>

          <div className="rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] p-3 space-y-1.5">
            <h4 className="font-bold text-[#6538F5]">Security & Authorization Protocol</h4>
            <p className="text-[#626E9D]">
              • PBKDF2-SHA256 password derivation with 100,000 rounds and 16-byte random salt.
            </p>
            <p className="text-[#626E9D]">
              • Strict 5-attempt rate limiter with 15-minute lockouts against brute-force attacks.
            </p>
            <p className="text-[#626E9D]">
              • Cryptographically signed session tokens stored in HTTP-only, SameSite secure
              cookies.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#6538F5] px-5 py-2 font-bold text-white hover:bg-[#4B20D8]"
            >
              Close Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
