import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/blog")({
  component: () => (
    <StaticPage title="Blog" description="Stories, tips and trends from the Vendora community.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Blog — Vendora" },
      { name: "description", content: "Stories, tips and trends from the Vendora community." },
      { property: "og:title", content: "Blog — Vendora" },
      { property: "og:description", content: "Stories, tips and trends from the Vendora community." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
