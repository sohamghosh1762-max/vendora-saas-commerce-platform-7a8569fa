import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    // Demo subscription — no backend is connected yet.
    window.setTimeout(() => {
      setStatus("success");
      setMessage("You're subscribed! Watch your inbox for exclusive offers.");
      setEmail("");
    }, 900);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="bg-newsletter-gradient relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 lg:px-14">
        <div className="relative z-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-primary-foreground sm:text-3xl">
              Never Miss a Deal
            </h2>
            <p className="mt-2 max-w-md text-sm text-primary-foreground/80">
              Subscribe to get exclusive offers, new store launches, and more.
            </p>
          </div>

          <div className="w-full max-w-md">
            <form onSubmit={submit} className="flex items-center gap-2" noValidate>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") {
                    setStatus("idle");
                    setMessage("");
                  }
                }}
                placeholder="Enter your email address"
                aria-invalid={status === "error"}
                className={cn(
                  "w-full min-w-0 rounded-full bg-card px-5 py-3 text-sm text-foreground outline-none ring-2 ring-transparent transition placeholder:text-muted-foreground",
                  status === "error" && "ring-2 ring-destructive/60",
                  status === "success" && "ring-2 ring-success/60",
                )}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted disabled:opacity-70"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
                <ArrowRight className="size-4" />
              </button>
            </form>
            {status === "error" && (
              <p role="alert" className="mt-2 pl-2 text-xs font-medium text-primary-foreground/95">
                {message}
              </p>
            )}
            {status === "success" && (
              <p role="status" className="mt-2 pl-2 text-xs font-medium text-primary-foreground/95">
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Decorative envelope */}
        <div
          aria-hidden
          className="absolute -right-6 -top-6 hidden size-40 place-items-center rounded-full bg-background/10 lg:grid"
        >
          <Mail className="size-16 text-primary-foreground/40" />
        </div>
      </div>
    </section>
  );
}
