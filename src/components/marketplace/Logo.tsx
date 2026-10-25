import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="Vendora home">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground shadow-float">
        V
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight text-foreground">Vendora</span>
        <span className="text-[10px] font-medium text-muted-foreground">
          SaaS Commerce Platform
        </span>
      </span>
    </Link>
  );
}
