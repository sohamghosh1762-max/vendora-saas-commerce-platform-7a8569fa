import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { testimonials as initialTestimonials, type Testimonial } from "@/data/testimonials";
import { TestimonialCard } from "./TestimonialCard";
import { TestimonialCarouselControls } from "./TestimonialCarouselControls";
import { TestimonialPagination } from "./TestimonialPagination";

interface TestimonialsProps {
  items?: Testimonial[];
  autoPlayInterval?: number;
}

export function Testimonials({
  items = initialTestimonials,
  autoPlayInterval = 4000,
}: TestimonialsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
    duration: 35, // ~600ms smooth natural ease-in-out transition curve
    containScroll: false,
    breakpoints: {
      "(min-width: 640px)": { slidesToScroll: 1 },
      "(min-width: 1024px)": { slidesToScroll: 1 },
    },
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync scroll snap points & selected index with pagination
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
    };
  }, [emblaApi, onInit, onSelect]);

  // Robust, continuous autoplay mechanism
  const resetAutoplayTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!emblaApi || isInteracting) return;

    // Respect user's system preference for reduced motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    timerRef.current = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      emblaApi.scrollNext();
    }, autoPlayInterval);
  }, [emblaApi, isInteracting, autoPlayInterval]);

  // Start & manage continuous autoplay lifecycle
  useEffect(() => {
    resetAutoplayTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resetAutoplayTimer]);

  // Pause when window/tab is hidden and resume smoothly when active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        resetAutoplayTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [resetAutoplayTimer]);

  // Manual navigation handlers that seamlessly restart the 4s timer
  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      resetAutoplayTimer();
    }
  }, [emblaApi, resetAutoplayTimer]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      resetAutoplayTimer();
    }
  }, [emblaApi, resetAutoplayTimer]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
        resetAutoplayTimer();
      }
    },
    [emblaApi, resetAutoplayTimer],
  );

  // Accessible keyboard navigation (Left/Right Arrow)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollNext();
    }
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer Testimonials"
      className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 sm:py-20"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocus={() => setIsInteracting(true)}
      onBlur={() => setIsInteracting(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Section Heading & Subtitle */}
      <div className="mb-10 text-left">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#101438] sm:text-3xl lg:text-[2rem]">
          What Our Customers Say
        </h2>
        <p className="mt-2 text-sm sm:text-base font-normal text-[#68779A]">
          Real stories from real people.
        </p>
      </div>

      {/* Carousel Outer Container with Left and Right Overlapping Buttons */}
      <div className="relative">
        {/* Navigation Chevron Buttons */}
        <TestimonialCarouselControls
          onPrev={scrollPrev}
          onNext={scrollNext}
          canPrev={true}
          canNext={true}
        />

        {/* Embla Viewport */}
        <div ref={emblaRef} className="overflow-hidden cursor-grab active:cursor-grabbing py-2">
          {/* Embla Slides Container */}
          <div className="flex -ml-6">
            {items.map((testimonial, idx) => (
              <div
                key={testimonial.id || idx}
                role="group"
                aria-roledescription="slide"
                aria-label={`${idx + 1} of ${items.length}`}
                className="min-w-0 flex-[0_0_100%] pl-6 sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%]"
              >
                <div className="h-full">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centered Pagination Indicators */}
      <TestimonialPagination
        total={scrollSnaps.length || items.length}
        selectedIndex={selectedIndex}
        onSelect={scrollTo}
      />
    </section>
  );
}
