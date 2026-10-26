import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/press")({
  component: () => (
    <StaticPage title="Press" description="News and media resources for Vendora.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Press — Vendora" },
      { name: "description", content: "News and media resources for Vendora." },
      { property: "og:title", content: "Press — Vendora" },
      { property: "og:description", content: "News and media resources for Vendora." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
