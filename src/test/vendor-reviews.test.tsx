import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { VendorReviewsView } from "@/components/vendor-dashboard/VendorReviewsView";
import { VendorNonDashboardView } from "@/components/vendor-dashboard/VendorNonDashboardView";
import {
  getVendorReviews,
  getVendorReviewById,
  getVendorReviewStats,
  replyToVendorReview,
} from "@/lib/vendor-api";
import { saveStoredReviews } from "@/lib/vendor-storage";
import type { VendorReview } from "@/lib/vendor-types";

const testStoreId = "test-reviews-store";
const otherStoreId = "other-reviews-store";

const mockReviews: VendorReview[] = [
  {
    id: "rev-test-001",
    storeId: testStoreId,
    productId: "prod-101",
    productName: "Artisan Ceramic Cup",
    customerName: "Aarav Sharma",
    customerEmail: "aarav@example.com",
    rating: 5,
    comment: "Absolutely stunning glaze and comfortable to hold. Highly recommended!",
    date: "2026-11-10",
    verifiedPurchase: true,
    vendorReply: {
      replyText: "Thank you Aarav! We appreciate your support.",
      repliedAt: "2026-11-11T09:00:00.000Z",
      repliedBy: "Artisan Studio",
    },
  },
  {
    id: "rev-test-002",
    storeId: testStoreId,
    productId: "prod-102",
    productName: "Handmade Linen Coasters",
    customerName: "Diya Patel",
    customerEmail: "diya@example.com",
    rating: 4,
    comment: "Good linen texture, looks very neat on the dining table.",
    date: "2026-11-08",
    verifiedPurchase: true,
  },
  {
    id: "rev-test-003",
    storeId: testStoreId,
    productId: "prod-101",
    productName: "Artisan Ceramic Cup",
    customerName: "Rohan Varma",
    customerEmail: "rohan.v@example.com",
    rating: 3,
    comment: "Nice cup, but the capacity is slightly less than expected.",
    date: "2026-11-05",
    verifiedPurchase: true,
  },
  {
    id: "rev-other-001",
    storeId: otherStoreId,
    productId: "prod-999",
    productName: "Unrelated Store Item",
    customerName: "Stranger Danger",
    customerEmail: "stranger@example.com",
    rating: 1,
    comment: "Terrible quality from another vendor entirely.",
    date: "2026-11-01",
    verifiedPurchase: false,
  },
];

describe("Vendor Reviews and Ratings View", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    saveStoredReviews(mockReviews);
  });

  it("displays customer reviews with customer name, product name, rating, comment, and date", () => {
    render(<VendorReviewsView storeId={testStoreId} storeName="Test Artisan Store" />);

    // Customer names
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.getByText("Rohan Varma")).toBeInTheDocument();

    // Product names
    expect(screen.getAllByText("Artisan Ceramic Cup").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Handmade Linen Coasters")).toBeInTheDocument();

    // Comments
    expect(
      screen.getByText("Absolutely stunning glaze and comfortable to hold. Highly recommended!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Good linen texture, looks very neat on the dining table."),
    ).toBeInTheDocument();

    // Dates
    expect(screen.getByText("2026-11-10")).toBeInTheDocument();
    expect(screen.getByText("2026-11-08")).toBeInTheDocument();

    // Verified badge
    expect(screen.getAllByText("Verified Buyer").length).toBeGreaterThanOrEqual(1);
  });

  it("isolates reviews strictly by vendor storeId", () => {
    render(<VendorReviewsView storeId={testStoreId} storeName="Test Artisan Store" />);

    expect(screen.queryByText("Stranger Danger")).not.toBeInTheDocument();
    expect(screen.queryByText("Unrelated Store Item")).not.toBeInTheDocument();
    expect(screen.queryByText("Terrible quality from another vendor entirely.")).not.toBeInTheDocument();
  });

  it("displays average store rating and rating distribution statistics", () => {
    render(<VendorReviewsView storeId={testStoreId} storeName="Test Artisan Store" />);

    // Expected stats: 3 reviews (ratings 5, 4, 3) -> Average: (5+4+3)/3 = 4.0
    const ratingValueEl = screen.getByTestId("average-rating-value");
    expect(ratingValueEl).toHaveTextContent("4.0");
    expect(screen.getByText("(3 reviews)")).toBeInTheDocument();

    // Check distribution section contains distribution for stars
    const distSection = screen.getByTestId("rating-distribution-section");
    expect(within(distSection).getByText("5")).toBeInTheDocument();
    expect(within(distSection).getByText("4")).toBeInTheDocument();
    expect(within(distSection).getByText("3")).toBeInTheDocument();
  });

  it("filters reviews by star rating", async () => {
    render(<VendorReviewsView storeId={testStoreId} storeName="Test Artisan Store" />);

    // Initially all 3 reviews are visible
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.getByText("Rohan Varma")).toBeInTheDocument();

    // Click on 5 Stars filter pill
    const fiveStarButtons = screen.getAllByRole("button", { name: /5/i });
    fireEvent.click(fiveStarButtons[0]);

    // Only Aarav (5 stars) should be visible
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.queryByText("Diya Patel")).not.toBeInTheDocument();
    expect(screen.queryByText("Rohan Varma")).not.toBeInTheDocument();

    // Click on All Stars to reset
    const allStarsBtn = screen.getByRole("button", { name: /All Stars/i });
    fireEvent.click(allStarsBtn);

    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.getByText("Rohan Varma")).toBeInTheDocument();
  });

  it("searches reviews by product name or customer name", () => {
    render(<VendorReviewsView storeId={testStoreId} storeName="Test Artisan Store" />);

    const searchInput = screen.getByPlaceholderText(/Search by product name or customer name/i);

    // Search by customer name
    fireEvent.change(searchInput, { target: { value: "Diya" } });
    expect(screen.getByText("Diya Patel")).toBeInTheDocument();
    expect(screen.queryByText("Aarav Sharma")).not.toBeInTheDocument();
    expect(screen.queryByText("Rohan Varma")).not.toBeInTheDocument();

    // Search by product name
    fireEvent.change(searchInput, { target: { value: "Ceramic Cup" } });
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
    expect(screen.getByText("Rohan Varma")).toBeInTheDocument();
    expect(screen.queryByText("Diya Patel")).not.toBeInTheDocument();
  });

  it("allows vendors to view complete review details in modal", async () => {
    render(<VendorReviewsView storeId={testStoreId} storeName="Test Artisan Store" />);

    // Find the review card for Diya Patel
    const diyaCard = screen.getByTestId("review-card-rev-test-002");
    const viewDetailsBtn = within(diyaCard).getByRole("button", { name: /View Details/i });
    fireEvent.click(viewDetailsBtn);

    // Check modal opens
    const modal = screen.getByRole("dialog");
    expect(within(modal).getByText("Review Details")).toBeInTheDocument();
    expect(within(modal).getByText("diya@example.com")).toBeInTheDocument();
    expect(within(modal).getByText("Handmade Linen Coasters")).toBeInTheDocument();
    expect(
      within(modal).getByText("Good linen texture, looks very neat on the dining table."),
    ).toBeInTheDocument();

    // Close modal
    const closeBtn = within(modal).getByRole("button", { name: /Close review details/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("allows vendors to reply to reviews, updating the UI immediately and persisting in storage", async () => {
    render(<VendorReviewsView storeId={testStoreId} storeName="Test Artisan Store" />);

    // Diya's review does not have a reply yet
    const diyaCard = screen.getByTestId("review-card-rev-test-002");
    const replyBtn = within(diyaCard).getByRole("button", { name: /Reply to Review/i });
    fireEvent.click(replyBtn);

    // Reply textarea appears
    const textarea = within(diyaCard).getByPlaceholderText(/Write a courteous, professional response/i);
    fireEvent.change(textarea, {
      target: { value: "Thank you Diya! We are glad the coasters look great on your dining table." },
    });

    const sendBtn = within(diyaCard).getByRole("button", { name: /Send Reply/i });
    fireEvent.click(sendBtn);

    // Immediate UI feedback
    await waitFor(() => {
      expect(
        screen.getByText("Thank you Diya! We are glad the coasters look great on your dining table."),
      ).toBeInTheDocument();
    });

    // Check localStorage persistence via API
    const updatedReview = getVendorReviewById("rev-test-002", testStoreId);
    expect(updatedReview?.vendorReply?.replyText).toBe(
      "Thank you Diya! We are glad the coasters look great on your dining table.",
    );
  });

  it("prevents submitting empty review replies with clear validation", () => {
    render(<VendorReviewsView storeId={testStoreId} storeName="Test Artisan Store" />);

    const diyaCard = screen.getByTestId("review-card-rev-test-002");
    const replyBtn = within(diyaCard).getByRole("button", { name: /Reply to Review/i });
    fireEvent.click(replyBtn);

    const sendBtn = within(diyaCard).getByRole("button", { name: /Send Reply/i });
    fireEvent.click(sendBtn);

    expect(screen.getByText("Please enter a reply before submitting.")).toBeInTheDocument();
  });

  it("handles empty states clearly when no reviews match", () => {
    render(<VendorReviewsView storeId={testStoreId} storeName="Test Artisan Store" />);

    const searchInput = screen.getByPlaceholderText(/Search by product name or customer name/i);
    fireEvent.change(searchInput, { target: { value: "NonExistentQueryXYZ" } });

    expect(screen.getByText("No reviews found")).toBeInTheDocument();
    expect(
      screen.getByText(/No reviews match your current search or star rating filter/i),
    ).toBeInTheDocument();

    const resetBtns = screen.getAllByRole("button", { name: /Reset Filters/i });
    fireEvent.click(resetBtns[0]);

    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
  });

  it("renders correctly within VendorNonDashboardView when activeTab is reviews", () => {
    render(
      <VendorNonDashboardView
        activeTab="reviews"
        onBackToDashboard={() => {}}
        storeId={testStoreId}
        storeName="Test Artisan Store"
      />,
    );

    expect(screen.getByText("Ratings & Customer Reviews")).toBeInTheDocument();
    expect(screen.getByText("Overall Store Rating")).toBeInTheDocument();
    expect(screen.getByText("Aarav Sharma")).toBeInTheDocument();
  });
});
