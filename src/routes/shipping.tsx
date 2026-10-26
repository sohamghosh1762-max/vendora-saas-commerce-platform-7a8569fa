import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/shipping")({
  component: () => (
    <StaticPage title="Shipping Information" description="Where we deliver and how fast.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Shipping Information — Vendora" },
      { name: "description", content: "Where we deliver and how fast." },
      { property: "og:title", content: "Shipping Information — Vendora" },
      { property: "og:description", content: "Where we deliver and how fast." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
