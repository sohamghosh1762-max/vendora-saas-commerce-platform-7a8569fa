import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Logo } from "@/components/marketplace/Logo";
import { useVendorAuth } from "@/lib/vendor-context";
import { useSuperAdminAuth } from "@/lib/super-admin-context";
import heroShopper from "@/assets/hero-shopper.png";

export interface SignInSearch {
  role?: "vendor" | "super-admin";
}

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>): SignInSearch => {
    const role = search["role"];
    if (role === "vendor" || role === "super-admin") {
      return { role };
    }
    return {};
  },
  component: SignInPage,
  head: (ctx) => {
    const role = (ctx as { search?: SignInSearch })?.search?.role;
    const title =
      role === "vendor"
        ? "Vendor Sign In — Vendora"
        : role === "super-admin"
          ? "Super Admin Sign In — Vendora"
          : "Sign In — Choose Account Type — Vendora";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: "Select your account type to sign in to your Vendora storefront or platform.",
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
});

export function SignInPage() {
  const { role } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background py-10 px-4 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="flex flex-col lg:flex-row">
          {/* Left Panel — Brand and Visual Identity (42% width on desktop) */}
          <div className="flex flex-col justify-between border-b border-border/80 bg-gradient-to-br from-[#F8F5FE] via-[#F3EDFD] to-[#E9DCFA] p-8 sm:p-10 lg:w-[42%] lg:border-b-0 lg:border-r lg:p-12">
            <div>
              <Logo />
              <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] leading-tight">
                Commerce, <br />
                <span className="text-primary">made simpler.</span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Manage your store or oversee the entire Vendora platform from one place.
              </p>

              {/* Decorative Commerce Visual */}
              <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                <img
                  src={heroShopper}
                  alt="Vendora Commerce Ecosystem"
                  className="h-40 w-full object-contain sm:h-48"
                />
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Store className="size-3.5 text-primary" />
                    500+ Active Stores
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-primary" />
                    Verified Security
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Brand Quality Guarantee */}
            <div className="mt-8 pt-6 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
              <span>Vendora Commerce OS</span>
              <span className="font-semibold text-primary">v2.4 Platform</span>
            </div>
          </div>

          {/* Right Panel — Account Type Selection or Role-Specific Sign In Form (58% width) */}
          <div className="flex flex-1 flex-col justify-center p-8 sm:p-10 lg:p-12">
            {!role && (
              <AccountTypeSelector
                onSelectRole={(selectedRole) =>
                  navigate({ to: "/signin", search: { role: selectedRole } })
                }
              />
            )}
            {role === "vendor" && (
              <VendorSignInForm onBack={() => navigate({ to: "/signin", search: {} })} />
            )}
            {role === "super-admin" && (
              <SuperAdminSignInForm onBack={() => navigate({ to: "/signin", search: {} })} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 1: Account Type Selection View
 */
export function AccountTypeSelector({
  onSelectRole,
}: {
  onSelectRole: (role: "vendor" | "super-admin") => void;
}) {
  return (
    <div>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back to Homepage</span>
      </Link>

      <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Choose your account type
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">Select how you want to access Vendora.</p>

      <div className="mt-8 space-y-4">
        {/* Card 1 — Vendor */}
        <button
          type="button"
          onClick={() => onSelectRole("vendor")}
          aria-label="Continue as Vendor: Manage your storefront, products, orders, and store activity"
          className="group flex w-full items-center justify-between rounded-2xl border border-primary/25 bg-primary-soft/30 p-6 text-left transition-all duration-200 hover:border-primary hover:bg-primary-soft/60 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
        >
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Store className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors sm:text-lg">
                  I'm a Vendor
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Merchant
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Manage your storefront, products, orders, and store activity.
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:text-primary-dark">
                Continue as Vendor
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
          <div className="hidden sm:grid size-9 shrink-0 place-items-center rounded-full border border-primary/20 bg-card text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="size-4" />
          </div>
        </button>

        {/* Card 2 — Super Admin */}
        <button
          type="button"
          onClick={() => onSelectRole("super-admin")}
          aria-label="Continue as Super Admin: Access platform administration, oversee stores, and manage platform-wide operations"
          className="group flex w-full items-center justify-between rounded-2xl border border-border bg-card p-6 text-left transition-all duration-200 hover:border-primary/60 hover:bg-accent/40 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
        >
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#0F0D1B] text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="size-6 text-violet-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors sm:text-lg">
                  I'm a Super Admin
                </span>
                <span className="rounded-full bg-[#0F0D1B]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0F0D1B]">
                  Platform Ops
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Access platform administration, oversee stores, and manage platform-wide operations.
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-primary">
                Continue as Super Admin
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
          <div className="hidden sm:grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
            <ArrowRight className="size-4" />
          </div>
        </button>
      </div>

      {/* Helper Footer Link */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        New to Vendora?{" "}
        <Link to="/become-a-vendor" className="font-semibold text-primary hover:underline">
          Become a Vendor
        </Link>
      </p>
    </div>
  );
}

/**
 * Step 2A: Vendor Sign In Form
 */
export function VendorSignInForm({ onBack }: { onBack: () => void }) {
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
        setError(res.error || "Invalid vendor credentials. Check your email and password.");
      }
    } catch {
      setError("An unexpected authentication error occurred. Please try again.");
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
    <div>
      <button
        type="button"
        onClick={onBack}
        className="group mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Account Selection</span>
      </button>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/60 px-3 py-1 text-xs font-semibold text-primary-dark">
          <Store className="size-3.5 text-primary" />
          Vendor Portal
        </span>
      </div>

      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Vendor Sign In
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Access your store and manage your commerce operations.
      </p>

      {isAuthenticated && vendor && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary-soft/40 p-3.5 text-xs text-primary-dark">
          <p className="font-semibold">Signed in as {vendor.fullName}</p>
          <p className="text-muted-foreground">{vendor.email}</p>
          <Link
            to="/vendor-dashboard"
            className="mt-2 inline-block font-bold text-primary underline"
          >
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
          <label htmlFor="vendor-email" className="text-xs font-semibold text-foreground">
            Vendor Email Address
          </label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="vendor-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
              placeholder="vendor@yourstore.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="vendor-password" className="text-xs font-semibold text-foreground">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="vendor-password"
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
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            "Sign In to Vendor Portal"
          )}
        </button>
      </form>

      {/* Demo Credentials Box */}
      <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs">
        <p className="flex items-center gap-1.5 font-semibold text-foreground">
          <Store className="size-3.5 text-primary" />
          Demo Merchant Accounts:
        </p>
        <div className="mt-2 space-y-2">
          <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Rohan Mehta (The Urban Nest)</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                Reference Dashboard
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Email:{" "}
              <code className="font-mono font-bold text-foreground">rohan@theurbannest.com</code> •
              Pass: <code className="font-mono font-bold text-foreground">vendora123</code>
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail("rohan@theurbannest.com");
                setPassword("vendora123");
                setError(null);
              }}
              className="mt-1.5 text-[11px] font-bold text-primary underline hover:text-primary-dark"
            >
              Sign in as Rohan Mehta (The Urban Nest)
            </button>
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Neha Sharma (StyleNest)</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Fashion Merchant
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Email: <code className="font-mono font-bold text-foreground">neha@stylenest.in</code>{" "}
              • Pass: <code className="font-mono font-bold text-foreground">vendora123</code>
            </p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-1.5 text-[11px] font-bold text-primary underline hover:text-primary-dark"
            >
              Auto-fill Demo Vendor Credentials
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Want to sell on Vendora?{" "}
        <Link to="/become-a-vendor" className="font-semibold text-primary hover:underline">
          Become a Vendor
        </Link>
      </p>
    </div>
  );
}

/**
 * Step 2B: Super Admin Sign In Form
 */
export function SuperAdminSignInForm({ onBack }: { onBack: () => void }) {
  const { isConfigured, login, isAuthenticated, admin } = useSuperAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConfigured) {
      setError(
        "Administrative Authorization Required: Dedicated backend IAM authentication service is not connected to this environment. Contact platform operations to provision an administrator session with multi-factor authentication (MFA).",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate({ to: "/super-admin-dashboard" });
      } else {
        setError(res.error || "Invalid administrator credentials.");
      }
    } catch {
      setError("An unexpected error occurred during administrative verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="group mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-dark"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Account Selection</span>
      </button>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F0D1B]/20 bg-[#0F0D1B]/5 px-3 py-1 text-xs font-semibold text-[#0F0D1B]">
          <ShieldCheck className="size-3.5 text-primary" />
          Platform Administration
        </span>
      </div>

      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Super Admin Sign In
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to manage the Vendora platform.</p>

      {isAuthenticated && admin && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary-soft/40 p-3.5 text-xs text-primary-dark">
          <p className="font-semibold">Signed in as Administrator ({admin.email})</p>
          <Link
            to="/super-admin-dashboard"
            className="mt-2 inline-block font-bold text-primary underline"
          >
            Open Super Admin Dashboard →
          </Link>
        </div>
      )}

      {/* Security Governance Notice */}
      <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">Restricted Administrative Environment</p>
            <p className="mt-0.5 leading-relaxed text-muted-foreground">
              Super Admin access governs marketplace infrastructure, merchant accounts, and platform
              finances. Multi-factor verification (MFA) and dedicated IAM server connection are
              required.
            </p>
          </div>
        </div>
      </div>

      {!isConfigured && !error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed"
        >
          Administrative Authorization Required: Dedicated backend IAM authentication service is not
          connected to this environment. Contact platform operations to provision an administrator
          session with multi-factor authentication (MFA).
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive leading-relaxed"
        >
          {error}
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="admin-email" className="text-xs font-semibold text-foreground">
            Administrator Email
          </label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
              placeholder="admin@vendora.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="admin-password" className="text-xs font-semibold text-foreground">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-primary"
              placeholder="••••••••••••"
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
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0F0D1B] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin text-violet-300" />
              <span>Verifying IAM Credentials...</span>
            </>
          ) : (
            "Sign In to Platform Admin"
          )}
        </button>
      </form>

      {/* Demo Administrator Account Box */}
      <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs">
        <p className="flex items-center gap-1.5 font-semibold text-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          Demo Administrator Account:
        </p>
        <div className="mt-2 rounded-xl border border-primary/20 bg-primary-soft/30 p-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Super Administrator</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Full Governance Access
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Email: <code className="font-mono font-bold text-foreground">admin@vendora.com</code> •
            Pass: <code className="font-mono font-bold text-foreground">vendora123</code>
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@vendora.com");
              setPassword("vendora123");
              setError(null);
            }}
            className="mt-1.5 text-[11px] font-bold text-primary underline hover:text-primary-dark"
          >
            Auto-fill Administrator Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
