import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Copy,
  Megaphone,
  Percent,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import type { VendorCoupon } from "@/lib/vendor-types";
import {
  createVendorCoupon,
  getVendorCoupons,
  toggleCouponStatus,
} from "@/lib/vendor-api";
import { formatINR } from "@/lib/format";

export interface VendorMarketingViewProps {
  storeId?: string | undefined;
  storeName?: string | undefined;
}

export function VendorMarketingView({
  storeId = "the-urban-nest",
  storeName = "The Urban Nest",
}: VendorMarketingViewProps) {
  const [coupons, setCoupons] = useState<VendorCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [expiryDate, setExpiryDate] = useState("2026-12-31");
  const [formError, setFormError] = useState<string | null>(null);

  // Feedback
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadData = () => {
    try {
      const items = getVendorCoupons(storeId);
      setCoupons(items);
      setError(null);
    } catch {
      setError("Failed to load discount campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const handleToggle = (couponId: string) => {
    const res = toggleCouponStatus(storeId, couponId);
    if (res.success && res.coupon) {
      setCoupons(getVendorCoupons(storeId));
      setFeedback({
        message: `Coupon '${res.coupon.code}' is now ${res.coupon.status}.`,
        isError: false,
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(discountValue);
    const min = parseFloat(minOrder) || 0;

    if (isNaN(val) || val <= 0) {
      setFormError("Please enter a valid discount value.");
      return;
    }

    const res = createVendorCoupon(storeId, {
      code: newCode,
      discountType,
      discountValue: val,
      minOrderValue: min,
      expiryDate,
      status: "active",
    });

    if (!res.success || !res.coupon) {
      setFormError(res.error || "Failed to create coupon.");
      return;
    }

    setCoupons(getVendorCoupons(storeId));
    setIsModalOpen(false);
    setNewCode("");
    setDiscountValue("");
    setMinOrder("");
    setFormError(null);

    setFeedback({
      message: `Coupon code '${res.coupon.code}' created successfully!`,
      isError: false,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#ECEAF5] bg-white p-8 text-center shadow-xs"
      >
        <div className="size-8 animate-spin rounded-full border-3 border-[#6538F5] border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-[#7A7F93]">Loading promotional campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold shadow-xs ${
            feedback.isError
              ? "border border-rose-200 bg-rose-50 text-rose-800"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Campaign Banner Header */}
      <div className="rounded-2xl border border-[#D6CEFC] bg-gradient-to-r from-[#F0EBFE] to-[#FAF9FF] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#6538F5] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            <Sparkles className="size-3" />
            Merchant Promotions
          </span>
          <h3 className="mt-2 text-lg font-black text-[#110D27]">
            Coupons & Festive Campaigns
          </h3>
          <p className="mt-1 text-xs text-[#7A7F93]">
            Boost sales conversion for {storeName} with discount vouchers, site-wide codes, and minimum basket thresholds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6538F5] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] shrink-0"
        >
          <Plus className="size-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table / Grid */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="border-b border-[#ECEAF5] px-5 py-4 flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-[#110D27]">Active Discount Vouchers</h4>
            <p className="text-xs text-[#7A7F93]">Manage storefront promotional discount codes</p>
          </div>
          <span className="text-xs font-semibold text-[#7A7F93]">
            {coupons.length} vouchers
          </span>
        </div>

        {coupons.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
            <Tag className="size-8 text-[#7A7F93]" />
            <h4 className="mt-3 text-sm font-bold text-[#110D27]">No active coupons yet</h4>
            <p className="mt-1 text-xs text-[#7A7F93]">
              Create promotional discount codes to incentivize checkout and repeat orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" data-testid="coupons-table">
              <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Discount Offer</th>
                  <th className="px-5 py-3.5">Min. Order</th>
                  <th className="px-5 py-3.5">Redemptions</th>
                  <th className="px-5 py-3.5">Expiry Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAF5]">
                {coupons.map((coupon) => {
                  const isActive = coupon.status === "active";
                  return (
                    <tr key={coupon.id} className="transition hover:bg-[#F9F8FD]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-[#F0EBFE] px-2.5 py-1 font-mono text-xs font-black text-[#6538F5]">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy code"
                          >
                            <Copy className="size-3" />
                          </button>
                          {copiedCode === coupon.code && (
                            <span className="text-[10px] font-semibold text-emerald-600">Copied</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-[#110D27]">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `${formatINR(coupon.discountValue)} FLAT OFF`}
                      </td>
                      <td className="px-5 py-4 text-[#7A7F93]">
                        {coupon.minOrderValue > 0 ? formatINR(coupon.minOrderValue) : "No minimum"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#110D27]">
                        {coupon.usedCount} times
                      </td>
                      <td className="px-5 py-4 text-[#7A7F93]">
                        {coupon.expiryDate}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {coupon.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggle(coupon.id)}
                          className="text-xs font-bold text-[#6538F5] hover:underline"
                        >
                          {isActive ? "Pause" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
              <div>
                <h3 className="text-base font-black text-[#110D27]">Create Discount Code</h3>
                <p className="text-xs text-[#7A7F93]">Set promo parameters for shopper checkout</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="grid size-8 place-items-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#110D27]">Coupon Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH25"
                  className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 font-mono text-xs font-bold uppercase text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#110D27]">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "flat")}
                    className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 text-xs font-medium text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#110D27]">
                    Discount Value {discountType === "percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === "percentage" ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "percentage" ? "15" : "200"}
                    className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 text-xs font-bold text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#110D27]">Min. Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="999"
                    className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 text-xs font-medium text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#110D27]">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 text-xs font-medium text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs font-semibold text-rose-600">{formError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#7A7F93] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9]"
                >
                  Create Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

