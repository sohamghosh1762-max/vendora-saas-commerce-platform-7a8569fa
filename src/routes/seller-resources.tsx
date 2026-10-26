import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/seller-resources")({
  component: () => (
    <StaticPage title="Seller Resources" description="Guides and tools to grow your store.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Seller Resources — Vendora" },
      { name: "description", content: "Guides and tools to grow your store." },
      { property: "og:title", content: "Seller Resources — Vendora" },
      { property: "og:description", content: "Guides and tools to grow your store." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
