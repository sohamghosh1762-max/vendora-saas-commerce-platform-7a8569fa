import type { CinematicScene } from "./cinematic-context";

interface IntroBackgroundProps {
  scene: CinematicScene;
  progress: number;
}

export function IntroBackground({ scene, progress }: IntroBackgroundProps) {
  const isTransition = scene === 4;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{
        backgroundColor: "#FAF9FD",
        backgroundImage:
          "radial-gradient(ellipse 130% 95% at 50% 36%, #FFFFFF 0%, #FAF8FE 45%, #F5F0FB 75%, #ECE5F6 100%)",
      }}
    >
      {/* Soft ambient tonal variation across lavender backdrop */}
      <div
        className={`absolute inset-0 bg-[#6538F5]/[0.015] transition-opacity duration-1000 ${
          isTransition ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
