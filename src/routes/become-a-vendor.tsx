import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  UploadCloud,
  User,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { useVendorAuth } from "@/lib/vendor-context";
import { checkEmailAvailability, checkSlugAvailability, generateSlug } from "@/lib/vendor-api";
import { categories } from "@/data/categories";
import type { OnboardingData } from "@/lib/vendor-types";

const stepsOverview = [
  {
    icon: Store,
    title: "Create your store",
    text: "Set up your storefront in minutes — branding, policies and hours included.",
  },
  {
    icon: UploadCloud,
    title: "List your products",
    text: "Upload catalogues, set prices and manage stock from a simple dashboard.",
  },
  {
    icon: CreditCard,
    title: "Get paid on time",
    text: "Secure payments and transparent payouts, every week.",
  },
];

export const Route = createFileRoute("/become-a-vendor")({
  component: BecomeVendorPage,
  head: () => ({
    meta: [
      { title: "Become a Vendor — Vendora" },
      {
        name: "description",
        content: "Start your online store with Vendora and reach thousands of customers.",
      },
      { property: "og:title", content: "Become a Vendor — Vendora" },
      {
        property: "og:description",
        content: "Start your online store with Vendora and reach thousands of customers.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function BecomeVendorPage() {
  const { isAuthenticated, vendor, store: existingStore, register } = useVendorAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement | null>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,

    storeName: "",
    storeSlug: "",
    category: "fashion",
    description: "",
    logoDataUrl: "",
    storePhone: "",
    storeEmail: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",

    businessType: "Sole Proprietorship",
    returnPolicy: "7-Day Easy Returns",
    shippingMethod: "Vendora Logistics",
    processingTime: "1-2 Business Days",
    supportEmail: "",
    taxId: "",
  });

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStoreNameChange = (name: string) => {
    const suggestedSlug = generateSlug(name);
    setFormData((prev) => ({
      ...prev,
      storeName: name,
      // only auto-update slug if user hasn't explicitly customized it to something else
      storeSlug:
        prev.storeSlug === "" || prev.storeSlug === generateSlug(prev.storeName)
          ? suggestedSlug
          : prev.storeSlug,
      storeEmail: prev.storeEmail === "" ? prev.email : prev.storeEmail,
      supportEmail: prev.supportEmail === "" ? prev.email : prev.supportEmail,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, logo: "Only JPG, PNG, and WebP images are supported." }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logo: "Logo image must be under 2MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, logoDataUrl: reader.result as string }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.logo;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  // Step 1 Validation
  const validateStep1 = async (): Promise<boolean> => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) errs.fullName = "Full name is required.";
    const email = formData.email.trim();
    if (!email) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    } else {
      const isAvailable = await checkEmailAvailability(email);
      if (!isAvailable) {
        errs.email = "An account with this email already exists. Please sign in.";
      }
    }

    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (formData.phone.replace(/\D/g, "").length < 8) {
      errs.phone = "Please enter a valid phone number.";
    }

    if (!formData.password) {
      errs.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters long.";
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = "You must agree to the Terms of Service & Privacy Policy.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = async (): Promise<boolean> => {
    const errs: Record<string, string> = {};

    if (!formData.storeName.trim()) errs.storeName = "Store name is required.";
    const slug = generateSlug(formData.storeSlug || formData.storeName);
    if (!slug) {
      errs.storeSlug = "Store slug is required.";
    } else {
      const available = await checkSlugAvailability(slug);
      if (!available) {
        errs.storeSlug = `The slug '${slug}' is already taken. Please choose another.`;
      }
    }

    if (!formData.category) errs.category = "Please select a store category.";
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      errs.description = "Please provide a store description of at least 20 characters.";
    }
    if (!formData.address.trim()) errs.address = "Business address is required.";
    if (!formData.city.trim()) errs.city = "City is required.";
    if (!formData.state.trim()) errs.state = "State / Province is required.";
    if (!formData.postalCode.trim()) errs.postalCode = "Postal / PIN code is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.businessType) errs.businessType = "Please select a business type.";
    if (!formData.returnPolicy) errs.returnPolicy = "Please select a return policy.";
    if (!formData.shippingMethod) errs.shippingMethod = "Please select a fulfilment method.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    setSubmitError(null);
    if (currentStep === 1) {
      const valid = await validateStep1();
      if (valid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const valid = await validateStep2();
      if (valid) setCurrentStep(3);
    } else if (currentStep === 3) {
      const valid = validateStep3();
      if (valid) setCurrentStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await register(formData);
      if (res.success) {
        navigate({ to: "/vendor-dashboard" });
      } else {
        setSubmitError(res.error || "Failed to create vendor account. Please try again.");
      }
    } catch {
      setSubmitError("An unexpected error occurred while setting up your store. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewSlug = generateSlug(formData.storeSlug || formData.storeName || "your-store");

  return (
    <div className="bg-background">
      {/* Hero Intro Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/50 px-4 py-1 text-xs font-semibold text-primary-dark">
              <Sparkles className="size-3.5" />
              Vendora Merchant Onboarding
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Start Your Online Store with <span className="text-primary">Vendora</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Join hundreds of independent sellers and reach thousands of customers, with no
              technical hassle, just pure growth.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={scrollToForm}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-dark hover:shadow-soft"
            >
              Start Onboarding
            </button>
            <Link
              to="/pricing"
              className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              View Pricing
            </Link>
            <Link
              to="/signin"
              className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Existing 3 Onboarding Steps */}
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {stepsOverview.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:border-primary/40"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                <step.icon className="size-6" strokeWidth={1.8} />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                Step {i + 1}
              </p>
              <h2 className="mt-1 text-lg font-bold text-foreground">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Development Mode & Live Connection Status Notice */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-lavender/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success/20 text-success">
              <CheckCircle2 className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">
                Live Development Mode Active • Local Session Persistence Enabled
              </p>
              <p className="text-xs text-muted-foreground">
                All vendor accounts, store slugs, and product inventories are cryptographic PBKDF2
                hashed and stored in browser memory across page reloads.
              </p>
            </div>
          </div>
          {isAuthenticated && existingStore ? (
            <Link
              to="/vendor-dashboard"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark"
            >
              Go to {existingStore.name} Dashboard
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              Ready for Store Creation
            </span>
          )}
        </div>
      </section>

      {/* Main Interactive Onboarding Stepper Section */}
      <section ref={formRef} className="border-t border-border bg-muted/20 py-14">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10">
            {/* Stepper Progress Indicator */}
            <div className="mb-10">
              <div className="flex items-center justify-between">
                {[
                  { num: 1, label: "Account" },
                  { num: 2, label: "Store Info" },
                  { num: 3, label: "Fulfilment" },
                  { num: 4, label: "Review & Submit" },
                ].map((s, idx) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Allow clicking back to earlier steps
                        if (s.num < currentStep) setCurrentStep(s.num as 1 | 2 | 3 | 4);
                      }}
                      disabled={s.num > currentStep}
                      className={`grid size-9 place-items-center rounded-full text-xs font-bold transition-all ${
                        currentStep === s.num
                          ? "bg-primary text-primary-foreground shadow-soft ring-4 ring-primary/20"
                          : s.num < currentStep
                            ? "bg-success text-primary-foreground cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {s.num < currentStep ? <Check className="size-4" /> : s.num}
                    </button>
                    <span
                      className={`hidden text-xs font-bold sm:inline-block ${
                        currentStep === s.num
                          ? "text-foreground"
                          : s.num < currentStep
                            ? "text-primary"
                            : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                    {idx < 3 && <div className="hidden h-[2px] w-8 bg-border sm:block md:w-16" />}
                  </div>
                ))}
              </div>
            </div>

            {submitError && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
              >
                <p className="font-semibold">{submitError}</p>
              </div>
            )}

            {/* STEP 1: Account Creation */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                    Step 1 — Create Your Merchant Account
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your personal and contact details to manage your store securely.
                  </p>
                </div>

                {isAuthenticated && vendor && (
                  <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-4 text-xs text-primary-dark">
                    <p className="font-semibold">
                      You are currently signed in as {vendor.fullName} ({vendor.email}).
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      You can register an additional store or manage your existing store in the{" "}
                      <Link to="/vendor-dashboard" className="font-bold underline text-primary">
                        Vendor Dashboard
                      </Link>
                      .
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Full Name *
                    </label>
                    <div className="relative mt-1">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder="e.g. Neha Sharma"
                        className={`w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary ${
                          errors.fullName ? "border-destructive" : "border-border"
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-foreground">
                      Email Address *
                    </label>
                    <div className="relative mt-1">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="merchant@example.com"
                        className={`w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary ${
                          errors.email ? "border-destructive" : "border-border"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-xs font-semibold text-foreground">
                      Phone Number *
                    </label>
                    <div className="relative mt-1">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className={`w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary ${
                          errors.phone ? "border-destructive" : "border-border"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Password *
                    </label>
                    <div className="relative mt-1">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-primary ${
                          errors.password ? "border-destructive" : "border-border"
                        }`}
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
                    {errors.password && (
                      <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Confirm Password *
                    </label>
                    <div className="relative mt-1">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, confirmPassword: e.target.value }))
                        }
                        placeholder="••••••••"
                        className={`w-full rounded-xl border bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-primary ${
                          errors.confirmPassword ? "border-destructive" : "border-border"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData((p) => ({ ...p, agreeTerms: e.target.checked }))}
                      className="mt-1 size-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-xs text-muted-foreground">
                      I agree to the Vendora{" "}
                      <Link to="/terms" className="font-semibold text-primary underline">
                        Terms of Service
                      </Link>
                      , Vendor Agreement, and Privacy Policy. I confirm all details provided are
                      accurate.
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="mt-2 text-xs text-destructive">{errors.agreeTerms}</p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-dark"
                  >
                    Continue to Store Info
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Store Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                    Step 2 — Store Profile & Storefront Details
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Customize your brand identity and public storefront address.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="storeName"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Store Name *
                    </label>
                    <input
                      id="storeName"
                      type="text"
                      value={formData.storeName}
                      onChange={(e) => handleStoreNameChange(e.target.value)}
                      placeholder="e.g. Aura Artisan Goods"
                      className={`mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary ${
                        errors.storeName ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.storeName && (
                      <p className="mt-1 text-xs text-destructive">{errors.storeName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="storeSlug"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Storefront Slug (URL) *
                    </label>
                    <input
                      id="storeSlug"
                      type="text"
                      value={formData.storeSlug}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          storeSlug: generateSlug(e.target.value),
                        }))
                      }
                      placeholder="e.g. aura-artisan-goods"
                      className={`mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary ${
                        errors.storeSlug ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.storeSlug && (
                      <p className="mt-1 text-xs text-destructive">{errors.storeSlug}</p>
                    )}
                  </div>
                </div>

                {/* Live URL Preview */}
                <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-4">
                  <p className="text-xs font-bold text-foreground">Live Storefront URL Preview:</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">
                      vendora.com/store/{previewSlug}
                    </span>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                      Verified Unique
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Store Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="logo" className="block text-xs font-semibold text-foreground">
                      Store Logo / Brand Avatar (Optional)
                    </label>
                    <input
                      id="logo"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleLogoUpload}
                      className="mt-1 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                    />
                    {errors.logo && <p className="mt-1 text-xs text-destructive">{errors.logo}</p>}
                    {formData.logoDataUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={formData.logoDataUrl}
                          alt="Logo preview"
                          className="size-10 rounded-xl object-cover border"
                        />
                        <span className="text-xs text-success font-semibold">Image loaded</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Store Description * (min 20 characters)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the products you offer, your craftsmanship, and what sets your brand apart..."
                    className={`mt-1 w-full rounded-xl border bg-background p-3 text-sm outline-none transition focus:border-primary ${
                      errors.description ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-destructive">{errors.description}</p>
                  )}
                </div>

                {/* Business Address */}
                <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Physical Business Location
                  </h3>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Street Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Suite, Street, Industrial Area"
                      className={`mt-1 w-full rounded-xl border bg-background px-4 py-2 text-sm outline-none focus:border-primary ${
                        errors.address ? "border-destructive" : "border-border"
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-destructive">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="city" className="block text-xs font-semibold text-foreground">
                        City *
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                        placeholder="Bengaluru"
                        className={`mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary ${
                          errors.city ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-destructive">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-xs font-semibold text-foreground"
                      >
                        State *
                      </label>
                      <input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                        placeholder="Karnataka"
                        className={`mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary ${
                          errors.state ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.state && (
                        <p className="mt-1 text-xs text-destructive">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-xs font-semibold text-foreground"
                      >
                        Postal Code *
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData((p) => ({ ...p, postalCode: e.target.value }))}
                        placeholder="560001"
                        className={`mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary ${
                          errors.postalCode ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-xs text-destructive">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-dark"
                  >
                    Continue to Fulfilment
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Business & Fulfilment Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                    Step 3 — Business & Fulfilment Preferences
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Configure your shipping, return window, and customer support channels.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="businessType"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Business Structure *
                    </label>
                    <select
                      id="businessType"
                      value={formData.businessType}
                      onChange={(e) => setFormData((p) => ({ ...p, businessType: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                    >
                      <option value="Sole Proprietorship">Sole Proprietorship / Individual</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Private Limited / LLC">Private Limited / LLC</option>
                      <option value="Independent Artisan">Independent Artisan / Creator</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="returnPolicy"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Customer Return Policy *
                    </label>
                    <select
                      id="returnPolicy"
                      value={formData.returnPolicy}
                      onChange={(e) => setFormData((p) => ({ ...p, returnPolicy: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                    >
                      <option value="7-Day Easy Returns">7-Day Easy Returns (Recommended)</option>
                      <option value="14-Day Returns">14-Day Returns</option>
                      <option value="30-Day Returns">30-Day Returns</option>
                      <option value="Replacement Only">Replacement Only on Defect</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="shippingMethod"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Shipping & Fulfilment Method *
                    </label>
                    <select
                      id="shippingMethod"
                      value={formData.shippingMethod}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, shippingMethod: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                    >
                      <option value="Vendora Logistics">Vendora Logistics (Doorstep Pickup)</option>
                      <option value="Self-Ship (Courier)">Self-Ship via Private Courier</option>
                      <option value="Local Store Pickup">Local Store Pickup Available</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="processingTime"
                      className="block text-xs font-semibold text-foreground"
                    >
                      Order Processing Time *
                    </label>
                    <select
                      id="processingTime"
                      value={formData.processingTime}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, processingTime: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                    >
                      <option value="Same Day Dispatch">Same Day Dispatch (Within 24 Hours)</option>
                      <option value="1-2 Business Days">1–2 Business Days</option>
                      <option value="3-5 Business Days">3–5 Business Days (Made to Order)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="supportEmail"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Customer Support Email
                  </label>
                  <input
                    id="supportEmail"
                    type="email"
                    value={formData.supportEmail || formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, supportEmail: e.target.value }))}
                    placeholder="support@yourstore.in"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Visible on receipts and customer order tracking pages.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-2.5">
                    <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <label
                        htmlFor="taxId"
                        className="block text-xs font-semibold text-foreground"
                      >
                        GSTIN / Tax Identification (Optional)
                      </label>
                      <input
                        id="taxId"
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => setFormData((p) => ({ ...p, taxId: e.target.value }))}
                        placeholder="e.g. 29AAAAA0000A1Z5"
                        className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm uppercase outline-none focus:border-primary"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Required only for GST-registered businesses for automated tax invoicing. You
                        can also add this later in your Vendor Settings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary-dark"
                  >
                    Review Store Application
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review and Submit */}
            {currentStep === 4 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                    Step 4 — Review Your Store Details
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Please review your information before launching your storefront.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Account Summary */}
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        Merchant Account
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-semibold text-primary underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        <span className="font-semibold text-foreground">{formData.fullName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-semibold text-foreground">{formData.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        <span className="font-semibold text-foreground">{formData.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Security:</span>{" "}
                        <span className="font-semibold text-success">PBKDF2 Hashed</span>
                      </div>
                    </div>
                  </div>

                  {/* Store Summary */}
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        Storefront Profile
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-semibold text-primary underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Store Name:</span>{" "}
                        <span className="font-semibold text-foreground">{formData.storeName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Slug URL:</span>{" "}
                        <span className="font-mono font-semibold text-primary">
                          /store/{previewSlug}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>{" "}
                        <span className="font-semibold text-foreground capitalize">
                          {formData.category}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>{" "}
                        <span className="font-semibold text-foreground">
                          {formData.city}, {formData.state}
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 text-muted-foreground">
                        <span className="font-semibold text-foreground">Description:</span>{" "}
                        {formData.description}
                      </div>
                    </div>
                  </div>

                  {/* Fulfilment Summary */}
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        Business & Fulfilment
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-semibold text-primary underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Business Structure:</span>{" "}
                        <span className="font-semibold text-foreground">
                          {formData.businessType}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Return Policy:</span>{" "}
                        <span className="font-semibold text-foreground">
                          {formData.returnPolicy}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Shipping Method:</span>{" "}
                        <span className="font-semibold text-foreground">
                          {formData.shippingMethod}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Processing Time:</span>{" "}
                        <span className="font-semibold text-foreground">
                          {formData.processingTime}
                        </span>
                      </div>
                      {formData.taxId && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Tax ID:</span>{" "}
                          <span className="font-mono font-semibold text-foreground uppercase">
                            {formData.taxId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-dark disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating Store & Setting Up Portal...
                      </>
                    ) : (
                      <>
                        <Check className="size-4" />
                        Create Store & Open Vendor Dashboard
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
