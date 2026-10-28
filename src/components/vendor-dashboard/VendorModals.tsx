import { useState } from "react";
import { Check, Loader2, Package, Store, X } from "lucide-react";
import type { DashboardOrder, DashboardProduct } from "@/lib/vendor-dashboard-data";
import { formatINR } from "@/lib/format";

// --- Add Product Modal ---
export function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: {
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    description: string;
    badge?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("home-living");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        name: name.trim(),
        category,
        price: parseFloat(price) || 999,
        originalPrice: parseFloat(originalPrice) || (parseFloat(price) || 999) * 1.3,
        description: description.trim() || "Handcrafted artisan product with premium materials.",
        badge: badge.trim() || undefined,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-lg rounded-3xl border border-[#ECEAF5] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-[#F0EBFE] text-[#6538F5]">
              <Package className="size-4" />
            </span>
            <h3 className="text-base font-bold text-[#110D27]">Add New Product</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7A7F93] hover:bg-[#F4F2FC] hover:text-[#110D27]"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-[#110D27]">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Handcrafted Ceramic Planter"
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#110D27]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white"
              >
                <option value="home-living">Home & Living</option>
                <option value="fashion">Fashion & Apparel</option>
                <option value="beauty">Beauty & Personal Care</option>
                <option value="electronics">Electronics</option>
                <option value="sports">Sports & Lifestyle</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#110D27]">Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Best Seller, New"
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#110D27]">Price (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1499"
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-[#110D27]">Original Price (₹)</label>
              <input
                type="number"
                min="1"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="2199"
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#110D27]">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your artisan product, craftsmanship, and materials..."
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ECEAF5]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ECEAF5] px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F4F2FC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6538F5] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                "Publish Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Store Settings Modal ---
export function StoreSettingsModal({
  isOpen,
  onClose,
  storeName,
  tagline,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  tagline: string;
  onSave: (data: { storeName: string; tagline: string; returnPolicy: string }) => void;
}) {
  const [name, setName] = useState(storeName);
  const [storeTagline, setStoreTagline] = useState(tagline);
  const [returnPolicy, setReturnPolicy] = useState("14-Day Easy Returns");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    onSave({ storeName: name, tagline: storeTagline, returnPolicy });
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-lg rounded-3xl border border-[#ECEAF5] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-[#F0EBFE] text-[#6538F5]">
              <Store className="size-4" />
            </span>
            <h3 className="text-base font-bold text-[#110D27]">Store Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7A7F93] hover:bg-[#F4F2FC] hover:text-[#110D27]"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-[#110D27]">Store Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-[#110D27]">Tagline / Subtitle</label>
            <input
              type="text"
              value={storeTagline}
              onChange={(e) => setStoreTagline(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-[#110D27]">Return & Refund Policy</label>
            <select
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white"
            >
              <option value="14-Day Easy Returns">14-Day Easy Returns</option>
              <option value="7-Day Hassle-Free Returns">7-Day Hassle-Free Returns</option>
              <option value="30-Day Guarantee">30-Day Guarantee</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ECEAF5]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ECEAF5] px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F4F2FC]"
            >
              Close
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6538F5] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9]"
            >
              {isSaved ? (
                <>
                  <Check className="size-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Order Detail Modal ---
export function OrderDetailModal({
  order,
  onClose,
}: {
  order: DashboardOrder | null;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-md rounded-3xl border border-[#ECEAF5] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#110D27]">
              Order Details — {order.orderNumber}
            </h3>
            <span className="text-[11px] text-[#7A7F93] font-medium">{order.date}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7A7F93] hover:bg-[#F4F2FC] hover:text-[#110D27]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs">
          <div className="flex items-center gap-3 rounded-2xl bg-[#F9F8FD] p-3 border border-[#ECEAF5]">
            <img
              src={order.image}
              alt="Item thumbnail"
              className="size-12 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-[#110D27] block">Customer: {order.customerName}</span>
              <span className="text-[11px] text-[#7A7F93] block mt-0.5">
                Payment Verified • Pre-paid
              </span>
              <span className="text-sm font-extrabold text-[#6538F5] block mt-1">
                {order.formattedAmount}
              </span>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-[#ECEAF5] p-3.5">
            <div className="flex justify-between">
              <span className="text-[#7A7F93]">Fulfillment Status:</span>
              <span className="font-bold text-[#110D27]">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A7F93]">Delivery Partner:</span>
              <span className="font-bold text-[#110D27]">Vendora Express Logistics</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A7F93]">Tracking ID:</span>
              <span className="font-mono font-bold text-[#6538F5]">VND-98432-IN</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#6538F5] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9]"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
