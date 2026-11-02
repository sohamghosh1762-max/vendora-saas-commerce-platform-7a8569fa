interface TestimonialPaginationProps {
  total: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function TestimonialPagination({
  total,
  selectedIndex,
  onSelect,
}: TestimonialPaginationProps) {
  if (total <= 1) return null;

  return (
    <div
      role="tablist"
      aria-label="Testimonial carousel pages"
      className="mt-8 flex items-center justify-center gap-2"
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === selectedIndex;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => onSelect(i)}
            className={`transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6538F5] focus-visible:ring-offset-2 ${
              isActive
                ? "h-2.5 w-6 rounded-full bg-[#6538F5]"
                : "size-2.5 rounded-full bg-[#E6E8F5] hover:bg-[#6538F5]/40"
            }`}
          />
        );
      })}
    </div>
  );
}
