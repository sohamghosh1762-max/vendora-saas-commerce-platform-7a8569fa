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
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/marketplace/Logo";
import { useCustomerAuth } from "@/lib/customer-context";
import heroShopper from "@/assets/hero-shopper.png";

export const Route = createFileRoute("/signup")({
  component: SignUpPage,
  head: () => ({
    meta: [
      { title: "Customer Sign Up — Vendora Marketplace" },
      {
        name: "description",
        content:
          "Create your customer account to shop, track orders, and manage addresses on Vendora.",
      },
    ],
  }),
});

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useCustomerAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors["fullName"] = "Full name must be at least 2 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors["email"] = "Please enter a valid email address.";
    }

    const phoneClean = phone.trim().replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      errors["phone"] = "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!password || password.length < 6) {
      errors["password"] = "Password must be at least 6 characters long.";
    }

    if (password !== confirmPassword) {
      errors["confirmPassword"] = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await signUp({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim().replace(/\D/g, ""),
        password,
        confirmPassword,
      });

      if (!result.success) {
        setGeneralError(result.error || "Failed to create account. Please check your inputs.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting to your account dashboard...");
      setTimeout(() => {
        navigate({ to: "/account" });
      }, 1000);
    } catch {
      setGeneralError("An unexpected error occurred while creating your account.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background py-10 px-4 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="flex flex-col lg:flex-row">
          {/* Left Panel — Visual & Brand */}
          <div className="flex flex-col justify-between border-b border-border/80 bg-gradient-to-br from-[#F8F5FE] via-[#F3EDFD] to-[#E9DCFA] p-8 sm:p-10 lg:w-[42%] lg:border-b-0 lg:border-r lg:p-12">
            <div>
              <Logo />
              <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] leading-tight">
                Join the <br />
                <span className="text-primary">Vendora Marketplace</span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Create an account to explore thousands of artisan, designer, and boutique products,
                save delivery addresses, and track doorstep orders.
              </p>

              <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                <img
                  src={heroShopper}
                  alt="Vendora Shopper Experience"
                  className="h-40 w-full object-contain sm:h-48"
                />
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-[11px] font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="size-3.5 text-primary" />
                    Verified Sellers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-primary" />
                    Secure Checkout
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
              <span>Customer Portal</span>
              <span className="font-semibold text-primary">Free Registration</span>
            </div>
          </div>

          {/* Right Panel — Sign Up Form */}
          <div className="flex flex-1 flex-col justify-center p-8 sm:p-10 lg:p-12">
            <div>
              <Link
                to="/signin"
                search={{ role: "customer" }}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                <span>Already have an account? Sign In</span>
              </Link>

              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Create customer account
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Enter your contact details and a secure password.
              </p>

              {/* Demo Mode Notice */}
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary-soft/40 p-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <ShieldCheck className="size-4" />
                  <span>DEMO PERSISTENCE</span>
                </div>
                <p className="mt-0.5">
                  Passwords are securely hashed in-browser using the Web Crypto API (SHA-256) and
                  persisted in demo localStorage. This is a frontend demonstration.
                </p>
              </div>

              {generalError && (
                <div
                  role="alert"
                  className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive"
                >
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}

              {successMessage && (
                <div
                  role="status"
                  className="mt-4 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-xs font-semibold text-success"
                >
                  <ShieldCheck className="size-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-1 relative flex items-center">
                    <User className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {fieldErrors["fullName"] && (
                    <p className="mt-1 text-[11px] text-destructive">{fieldErrors["fullName"]}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-1 relative flex items-center">
                    <Mail className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aarav.sharma@example.com"
                      className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {fieldErrors["email"] && (
                    <p className="mt-1 text-[11px] text-destructive">{fieldErrors["email"]}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="signup-phone"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Mobile Number <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-1 flex rounded-xl border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <span className="flex items-center border-r px-3 text-xs font-semibold text-muted-foreground">
                      +91
                    </span>
                    <input
                      id="signup-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-transparent px-3 py-2.5 text-xs outline-none"
                    />
                  </div>
                  {fieldErrors["phone"] && (
                    <p className="mt-1 text-[11px] text-destructive">{fieldErrors["phone"]}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Password <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-1 relative flex items-center">
                    <Lock className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-10 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {fieldErrors["password"] && (
                    <p className="mt-1 text-[11px] text-destructive">{fieldErrors["password"]}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-1 relative flex items-center">
                    <Lock className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-10 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors["confirmPassword"] && (
                    <p className="mt-1 text-[11px] text-destructive">
                      {fieldErrors["confirmPassword"]}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Already have an account link */}
              <div className="mt-6 text-center text-xs text-muted-foreground">
                Already registered?{" "}
                <Link
                  to="/signin"
                  search={{ role: "customer" }}
                  className="font-bold text-primary hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
