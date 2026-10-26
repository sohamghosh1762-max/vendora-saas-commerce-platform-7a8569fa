import type { ReactNode } from "react";

export function StaticPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}
