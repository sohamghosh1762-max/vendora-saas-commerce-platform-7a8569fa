import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/help-center")({
  component: () => (
    <StaticPage
      title="Help Center"
      description="Answers to common questions about shopping on Vendora."
    >
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Help Center — Vendora" },
      { name: "description", content: "Answers to common questions about shopping on Vendora." },
      { property: "og:title", content: "Help Center — Vendora" },
      {
        property: "og:description",
        content: "Answers to common questions about shopping on Vendora.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
