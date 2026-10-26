import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/marketplace/Logo";

export const Route = createFileRoute("/signin")({
  component: SignInPage,
  head: () => ({
    meta: [
      { title: "Sign In — Vendora" },
      { name: "description", content: "Sign in to your Vendora account." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function SignInPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <Logo />
      <div className="mt-8 w-full rounded-3xl border bg-card p-8 shadow-card">
        <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue shopping.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-semibold text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Sign In
          </button>
        </form>

        {submitted && (
          <p role="status" className="mt-4 rounded-xl bg-muted p-3 text-center text-xs text-muted-foreground">
            Demo only — accounts aren't connected yet, so nothing was submitted.
          </p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New to Vendora?{" "}
          <Link to="/become-a-vendor" className="font-semibold text-primary">
            Become a vendor
          </Link>
        </p>
      </div>
    </section>
  );
}
