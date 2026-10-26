import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Store, UploadCloud } from "lucide-react";

const steps = [
  {
    icon: Store,
    title: "Create your store",
    text: "Set up your storefront in minutes — branding, policies and hours included.",
  },
  {
    icon: UploadCloud,
    title: "List your products",
    text: "Upload catalogues, set prices and manage stock from a simple dashboard.",
  },
  {
    icon: CreditCard,
    title: "Get paid on time",
    text: "Secure payments and transparent payouts, every week.",
  },
];

export const Route = createFileRoute("/become-a-vendor")({
  component: BecomeVendorPage,
  head: () => ({
    meta: [
      { title: "Become a Vendor — Vendora" },
      { name: "description", content: "Start your online store with Vendora and reach thousands of customers." },
      { property: "og:title", content: "Become a Vendor — Vendora" },
      { property: "og:description", content: "Start your online store with Vendora and reach thousands of customers." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function BecomeVendorPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        Start Your Online Store with <span className="text-primary">Vendora</span>
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Join hundreds of independent sellers and reach thousands of customers, with no technical
        hassle, just pure growth.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/pricing"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          View Pricing
        </Link>
        <Link
          to="/signin"
          className="rounded-full border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Sign In
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="rounded-2xl border bg-card p-6 shadow-soft">
            <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
              <step.icon className="size-6" strokeWidth={1.8} />
            </span>
            <p className="mt-4 text-xs font-semibold text-primary">Step {i + 1}</p>
            <h2 className="mt-1 text-base font-bold text-foreground">{step.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This is a demo experience — vendor onboarding isn't connected to a live backend yet.
      </p>
    </section>
  );
}
