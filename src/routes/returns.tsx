import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/returns")({
  component: () => (
    <StaticPage
      title="Returns & Refunds"
      description="Our hassle-free 7-day return policy explained."
    >
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Returns & Refunds — Vendora" },
      { name: "description", content: "Our hassle-free 7-day return policy explained." },
      { property: "og:title", content: "Returns & Refunds — Vendora" },
      { property: "og:description", content: "Our hassle-free 7-day return policy explained." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
