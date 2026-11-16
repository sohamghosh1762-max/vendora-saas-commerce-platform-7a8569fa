import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  Package,
  RotateCcw,
  Search,
  Send,
  Star,
  User,
  X,
} from "lucide-react";
import type { VendorReview, VendorReviewStats } from "@/lib/vendor-types";
import {
  getVendorReviews,
  getVendorReviewStats,
  replyToVendorReview,
} from "@/lib/vendor-api";

export interface VendorReviewsViewProps {
  storeId?: string | undefined;
  storeName?: string | undefined;
}

export type StarFilter = "all" | 5 | 4 | 3 | 2 | 1;
export type ResponseFilter = "all" | "replied" | "unreplied";

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(rating);
        return (
          <Star
            key={star}
            className={`${iconSize} ${
              isFilled ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-300"
            }`}
          />
        );
      })}
    </div>
  );
}

export function VendorReviewsView({
  storeId = "the-urban-nest",
  storeName = "The Urban Nest",
}: VendorReviewsViewProps) {
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [stats, setStats] = useState<VendorReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState<StarFilter>("all");
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>("all");

  // Inline replying
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [inlineReplyText, setInlineReplyText] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Modal details
  const [selectedReview, setSelectedReview] = useState<VendorReview | null>(null);
  const [modalReplyText, setModalReplyText] = useState("");
  const [modalReplyError, setModalReplyError] = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const loadData = () => {
    try {
      const items = getVendorReviews(storeId);
      const computedStats = getVendorReviewStats(storeId);
      setReviews(items);
      setStats(computedStats);
      setError(null);
    } catch {
      setError("Customer reviews could not be loaded. Please refresh or check storage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // Sync modal reply text when modal review changes
  useEffect(() => {
    if (selectedReview) {
      setModalReplyText(selectedReview.vendorReply?.replyText || "");
      setModalReplyError(null);
    }
  }, [selectedReview]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((review) => {
      // Search
      const matchesSearch =
        !query ||
        review.customerName.toLowerCase().includes(query) ||
        review.productName.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query) ||
        Boolean(review.customerEmail?.toLowerCase().includes(query));

      // Star filter
      const matchesStar =
        starFilter === "all" || Math.round(review.rating) === starFilter;

      // Response filter
      const hasReply = Boolean(review.vendorReply && review.vendorReply.replyText.trim().length > 0);
      const matchesResponse =
        responseFilter === "all" ||
        (responseFilter === "replied" && hasReply) ||
        (responseFilter === "unreplied" && !hasReply);

      return matchesSearch && matchesStar && matchesResponse;
    });
  }, [reviews, search, starFilter, responseFilter]);

  // Handle inline reply submission
  const handleInlineReplySubmit = (reviewId: string) => {
    const trimmed = inlineReplyText.trim();
    if (!trimmed) {
      setReplyError("Please enter a reply before submitting.");
      return;
    }

    setSubmittingReply(true);
    setReplyError(null);

    const result = replyToVendorReview(reviewId, trimmed, storeId, storeName);
    if (!result.success || !result.review) {
      setReplyError(result.error || "Failed to save reply.");
      setSubmittingReply(false);
      return;
    }

    const updated = result.review;
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setStats(getVendorReviewStats(storeId));
    setReplyingToId(null);
    setInlineReplyText("");
    setSubmittingReply(false);

    setFeedback({ message: "Reply published successfully!", isError: false });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Handle modal reply submission
  const handleModalReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    const trimmed = modalReplyText.trim();
    if (!trimmed) {
      setModalReplyError("Please enter a reply before submitting.");
      return;
    }

    setModalSubmitting(true);
    setModalReplyError(null);

    const result = replyToVendorReview(selectedReview.id, trimmed, storeId, storeName);
    if (!result.success || !result.review) {
      setModalReplyError(result.error || "Failed to save reply.");
      setModalSubmitting(false);
      return;
    }

    const updated = result.review;
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedReview(updated);
    setStats(getVendorReviewStats(storeId));
    setModalSubmitting(false);

    setFeedback({ message: "Reply published successfully!", isError: false });
    setTimeout(() => setFeedback(null), 3000);
  };

  const clearAllFilters = () => {
    setSearch("");
    setStarFilter("all");
    setResponseFilter("all");
  };

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#ECEAF5] bg-white p-8 text-center shadow-xs"
      >
        <div className="size-8 animate-spin rounded-full border-3 border-[#6538F5] border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-[#7A7F93]">Loading customer reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center">
        <AlertCircle className="size-10 text-rose-500" />
        <h3 className="mt-3 text-base font-bold text-rose-900">Failed to load reviews</h3>
        <p className="mt-1 text-xs text-rose-700 max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadData();
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
        >
          <RotateCcw className="size-3.5" />
          <span>Try Again</span>
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
            aria-label="Dismiss feedback"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Review Statistics & Rating Distribution */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Average Rating Card */}
          <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
              Overall Store Rating
            </span>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-4xl font-black text-[#110D27]" data-testid="average-rating-value">
                {stats.averageRating.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-[#7A7F93]">/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={stats.averageRating} size="md" />
              <span className="text-xs font-semibold text-[#7A7F93]">
                ({stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
            <p className="mt-3 text-xs text-[#7A7F93]">
              Based on verified purchases across all active catalog products.
            </p>
          </div>

          {/* Rating Distribution Breakdown */}
          <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] sm:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
                Rating Distribution
              </span>
              <span className="text-xs font-semibold text-[#6538F5]">
                {stats.totalReviews} Total Feedback
              </span>
            </div>

            <div className="mt-3 space-y-2" data-testid="rating-distribution-section">
              {([5, 4, 3, 2, 1] as const).map((stars) => {
                const count = stats.distribution[stars];
                const pct = stats.distributionPercentages[stars];
                const isSelected = starFilter === stars;
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setStarFilter(isSelected ? "all" : stars)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left transition hover:bg-[#F9F8FD] ${
                      isSelected ? "bg-[#F0EBFE]" : ""
                    }`}
                    title={`Filter by ${stars} stars`}
                  >
                    <div className="flex w-14 items-center gap-1 text-xs font-bold text-[#110D27]">
                      <span>{stars}</span>
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-xs font-semibold text-[#7A7F93]">
                      <span>{count}</span>
                      <span className="text-[10px] text-gray-400"> ({pct}%)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A7F93]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or customer name..."
              className="w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] py-2 pl-9 pr-8 text-xs font-medium text-[#110D27] placeholder:text-[#7A7F93] focus:border-[#6538F5] focus:bg-white focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Response Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: "all", label: "All Reviews" },
                { id: "unreplied", label: "Needs Reply" },
                { id: "replied", label: "Replied" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setResponseFilter(item.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  responseFilter === item.id
                    ? "bg-[#6538F5] text-white shadow-xs"
                    : "bg-[#F9F8FD] text-[#7A7F93] hover:bg-[#F0EBFE] hover:text-[#6538F5]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Star Rating Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-[#ECEAF5] pt-3">
          <span className="text-[11px] font-bold text-[#7A7F93] mr-1 whitespace-nowrap">
            Rating:
          </span>
          <button
            type="button"
            onClick={() => setStarFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              starFilter === "all"
                ? "bg-[#110D27] text-white"
                : "bg-gray-100 text-[#7A7F93] hover:bg-gray-200"
            }`}
          >
            All Stars
          </button>
          {([5, 4, 3, 2, 1] as const).map((stars) => {
            const count = stats?.distribution[stars] || 0;
            const isSelected = starFilter === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setStarFilter(stars)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition whitespace-nowrap ${
                  isSelected
                    ? "bg-[#6538F5] text-white"
                    : "bg-gray-100 text-[#7A7F93] hover:bg-[#F0EBFE] hover:text-[#6538F5]"
                }`}
              >
                <span>{stars}</span>
                <Star
                  className={`size-3 ${
                    isSelected ? "fill-white text-white" : "fill-amber-400 text-amber-400"
                  }`}
                />
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}

          {(search || starFilter !== "all" || responseFilter !== "all") && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-[#6538F5] hover:underline whitespace-nowrap"
            >
              <RotateCcw className="size-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Review List */}
      {filteredReviews.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#ECEAF5] bg-white p-8 text-center shadow-xs">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#F0EBFE] text-[#6538F5]">
            <MessageSquare className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-[#110D27]">No reviews found</h3>
          <p className="mt-1 max-w-md text-xs text-[#7A7F93]">
            {reviews.length === 0
              ? "Your store has not received any customer reviews yet. Once customers share feedback, it will appear here."
              : "No reviews match your current search or star rating filter. Try adjusting your filter parameters."}
          </p>
          {(search || starFilter !== "all" || responseFilter !== "all") && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9]"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#7A7F93]">
            <span>
              Showing {filteredReviews.length} of {reviews.length} reviews
            </span>
            {starFilter !== "all" && (
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-800 border border-amber-200">
                Filtered: {starFilter} Stars
              </span>
            )}
          </div>

          {filteredReviews.map((review) => {
            const hasReply = Boolean(
              review.vendorReply && review.vendorReply.replyText.trim().length > 0,
            );
            const isReplyingInline = replyingToId === review.id;

            return (
              <div
                key={review.id}
                data-testid={`review-card-${review.id}`}
                className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:border-[#D6CEFC]"
              >
                {/* Header: Customer, Rating, Product, Date */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F0EBFE] text-xs font-black text-[#6538F5]">
                      {review.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#110D27]">
                          {review.customerName}
                        </h4>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            <Check className="size-2.5" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs font-bold text-amber-600">
                          {review.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#7A7F93]">
                          <Package className="size-3 text-[#6538F5]" />
                          <span>{review.productName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start text-xs font-medium text-[#7A7F93]">
                    <Clock className="size-3.5 text-gray-400" />
                    <span>{review.date}</span>
                  </div>
                </div>

                {/* Review Body */}
                <p className="mt-3 text-xs leading-relaxed text-[#373D53]">
                  {review.comment}
                </p>

                {/* Existing Vendor Reply Box */}
                {hasReply && review.vendorReply && (
                  <div className="mt-4 rounded-xl border border-[#ECEAF5] bg-[#FAF9FF] p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#6538F5]">
                        <MessageSquare className="size-3.5" />
                        <span>Response from {review.vendorReply.repliedBy || storeName}</span>
                      </div>
                      <span className="text-[10px] text-[#7A7F93]">
                        {new Date(review.vendorReply.repliedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#4A4F68] leading-relaxed">
                      {review.vendorReply.replyText}
                    </p>
                  </div>
                )}

                {/* Inline Reply Composer Form */}
                {isReplyingInline && (
                  <div className="mt-4 rounded-xl border border-[#D6CEFC] bg-[#FAF9FF] p-3.5 space-y-2">
                    <label
                      htmlFor={`inline-reply-${review.id}`}
                      className="text-xs font-bold text-[#110D27]"
                    >
                      {hasReply ? "Edit Response to Customer" : "Reply to Customer"}
                    </label>
                    <textarea
                      id={`inline-reply-${review.id}`}
                      rows={3}
                      value={inlineReplyText}
                      onChange={(e) => setInlineReplyText(e.target.value)}
                      placeholder="Write a courteous, professional response..."
                      className="w-full rounded-lg border border-[#ECEAF5] bg-white p-2.5 text-xs font-medium text-[#110D27] placeholder:text-gray-400 focus:border-[#6538F5] focus:outline-none"
                    />
                    {replyError && (
                      <p className="text-xs font-semibold text-rose-600">{replyError}</p>
                    )}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(null);
                          setInlineReplyText("");
                          setReplyError(null);
                        }}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#7A7F93] hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submittingReply}
                        onClick={() => handleInlineReplySubmit(review.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#6538F5] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] disabled:opacity-50"
                      >
                        <Send className="size-3" />
                        <span>{submittingReply ? "Saving..." : hasReply ? "Update Reply" : "Send Reply"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="mt-4 flex items-center justify-between border-t border-[#ECEAF5] pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedReview(review)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6538F5] hover:underline"
                  >
                    <Eye className="size-3.5" />
                    <span>View Details</span>
                  </button>

                  {!isReplyingInline && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToId(review.id);
                        setInlineReplyText(review.vendorReply?.replyText || "");
                        setReplyError(null);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#ECEAF5] bg-white px-3 py-1.5 text-xs font-bold text-[#110D27] shadow-xs hover:bg-[#F9F8FD] hover:text-[#6538F5]"
                    >
                      <MessageSquare className="size-3.5 text-[#6538F5]" />
                      <span>{hasReply ? "Edit Reply" : "Reply to Review"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Details Modal */}
      {selectedReview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-review-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-4">
              <div>
                <h3 id="modal-review-title" className="text-base font-black text-[#110D27]">
                  Review Details
                </h3>
                <p className="text-xs text-[#7A7F93]">
                  Verified feedback from customer {selectedReview.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="grid size-8 place-items-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"
                aria-label="Close review details"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Customer & Product Information */}
            <div className="rounded-xl bg-[#F9F8FD] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-xl bg-[#F0EBFE] text-xs font-black text-[#6538F5]">
                    {selectedReview.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#110D27]">
                      {selectedReview.customerName}
                    </h4>
                    {selectedReview.customerEmail && (
                      <p className="text-[11px] text-[#7A7F93]">
                        {selectedReview.customerEmail}
                      </p>
                    )}
                  </div>
                </div>
                {selectedReview.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    <Check className="size-2.5" />
                    Verified Buyer
                  </span>
                )}
              </div>

              <div className="border-t border-[#ECEAF5] pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#110D27]">
                  <Package className="size-3.5 text-[#6538F5]" />
                  <span>{selectedReview.productName}</span>
                </div>
                <span className="text-[#7A7F93]">{selectedReview.date}</span>
              </div>
            </div>

            {/* Rating and Comment */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StarRating rating={selectedReview.rating} size="lg" />
                <span className="text-base font-black text-amber-600">
                  {selectedReview.rating.toFixed(1)} / 5.0
                </span>
              </div>
              <p className="rounded-xl border border-[#ECEAF5] bg-white p-3.5 text-xs text-[#373D53] leading-relaxed">
                {selectedReview.comment}
              </p>
            </div>

            {/* Vendor Reply in Modal */}
            <form onSubmit={handleModalReplySubmit} className="space-y-3 border-t border-[#ECEAF5] pt-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="modal-reply-textarea"
                  className="text-xs font-bold text-[#110D27]"
                >
                  {selectedReview.vendorReply
                    ? "Edit Store Response"
                    : "Add Store Response"}
                </label>
                {selectedReview.vendorReply && (
                  <span className="text-[10px] text-[#7A7F93]">
                    Last replied:{" "}
                    {new Date(selectedReview.vendorReply.repliedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <textarea
                id="modal-reply-textarea"
                rows={3}
                value={modalReplyText}
                onChange={(e) => setModalReplyText(e.target.value)}
                placeholder="Write an appreciative or helpful response to this review..."
                className="w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-3 text-xs font-medium text-[#110D27] placeholder:text-[#7A7F93] focus:border-[#6538F5] focus:bg-white focus:outline-none"
              />

              {modalReplyError && (
                <p className="text-xs font-semibold text-rose-600">{modalReplyError}</p>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#7A7F93] hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] disabled:opacity-50"
                >
                  <Send className="size-3.5" />
                  <span>
                    {modalSubmitting
                      ? "Saving..."
                      : selectedReview.vendorReply
                        ? "Update Response"
                        : "Publish Response"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

