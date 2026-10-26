import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/careers")({
  component: () => (
    <StaticPage title="Careers" description="Build the future of independent commerce with us.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Careers — Vendora" },
      { name: "description", content: "Build the future of independent commerce with us." },
      { property: "og:title", content: "Careers — Vendora" },
      { property: "og:description", content: "Build the future of independent commerce with us." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
