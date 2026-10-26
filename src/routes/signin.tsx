import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, Store } from "lucide-react";
import { Logo } from "@/components/marketplace/Logo";
import { useVendorAuth } from "@/lib/vendor-context";

export const Route = createFileRoute("/signin")({
  component: SignInPage,
  head: () => ({
    meta: [
      { title: "Sign In — Vendora" },
      { name: "description", content: "Sign in to your Vendora account or vendor portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function SignInPage() {
  const { login, isAuthenticated, vendor } = useVendorAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate({ to: "/vendor-dashboard" });
      } else {
        setError(res.error || "Invalid email or password.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("neha@stylenest.in");
    setPassword("vendora123");
    setError(null);
  };

  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <Logo />
      <div className="mt-8 w-full rounded-3xl border border-border bg-card p-8 shadow-card">
        <h1 className="text-xl font-bold text-foreground">Sign In to Vendora</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Access your buyer account or vendor merchant portal.
        </p>

        {isAuthenticated && vendor && (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary-soft/40 p-3 text-xs text-primary-dark">
            <p className="font-semibold">Signed in as {vendor.fullName}</p>
            <Link to="/vendor-dashboard" className="font-bold underline text-primary">
              Open Vendor Dashboard →
            </Link>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive"
          >
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-semibold text-foreground">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-primary"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Demo Helper Box */}
        <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-3 text-xs">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <Store className="size-3.5 text-primary" />
            Vendor Demo Account:
          </p>
          <p className="mt-1 text-muted-foreground">
            Email: <code className="font-mono font-bold text-foreground">neha@stylenest.in</code>
            <br />
            Pass: <code className="font-mono font-bold text-foreground">vendora123</code>
          </p>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="mt-2 text-[11px] font-bold text-primary underline"
          >
            Auto-fill Demo Vendor Credentials
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Want to sell on Vendora?{" "}
          <Link to="/become-a-vendor" className="font-semibold text-primary hover:underline">
            Become a vendor
          </Link>
        </p>
      </div>
    </section>
  );
}
