import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/track-order")({
  component: () => (
    <StaticPage title="Track Order" description="Follow your order from store to doorstep.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Track Order — Vendora" },
      { name: "description", content: "Follow your order from store to doorstep." },
      { property: "og:title", content: "Track Order — Vendora" },
      { property: "og:description", content: "Follow your order from store to doorstep." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
