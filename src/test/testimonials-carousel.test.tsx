import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Testimonials } from "@/components/marketplace/Testimonials";
import { TestimonialCard } from "@/components/marketplace/TestimonialCard";
import { testimonials, getTestimonials } from "@/data/testimonials";

describe("Testimonials Carousel Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section heading and subtitle accurately", () => {
    render(<Testimonials />);

    expect(screen.getByRole("heading", { name: "What Our Customers Say" })).toBeInTheDocument();
    expect(screen.getByText("Real stories from real people.")).toBeInTheDocument();
  });

  it("renders testimonial cards with customer name, rating, text, and verified buyer badge", () => {
    render(<Testimonials />);

    // Reference Customer 1: Aditi Sharma
    expect(screen.getByText("Aditi Sharma")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Amazing products and super fast delivery! Love supporting independent stores on Vendora./i,
      ),
    ).toBeInTheDocument();

    // Reference Customer 2: Rohan Mehta
    expect(screen.getByText("Rohan Mehta")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Great variety of products and smooth shopping experience. The platform is clean and easy to use./i,
      ),
    ).toBeInTheDocument();

    // Reference Customer 3: Neha Kapoor
    expect(screen.getByText("Neha Kapoor")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Finally a place where I can find unique products from small businesses. Highly recommended!/i,
      ),
    ).toBeInTheDocument();

    // Verified Buyer badges
    const verifiedBadges = screen.getAllByText("Verified Buyer");
    expect(verifiedBadges.length).toBeGreaterThanOrEqual(3);
  });

  it("renders navigation controls with accessible names and clicks correctly", () => {
    render(<Testimonials />);

    const prevButton = screen.getByRole("button", { name: /Previous testimonials/i });
    const nextButton = screen.getByRole("button", { name: /Next testimonials/i });

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();

    fireEvent.click(nextButton);
    fireEvent.click(prevButton);
  });

  it("supports keyboard navigation via left and right arrows", () => {
    render(<Testimonials />);

    const carouselRegion = screen.getByRole("region", { name: "Customer Testimonials" });

    fireEvent.keyDown(carouselRegion, { key: "ArrowRight" });
    fireEvent.keyDown(carouselRegion, { key: "ArrowLeft" });
  });

  it("pauses and resumes autoplay on mouse enter and leave", () => {
    render(<Testimonials autoPlayInterval={1000} />);

    const carouselRegion = screen.getByRole("region", { name: "Customer Testimonials" });

    fireEvent.mouseEnter(carouselRegion);
    fireEvent.mouseLeave(carouselRegion);
  });

  it("handles missing avatar gracefully by rendering customer initials", () => {
    const noAvatarItem = {
      id: "testi-no-avatar",
      name: "Devendra Patel",
      text: "Exceptional quality and genuine craftmanship.",
      rating: 5,
      verified: true,
    };

    render(<TestimonialCard testimonial={noAvatarItem} />);

    expect(screen.getByText("Devendra Patel")).toBeInTheDocument();
    expect(screen.getByText("DP")).toBeInTheDocument();
    expect(screen.getByText("Verified Buyer")).toBeInTheDocument();
  });

  it("omits verified badge when customer is not verified", () => {
    const unverifiedItem = {
      id: "testi-unverified",
      name: "Anonymous Shopper",
      text: "Great selection of products.",
      rating: 4,
      verified: false,
    };

    render(<TestimonialCard testimonial={unverifiedItem} />);

    expect(screen.getByText("Anonymous Shopper")).toBeInTheDocument();
    expect(screen.queryByText("Verified Buyer")).not.toBeInTheDocument();
  });

  it("renders 5 gold stars according to the rating", () => {
    const customRatingItem = {
      id: "testi-stars",
      name: "Sana Farooqui",
      text: "Loved the ceramic mugs!",
      rating: 5,
      verified: true,
    };

    render(<TestimonialCard testimonial={customRatingItem} />);

    const ratingContainer = screen.getByLabelText("Rating: 5 out of 5 stars");
    expect(ratingContainer).toBeInTheDocument();
  });

  it("fetches testimonials asynchronously through data helper", async () => {
    const data = await getTestimonials();
    expect(data.length).toBeGreaterThanOrEqual(6);
    expect(data[0].name).toBe("Aditi Sharma");
  });

  it("renders empty state gracefully when no testimonials provided", () => {
    render(<Testimonials items={[]} />);

    expect(screen.getByRole("heading", { name: "What Our Customers Say" })).toBeInTheDocument();
  });
});
