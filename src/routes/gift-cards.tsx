import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/gift-cards")({
  component: () => (
    <StaticPage title="Gift Cards" description="Give the joy of discovery with a Vendora gift card.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Gift Cards — Vendora" },
      { name: "description", content: "Give the joy of discovery with a Vendora gift card." },
      { property: "og:title", content: "Gift Cards — Vendora" },
      { property: "og:description", content: "Give the joy of discovery with a Vendora gift card." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
