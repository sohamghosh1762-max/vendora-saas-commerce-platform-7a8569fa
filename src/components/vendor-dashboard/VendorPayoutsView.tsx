import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Plus,
  RotateCcw,
  Search,
  Wallet,
  X,
} from "lucide-react";
import type { PayoutStatus, VendorPayout, VendorPayoutSummary } from "@/lib/vendor-types";
import {
  getVendorPayouts,
  getVendorPayoutSummary,
  requestVendorPayout,
} from "@/lib/vendor-api";
import { formatINR } from "@/lib/format";

export interface VendorPayoutsViewProps {
  storeId?: string | undefined;
  storeName?: string | undefined;
}

const STATUS_CONFIG: Record<
  PayoutStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  Completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Processing: {
    label: "Processing",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  Pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Failed: {
    label: "Failed",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

export function VendorPayoutsView({
  storeId = "the-urban-nest",
  storeName = "The Urban Nest",
}: VendorPayoutsViewProps) {
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [summary, setSummary] = useState<VendorPayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PayoutStatus>("all");

  // Withdrawal modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("Bank Transfer (NEFT)");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const loadPayoutsData = () => {
    try {
      const items = getVendorPayouts(storeId);
      const summ = getVendorPayoutSummary(storeId);
      setPayouts(items);
      setSummary(summ);
      setError(null);
    } catch {
      setError("Failed to load payout settlements. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadPayoutsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const filteredPayouts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payouts.filter((p) => {
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.payoutMethod.toLowerCase().includes(q) ||
        (p.utrNumber && p.utrNumber.toLowerCase().includes(q)) ||
        p.bankAccountMasked.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payouts, search, statusFilter]);

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError("Please enter a valid amount.");
      return;
    }

    setSubmittingWithdrawal(true);
    setWithdrawError(null);

    const result = requestVendorPayout(storeId, amountNum, withdrawMethod);
    if (!result.success || !result.payout) {
      setWithdrawError(result.error || "Failed to submit withdrawal request.");
      setSubmittingWithdrawal(false);
      return;
    }

    // Refresh state
    setPayouts(getVendorPayouts(storeId));
    setSummary(getVendorPayoutSummary(storeId));
    setSubmittingWithdrawal(false);
    setIsModalOpen(false);
    setWithdrawAmount("");

    setFeedback({
      message: `Withdrawal request of ${formatINR(amountNum)} initiated successfully.`,
      isError: false,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#ECEAF5] bg-white p-8 text-center shadow-xs"
      >
        <div className="size-8 animate-spin rounded-full border-3 border-[#6538F5] border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-[#7A7F93]">Loading payouts and settlements...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center">
        <AlertCircle className="size-10 text-rose-500" />
        <h3 className="mt-3 text-base font-bold text-rose-900">Payout records unavailable</h3>
        <p className="mt-1 text-xs text-rose-700 max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadPayoutsData();
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
        >
          <RotateCcw className="size-3.5" />
          <span>Retry</span>
        </button>
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
            {feedback.isError ? (
              <AlertCircle className="size-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-600" />
            )}
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

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="payouts-kpi-summary">
        {/* Total Earnings */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Total Lifetime Earnings
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-[#F0EBFE] text-[#6538F5]">
              <Wallet className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#110D27]" data-testid="payout-total-earnings">
            {formatINR(summary.totalEarnings)}
          </div>
          <div className="mt-2 text-xs text-[#7A7F93]">Cumulative gross store sales</div>
        </div>

        {/* Available Balance */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Available Balance
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-900" data-testid="payout-available-balance">
            {formatINR(summary.availableBalance)}
          </div>
          <button
            type="button"
            onClick={() => {
              setWithdrawError(null);
              setIsModalOpen(true);
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <Plus className="size-3.5" />
            <span>Request Payout</span>
          </button>
        </div>

        {/* Pending Payouts */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Pending Payouts
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900" data-testid="payout-pending">
            {formatINR(summary.pendingPayouts)}
          </div>
          <div className="mt-2 text-xs text-amber-800">Processing via automated clearing house</div>
        </div>

        {/* Next Settlement Schedule */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Next Auto-Settlement
            </span>
            <div className="grid size-8 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Calendar className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-[#110D27]">
            {summary.nextPayoutDate}
          </div>
          <div className="mt-2 text-xs text-[#7A7F93]">Weekly direct bank transfer</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A7F93]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by payout ID, UTR number, or payment method..."
              className="w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] py-2 pl-9 pr-8 text-xs font-medium text-[#110D27] placeholder:text-[#7A7F93] focus:border-[#6538F5] focus:bg-white focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: "all", label: "All Payouts" },
                { id: "Completed", label: "Completed" },
                { id: "Processing", label: "Processing" },
                { id: "Pending", label: "Pending" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === item.id
                    ? "bg-[#6538F5] text-white shadow-xs"
                    : "bg-[#F9F8FD] text-[#7A7F93] hover:bg-[#F0EBFE] hover:text-[#6538F5]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payout Transactions Table */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="border-b border-[#ECEAF5] px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#110D27]">Payout History</h3>
            <p className="text-xs text-[#7A7F93]">Complete log of merchant disbursements</p>
          </div>
          <span className="text-xs font-semibold text-[#7A7F93]">
            {filteredPayouts.length} transactions
          </span>
        </div>

        {filteredPayouts.length === 0 ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center">
            <Building2 className="size-8 text-[#7A7F93]" />
            <h4 className="mt-3 text-sm font-bold text-[#110D27]">No payout records found</h4>
            <p className="mt-1 text-xs text-[#7A7F93]">
              {payouts.length === 0
                ? "No payouts have been scheduled or completed yet for this storefront."
                : "No payout transactions match your current search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" data-testid="payouts-table">
              <thead className="bg-[#FAF9FD] text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
                <tr>
                  <th className="px-5 py-3.5">Payout ID</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Method & Account</th>
                  <th className="px-5 py-3.5">Gross Amount</th>
                  <th className="px-5 py-3.5">Fee</th>
                  <th className="px-5 py-3.5">Net Disbursed</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAF5]">
                {filteredPayouts.map((p) => {
                  const cfg = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="transition hover:bg-[#F9F8FD]">
                      <td className="px-5 py-4 font-bold text-[#110D27]">
                        {p.id}
                        {p.utrNumber && (
                          <span className="block text-[10px] font-normal text-[#7A7F93]">
                            UTR: {p.utrNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[#7A7F93]">
                        {p.initiatedDate}
                        {p.completedDate && (
                          <span className="block text-[10px] text-emerald-600">
                            Cleared {p.completedDate}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#110D27]">{p.payoutMethod}</div>
                        <div className="text-[11px] text-[#7A7F93]">{p.bankAccountMasked}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-[#110D27]">
                        {formatINR(p.amount)}
                      </td>
                      <td className="px-5 py-4 text-[#7A7F93]">
                        {formatINR(p.fee)}
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-700">
                        {formatINR(p.netAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.bg} ${cfg.text}`}
                        >
                          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-payout-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
              <div>
                <h3 id="modal-payout-title" className="text-base font-black text-[#110D27]">
                  Request Payout Withdrawal
                </h3>
                <p className="text-xs text-[#7A7F93]">
                  Transfer available balance directly to your bank account
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="grid size-8 place-items-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} noValidate className="space-y-4">
              <div className="rounded-xl bg-[#F9F8FD] p-3.5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
                  Available For Withdrawal
                </span>
                <div className="text-2xl font-black text-emerald-700">
                  {formatINR(summary.availableBalance)}
                </div>
              </div>

              <div>
                <label htmlFor="payout-amount" className="block text-xs font-bold text-[#110D27]">
                  Withdrawal Amount (₹)
                </label>
                <input
                  id="payout-amount"
                  type="number"
                  step="1"
                  min="500"
                  max={summary.availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 text-xs font-bold text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
                  required
                />
                <span className="mt-1 block text-[10px] text-[#7A7F93]">
                  Minimum withdrawal threshold: ₹500
                </span>
              </div>

              <div>
                <label htmlFor="payout-method" className="block text-xs font-bold text-[#110D27]">
                  Receiving Account
                </label>
                <select
                  id="payout-method"
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 text-xs font-medium text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
                >
                  <option value="Bank Transfer (NEFT)">HDFC Bank (•••• 4892) - NEFT</option>
                  <option value="UPI Instant">UPI (rohan@okhdfcbank) - Instant</option>
                </select>
              </div>

              {withdrawError && (
                <p className="text-xs font-semibold text-rose-600">{withdrawError}</p>
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
                  disabled={submittingWithdrawal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] disabled:opacity-50"
                >
                  <span>{submittingWithdrawal ? "Processing..." : "Confirm Withdrawal"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
