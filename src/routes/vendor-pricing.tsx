import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/vendor-pricing")({
  component: () => (
    <StaticPage title="Vendor Pricing" description="Simple plans for selling on Vendora.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Vendor Pricing — Vendora" },
      { name: "description", content: "Simple plans for selling on Vendora." },
      { property: "og:title", content: "Vendor Pricing — Vendora" },
      { property: "og:description", content: "Simple plans for selling on Vendora." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
