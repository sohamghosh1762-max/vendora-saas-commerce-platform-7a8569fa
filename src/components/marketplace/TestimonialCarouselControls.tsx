import { ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialCarouselControlsProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext?: boolean;
}

export function TestimonialCarouselControls({
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
}: TestimonialCarouselControlsProps) {
  return (
    <>
      {/* Previous Button (Left Outer Edge) */}
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous testimonials"
        className="absolute -left-4 sm:-left-5 top-1/2 z-20 flex size-11 sm:size-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6E8F5] bg-white text-[#101438] shadow-[0_4px_16px_rgba(16,20,56,0.1)] transition-all duration-200 hover:scale-105 hover:border-[#6538F5]/40 hover:bg-[#F8F8FF] hover:text-[#6538F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6538F5] active:scale-95 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-5 sm:size-6" aria-hidden="true" />
      </button>

      {/* Next Button (Right Outer Edge) */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next testimonials"
        className="absolute -right-4 sm:-right-5 top-1/2 z-20 flex size-11 sm:size-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6E8F5] bg-white text-[#101438] shadow-[0_4px_16px_rgba(16,20,56,0.1)] transition-all duration-200 hover:scale-105 hover:border-[#6538F5]/40 hover:bg-[#F8F8FF] hover:text-[#6538F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6538F5] active:scale-95 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="size-5 sm:size-6" aria-hidden="true" />
      </button>
    </>
  );
}
