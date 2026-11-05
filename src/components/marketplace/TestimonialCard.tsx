import { useState } from "react";
import { BadgeCheck, Quote, Star } from "lucide-react";
import type { Testimonial } from "@/data/testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const [imgError, setImgError] = useState(false);

  const initials = testimonial.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <figure className="relative flex h-full flex-col justify-between rounded-[28px] border border-[#E6E8F5] bg-white p-7 sm:p-8 shadow-[0_4px_24px_-4px_rgba(16,20,56,0.06)] transition-all duration-300 hover:border-[#6538F5]/30 hover:shadow-soft">
      {/* Top Section: Avatar + Stars on the Left, Quote Icon on the Right */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {testimonial.avatar && !imgError ? (
              <img
                src={testimonial.avatar}
                alt={`${testimonial.name}'s profile avatar`}
                onError={() => setImgError(true)}
                loading="lazy"
                width={56}
                height={56}
                className="size-13 shrink-0 rounded-full object-cover ring-2 ring-[#E6E8F5]"
              />
            ) : (
              <div className="grid size-13 shrink-0 place-items-center rounded-full bg-[#F0EBFF] text-sm font-black text-[#6538F5] ring-2 ring-[#E6E8F5]">
                {initials}
              </div>
            )}

            {/* 5 Gold Star Icons */}
            <div
              className="flex items-center gap-1"
              aria-label={`Rating: ${testimonial.rating} out of 5 stars`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`size-4.5 ${
                    i < testimonial.rating
                      ? "fill-[#EDB43B] text-[#EDB43B]"
                      : "fill-gray-200 text-gray-200"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          {/* Pale Violet Quotation Mark Icon */}
          <div className="shrink-0 text-[#6538F5]/25">
            <Quote className="size-8 rotate-180" aria-hidden="true" />
          </div>
        </div>

        {/* Testimonial Review Text */}
        <blockquote className="mt-5 text-sm sm:text-[15px] leading-relaxed text-[#68779A]">
          “{testimonial.text}”
        </blockquote>
      </div>

      {/* Bottom Section: Customer Name & Verified Buyer Badge */}
      <figcaption className="mt-6 border-t border-[#E6E8F5]/70 pt-4">
        <span className="block text-base font-bold text-[#101438]">{testimonial.name}</span>
        {testimonial.verified && (
          <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0CAF75]">
            <BadgeCheck className="size-4" aria-hidden="true" />
            <span>Verified Buyer</span>
          </span>
        )}
      </figcaption>
    </figure>
  );
}
