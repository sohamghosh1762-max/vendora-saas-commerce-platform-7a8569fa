import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/success-stories")({
  component: () => (
    <StaticPage title="Success Stories" description="Meet vendors who grew with Vendora.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Success Stories — Vendora" },
      { name: "description", content: "Meet vendors who grew with Vendora." },
      { property: "og:title", content: "Success Stories — Vendora" },
      { property: "og:description", content: "Meet vendors who grew with Vendora." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
