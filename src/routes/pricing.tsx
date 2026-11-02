import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "₹0",
    cadence: "forever",
    features: ["Up to 20 products", "Basic storefront", "Standard support", "Weekly payouts"],
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹499",
    cadence: "per month",
    features: [
      "Unlimited products",
      "Custom domain",
      "Sales analytics",
      "Priority support",
      "Weekly payouts",
    ],
    highlight: true,
  },
  {
    name: "Pro",
    price: "₹1,499",
    cadence: "per month",
    features: [
      "Everything in Growth",
      "Marketing tools",
      "Advanced reporting",
      "Dedicated account manager",
    ],
    highlight: false,
  },
];

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Vendor Pricing — Vendora" },
      {
        name: "description",
        content: "Simple plans for selling on Vendora — start free, grow from there.",
      },
      { property: "og:title", content: "Vendor Pricing — Vendora" },
      {
        property: "og:description",
        content: "Simple plans for selling on Vendora — start free, grow from there.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function PricingPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Vendor Pricing</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Start free and upgrade as your store grows.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "flex flex-col rounded-2xl border bg-card p-6 shadow-soft",
              plan.highlight && "border-primary shadow-lift",
            )}
          >
            {plan.highlight && (
              <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                Most Popular
              </span>
            )}
            <h2 className="text-base font-bold text-foreground">{plan.name}</h2>
            <p className="mt-1 text-2xl font-extrabold text-foreground">
              {plan.price}
              <span className="ml-1 text-xs font-medium text-muted-foreground">{plan.cadence}</span>
            </p>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/become-a-vendor"
              className={cn(
                "mt-6 rounded-full py-2.5 text-center text-sm font-semibold transition-colors",
                plan.highlight
                  ? "bg-primary text-primary-foreground hover:bg-primary-dark"
                  : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
              )}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Demo pricing — payments aren't connected yet.
      </p>
    </section>
  );
}
