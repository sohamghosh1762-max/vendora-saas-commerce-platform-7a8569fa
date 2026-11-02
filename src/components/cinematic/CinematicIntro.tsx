import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { INTRO_CONFIG } from "./intro-config";
import type { CinematicScene } from "./cinematic-context";
import { IntroBackground } from "./IntroBackground";
import { LogoReveal } from "./LogoReveal";
import { IntroTagline } from "./IntroTagline";
import { SoundToggle } from "./SoundToggle";

interface CinematicIntroProps {
  onComplete: () => void;
  onSceneChange?: (scene: CinematicScene) => void;
  /** Optional initial scene (primarily for testing) */
  scene?: CinematicScene;
}

export function CinematicIntro({
  onComplete,
  onSceneChange,
  scene: initialScene,
}: CinematicIntroProps) {
  const [scene, setScene] = useState<CinematicScene>(initialScene ?? 1);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
    }
  }, []);

  const handleSkip = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(INTRO_CONFIG.storageKey, "true");
      } catch {
        // Ignore storage errors
      }
    }
    onComplete();
  }, [onComplete]);

  // Keyboard shortcut: Escape key skips intro
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  // Main Intro Sequence Timeline
  useEffect(() => {
    if (reducedMotion) {
      const timer = setTimeout(() => {
        handleSkip();
      }, 800);
      return () => clearTimeout(timer);
    }

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const currentProgress = Math.min(elapsed / INTRO_CONFIG.totalDuration, 1);
      setProgress(currentProgress);

      let currentScene: CinematicScene = 1;
      if (elapsed < INTRO_CONFIG.scene1ArrivalEnd) {
        currentScene = 1;
      } else if (elapsed < INTRO_CONFIG.scene2BrandRevealEnd) {
        currentScene = 2;
      } else if (elapsed < INTRO_CONFIG.scene3BrandStatementEnd) {
        currentScene = 3;
      } else {
        currentScene = 4;
      }

      if (elapsed >= INTRO_CONFIG.scene4FadeStart) {
        setIsFadingOut(true);
      }

      setScene(currentScene);
      onSceneChange?.(currentScene);

      if (elapsed < INTRO_CONFIG.totalDuration) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        handleSkip();
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [reducedMotion, handleSkip, onSceneChange]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vendora Brand Introduction"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isFadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#FAF9FD",
      }}
    >
      {/* Refined Minimalist Studio Backdrop */}
      <IntroBackground scene={scene} progress={progress} />

      {/* Top Floating Controls */}
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-6 sm:p-8">
        {/* Subtle Brand Identifier */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#0F0D1B]/40">
            Brand Identity
          </span>
        </div>

        {/* Skip Intro Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            aria-label="Skip Intro"
            className="group flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#0F0D1B]/75 shadow-sm backdrop-blur-md transition-all hover:border-[#6538F5]/40 hover:bg-white hover:text-[#0F0D1B] active:scale-[0.98]"
          >
            <span>Skip Intro</span>
            <ArrowRight className="size-3 text-[#0F0D1B]/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#6538F5]" />
            <kbd className="hidden rounded bg-black/5 px-1 py-0.2 text-[9px] font-mono text-[#0F0D1B]/40 sm:inline-block">
              ESC
            </kbd>
          </button>
        </div>
      </div>

      {/* Center Art-Directed Stage: Logo Lockup & Brand Tagline */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        <LogoReveal scene={scene} reducedMotion={reducedMotion} />
        <IntroTagline scene={scene} reducedMotion={reducedMotion} />
      </div>

      {/* Bottom Floating Bar */}
      <div className="absolute bottom-6 left-6 right-6 z-30 flex items-center justify-between sm:bottom-8 sm:left-8 sm:right-8">
        <SoundToggle scene={scene} />

        {/* Minimal Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-medium text-[#0F0D1B]/40">0{scene} / 04</span>
          <div className="h-1 w-20 overflow-hidden rounded-full bg-black/[0.06] sm:w-28">
            <div
              className="h-full rounded-full bg-[#6538F5] transition-all duration-75"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
