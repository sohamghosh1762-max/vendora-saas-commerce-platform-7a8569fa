import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import promoSneaker from "@/assets/promo-sneaker.jpg";
import promoSofa from "@/assets/promo-sofa.jpg";

export function PromoBanners() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Mega Sale */}
        <div className="bg-promo-gradient relative flex items-center overflow-hidden rounded-3xl">
          <div className="flex-1 py-10 pl-8 pr-2 lg:py-14 lg:pl-10">
            <h3 className="text-2xl font-extrabold leading-tight text-primary-foreground lg:text-[1.9rem]">
              Mega Sale
              <span className="block">Up to 50% Off</span>
            </h3>
            <p className="mt-2 max-w-56 text-sm text-primary-foreground/80">
              Top products from your favourite stores.
            </p>
            <Link
              to="/deals"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Shop Now
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <img
            src={promoSneaker}
            alt="Premium sneaker on a purple gradient"
            loading="lazy"
            width={1024}
            height={1024}
            className="hidden h-full w-[45%] self-stretch object-cover sm:block"
          />
        </div>

        {/* Home upgrade */}
        <div className="relative flex items-center overflow-hidden rounded-3xl bg-cream">
          <div className="flex-1 py-10 pl-8 pr-2 lg:py-14 lg:pl-10">
            <h3 className="text-2xl font-extrabold leading-tight text-foreground lg:text-[1.9rem]">
              Upgrade Your
              <span className="block">Home Space</span>
            </h3>
            <p className="mt-2 max-w-56 text-sm text-muted-foreground">
              Modern essentials for a better living.
            </p>
            <Link
              to="/shop"
              search={{ category: "home-living" }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-soft transition-colors hover:bg-muted"
            >
              Explore Home
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <img
            src={promoSofa}
            alt="Cozy modern living room with a fabric sofa"
            loading="lazy"
            width={1024}
            height={1024}
            className="hidden h-full w-[45%] self-stretch object-cover sm:block"
          />
        </div>
      </div>
    </section>
  );
}
