import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/logo-mark.png";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("flex items-center gap-2 sm:gap-3 shrink", className)}
      aria-label="Vendora home"
    >
      <img
        src={logoMark}
        alt="Vendora Logo Mark"
        width={816}
        height={816}
        className="size-9 sm:size-10 shrink-0 rounded-xl object-contain shadow-soft"
      />
      <span className="flex flex-col leading-tight">
        <span className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
          Vendora
        </span>
        <span className="hidden min-[380px]:inline text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          SAAS COMMERCE PLATFORM
        </span>
      </span>
    </Link>
  );
}
