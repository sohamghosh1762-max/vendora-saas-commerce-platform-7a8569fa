import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/terms")({
  component: () => (
    <StaticPage title="Terms & Privacy" description="The fine print, in plain language.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Terms & Privacy — Vendora" },
      { name: "description", content: "The fine print, in plain language." },
      { property: "og:title", content: "Terms & Privacy — Vendora" },
      { property: "og:description", content: "The fine print, in plain language." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
