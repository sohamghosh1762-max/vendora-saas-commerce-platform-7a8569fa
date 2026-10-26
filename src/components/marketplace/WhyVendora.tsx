import { Gem, HandHeart, RotateCcw, ShieldCheck } from "lucide-react";

const reasons = [
  {
    icon: HandHeart,
    title: "Support Small Businesses",
    text: "Discover unique products and help independent stores grow.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Flexible Payments",
    text: "Shop with confidence using industry-standard security.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    text: "Hassle-free 7-day return policy on eligible items.",
  },
  {
    icon: Gem,
    title: "Wide Variety",
    text: "Thousands of products across multiple categories from verified stores.",
  },
];

export function WhyVendora() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Why Choose Vendora?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          More than a marketplace — a smarter way to shop and support independent businesses.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason) => (
          <div
            key={reason.title}
            className="rounded-2xl border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
              <reason.icon className="size-6" strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 text-base font-bold text-foreground">{reason.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
