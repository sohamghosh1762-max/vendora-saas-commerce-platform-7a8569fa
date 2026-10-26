import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/marketplace/StaticPage";

export const Route = createFileRoute("/student-discount")({
  component: () => (
    <StaticPage title="Student Discount" description="Students save extra at participating stores.">
      <p className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        This page is part of the Vendora demo — full content is coming soon.
      </p>
    </StaticPage>
  ),
  head: () => ({
    meta: [
      { title: "Student Discount — Vendora" },
      { name: "description", content: "Students save extra at participating stores." },
      { property: "og:title", content: "Student Discount — Vendora" },
      { property: "og:description", content: "Students save extra at participating stores." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});
