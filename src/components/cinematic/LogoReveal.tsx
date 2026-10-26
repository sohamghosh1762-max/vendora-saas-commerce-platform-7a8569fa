import logoMark from "@/assets/logo-mark.png";
import type { CinematicScene } from "./cinematic-context";

interface LogoRevealProps {
  scene: CinematicScene;
  reducedMotion: boolean;
}

export function LogoReveal({ scene, reducedMotion }: LogoRevealProps) {
  const isScene1 = scene === 1;
  const isScene2OrLater = scene >= 2;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Brand Identity Lockup */}
      <div
        className="flex items-center gap-4 sm:gap-5"
        style={{
          transform: isScene1 && !reducedMotion ? "translateY(4px)" : "translateY(0)",
          opacity: 1,
          transition: "transform 800ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Supplied Vendora Brand Mark with Physical Contact Shadow */}
        <div className="relative shrink-0">
          <div className="relative overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_8px_22px_-4px_rgba(101,56,245,0.12),0_16px_36px_-8px_rgba(15,13,27,0.08)] ring-1 ring-black/[0.04] sm:rounded-3xl sm:p-2">
            <img
              src={logoMark}
              alt="Vendora — SaaS Commerce Platform"
              width={816}
              height={816}
              className="size-16 object-contain sm:size-20 md:size-24"
            />
          </div>

          {/* Soft Physical Ambient Ground Shadow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 left-1/2 h-2 w-3/4 -translate-x-1/2 rounded-full bg-[#0F0D1B]/[0.05] blur-[3px]"
          />
        </div>

        {/* Vendora Wordmark — Horizontal Unmasking with Natural Deceleration */}
        <div
          className="overflow-hidden"
          style={{
            clipPath: reducedMotion || isScene2OrLater ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
            opacity: reducedMotion || isScene2OrLater ? 1 : 0,
            transform: reducedMotion || isScene2OrLater ? "translateX(0)" : "translateX(-6px)",
            transition:
              "clip-path 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms cubic-bezier(0.16, 1, 0.3, 1), transform 750ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span className="block whitespace-nowrap text-3xl font-extrabold tracking-[-0.025em] text-[#0F0D1B] sm:text-4xl md:text-5xl">
            Vendora
          </span>
        </div>
      </div>
    </div>
  );
}
