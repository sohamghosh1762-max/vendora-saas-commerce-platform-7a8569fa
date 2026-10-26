import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/contact-us")({
  component: () => (
    <StaticPage title="Contact Us" description="We would love to hear from you.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Contact Us — Vendora" },
      { name: "description", content: "We would love to hear from you." },
      { property: "og:title", content: "Contact Us — Vendora" },
      { property: "og:description", content: "We would love to hear from you." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
