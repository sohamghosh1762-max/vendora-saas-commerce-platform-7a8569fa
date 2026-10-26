import type { CinematicScene } from "./cinematic-context";

interface IntroTaglineProps {
  scene: CinematicScene;
  reducedMotion?: boolean;
}

export function IntroTagline({ scene, reducedMotion }: IntroTaglineProps) {
  const isScene3OrLater = scene >= 3;

  return (
    <div
      className="relative mt-7 flex flex-col items-center px-4 text-center sm:mt-9 md:mt-11"
      style={{
        transform: reducedMotion || isScene3OrLater ? "translateY(0)" : "translateY(6px)",
        opacity: reducedMotion || isScene3OrLater ? 1 : 0,
        pointerEvents: isScene3OrLater ? "auto" : "none",
        transition:
          "transform 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Brand Descriptor — SAAS COMMERCE PLATFORM */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6538F5] sm:text-xs">
          SAAS COMMERCE PLATFORM
        </span>
      </div>

      {/* Primary Brand Tagline */}
      <h2 className="mt-2 max-w-xl text-lg font-bold tracking-tight text-[#0F0D1B] sm:text-2xl md:text-[1.75rem] leading-snug">
        One Platform. Every Store.{" "}
        <span className="text-[#6538F5]">Endless Possibilities.</span>
      </h2>
    </div>
  );
}
