import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/logo-mark.png";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-3", className)} aria-label="Vendora home">
      <img
        src={logoMark}
        alt="Vendora Logo Mark"
        width={816}
        height={816}
        className="size-10 shrink-0 rounded-xl object-contain shadow-soft"
      />
      <span className="flex flex-col leading-tight">
        <span className="text-xl font-extrabold tracking-tight text-foreground">Vendora</span>
        <span className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          SAAS COMMERCE PLATFORM
        </span>
      </span>
    </Link>
  );
}
