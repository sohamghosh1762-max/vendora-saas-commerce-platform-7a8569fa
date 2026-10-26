import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  HandHeart,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import heroShopper from "@/assets/hero-shopper.png";

const trustItems = [
  { icon: ShieldCheck, title: "Secure Payments", subtitle: "100% Safe & Encrypted" },
  { icon: RotateCcw, title: "Easy Returns", subtitle: "7-Day Policy" },
  { icon: BadgeCheck, title: "Verified Stores", subtitle: "Trusted Sellers" },
  { icon: HandHeart, title: "Support Small Business", subtitle: "Shop Local, Grow Together" },
];

const avatarTints = ["bg-cat-fashion", "bg-cat-electronics", "bg-cat-food"];
const avatarLetters = ["A", "R", "N"];

interface HeroSectionProps {
  onReplayIntro?: () => void;
}

export function HeroSection({ onReplayIntro }: HeroSectionProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate({ to: "/shop", search: q ? { q } : {} });
  };

  return (
    <section className="bg-hero-gradient relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-xs font-semibold text-primary-dark backdrop-blur">
              <Sparkles className="size-3.5" />
              500+ Independent Stores
            </span>
            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/60 px-3 py-1 text-xs font-semibold text-primary-dark backdrop-blur transition-all hover:bg-primary-soft hover:text-primary"
                title="Watch the cinematic brand introduction"
              >
                <Sparkles className="size-3 text-primary" />
                <span>Replay Intro</span>
              </button>
            )}
          </div>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
            One Platform.
            <span className="block">Thousands of Stores.</span>
            <span className="block text-primary">Endless Possibilities.</span>
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Discover unique products from independent businesses, shop securely, and support local
            sellers—all through one seamless platform.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark hover:shadow-float active:scale-[0.98]"
            >
              Shop Now
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/become-a-vendor"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
            >
              Become a Vendor
            </Link>
          </div>

          <form
            role="search"
            onSubmit={submitSearch}
            className="mt-6 flex max-w-xl items-center gap-2 rounded-full bg-card p-1.5 pl-5 shadow-card"
          >
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, categories, or stores..."
              aria-label="Search for products, categories, or stores"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Search"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              <Search className="size-5" />
            </button>
          </form>

          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trustItems.map((item) => (
              <li key={item.title} className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-background/70 text-primary">
                  <item.icon className="size-4.5" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-xs font-bold text-foreground">{item.title}</span>
                  <span className="text-[11px] text-muted-foreground">{item.subtitle}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex min-h-72 items-end justify-center lg:min-h-[30rem]">
          {/* Decorative shapes */}
          <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/50 blur-2xl" />
          <div className="absolute bottom-8 right-4 size-40 rounded-full bg-lavender-deep/80" />
          <div className="absolute left-6 top-6 size-24 rounded-3xl bg-pink-soft/90" />

          <span className="absolute -top-1 left-2 z-20 -rotate-6 font-script text-2xl font-semibold text-primary-dark lg:top-2 lg:left-0 lg:text-[1.7rem]">
            <span className="mr-1 inline-block not-italic">✦</span>Good Products,
            <br />
            <span className="ml-6">Brighter Stories</span>
          </span>

          <img
            src={heroShopper}
            alt="Smiling shopper carrying pastel shopping bags"
            width={1024}
            height={1280}
            className="relative z-10 max-h-72 w-auto object-contain drop-shadow-xl sm:max-h-96 lg:max-h-[30rem]"
          />

          <div className="absolute bottom-4 left-2 z-20 w-60 rounded-2xl bg-card p-4 shadow-lift sm:left-4 lg:-left-2">
            <p className="text-sm font-bold text-foreground">Shop from Independent Businesses</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex -space-x-2">
                {avatarLetters.map((letter, i) => (
                  <span
                    key={letter}
                    className={`grid size-7 place-items-center rounded-full border-2 border-card text-[10px] font-bold text-primary-foreground ${avatarTints[i]}`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold text-foreground">500+</span>
                <span className="text-[10px] text-muted-foreground">Active Vendors</span>
              </div>
              <Link
                to="/stores"
                aria-label="Browse stores"
                className="ml-auto grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition-colors hover:bg-primary-dark"
              >
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
