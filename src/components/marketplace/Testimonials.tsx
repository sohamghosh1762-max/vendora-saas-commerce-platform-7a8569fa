import { BadgeCheck, ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useState } from "react";
import { testimonials } from "@/data/testimonials";
import avatarAditi from "@/assets/avatar-aditi.jpg";
import avatarRohan from "@/assets/avatar-rohan.jpg";
import avatarNehak from "@/assets/avatar-nehak.jpg";
import { cn } from "@/lib/utils";

/** Photos for the first three storytellers; the rest use tinted initials. */
const avatarImages = [avatarAditi, avatarRohan, avatarNehak];
const avatarTints = ["bg-cat-beauty", "bg-cat-books", "bg-cat-sports", "bg-cat-food"];

function TestimonialCard({ index }: { index: number }) {
  const t = testimonials[index];
  const photo = avatarImages[index % avatarImages.length];

  return (
    <figure className="relative flex flex-col rounded-2xl border bg-card p-6 shadow-soft">
      <Quote className="absolute right-5 top-5 size-8 text-primary-soft" aria-hidden />
      <div className="flex items-center gap-3">
        {photo ? (
          <img
            src={photo}
            alt={t.name}
            loading="lazy"
            width={512}
            height={512}
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <span
            className={`grid size-12 place-items-center rounded-full text-base font-bold text-primary-foreground ${avatarTints[index % avatarTints.length]}`}
          >
            {t.name.charAt(0)}
          </span>
        )}
        <div className="flex gap-0.5" aria-label="Rated 5 out of 5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="size-4 fill-gold text-gold" />
          ))}
        </div>
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {t.text}
      </blockquote>
      <figcaption className="mt-4">
        <span className="block text-sm font-bold text-foreground">{t.name}</span>
        <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-success">
          <BadgeCheck className="size-3.5" />
          Verified Buyer
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const [start, setStart] = useState(0);
  const count = testimonials.length;
  const rotate = (dir: number) => setStart((s) => (s + dir + count) % count);
  const visible = Array.from({ length: Math.min(3, count) }, (_, i) => (start + i) % count);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          What Our Customers Say
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Real stories from real people.</p>
      </div>

      <div className="relative">
        <button
          onClick={() => rotate(-1)}
          aria-label="Previous testimonials"
          className="absolute -left-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border bg-card text-foreground shadow-soft transition-colors hover:bg-accent md:grid"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="grid gap-4 md:grid-cols-3">
          {visible.map((index) => (
            <TestimonialCard key={index} index={index} />
          ))}
        </div>

        <button
          onClick={() => rotate(1)}
          aria-label="Next testimonials"
          className="absolute -right-3 top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border bg-card text-foreground shadow-soft transition-colors hover:bg-accent md:grid"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-5 flex justify-center gap-1.5">
        {testimonials.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-colors",
              i === start ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
    </section>
  );
}
