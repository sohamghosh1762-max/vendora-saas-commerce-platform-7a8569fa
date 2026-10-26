import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/about")({
  component: () => (
    <StaticPage title="About Vendora" description="More than a marketplace — a smarter way to shop.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "About Vendora — Vendora" },
      { name: "description", content: "More than a marketplace — a smarter way to shop." },
      { property: "og:title", content: "About Vendora — Vendora" },
      { property: "og:description", content: "More than a marketplace — a smarter way to shop." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
