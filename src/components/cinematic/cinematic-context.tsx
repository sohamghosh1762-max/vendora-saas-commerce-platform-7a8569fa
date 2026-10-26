import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { INTRO_CONFIG } from "./intro-config";

export type CinematicScene = 1 | 2 | 3 | 4;

interface CinematicContextType {
  isIntroActive: boolean;
  scene: CinematicScene | null;
  startIntro: () => void;
  finishIntro: () => void;
  setScene: (scene: CinematicScene) => void;
}

const CinematicContext = createContext<CinematicContextType | null>(null);

export function CinematicProvider({ children }: { children: ReactNode }) {
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [scene, setScene] = useState<CinematicScene | null>(null);

  // Initialize intro only on first visit to the homepage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only activate if we are on the homepage path "/"
    const isHomePage = window.location.pathname === "/";
    if (!isHomePage) return;

    try {
      const params = new URLSearchParams(window.location.search);
      const forceIntro = params.get("intro") === "true";
      const hasSeen = sessionStorage.getItem(INTRO_CONFIG.storageKey);

      if (forceIntro || !hasSeen) {
        setIsIntroActive(true);
        setScene(1);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const startIntro = useCallback(() => {
    setIsIntroActive(true);
    setScene(1);
  }, []);

  const finishIntro = useCallback(() => {
    setIsIntroActive(false);
    setScene(null);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(INTRO_CONFIG.storageKey, "true");
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  return (
    <CinematicContext.Provider
      value={{
        isIntroActive,
        scene,
        startIntro,
        finishIntro,
        setScene,
      }}
    >
      {children}
    </CinematicContext.Provider>
  );
}

export function useCinematic(): CinematicContextType {
  const ctx = useContext(CinematicContext);
  if (!ctx) {
    return {
      isIntroActive: false,
      scene: null,
      startIntro: () => {},
      finishIntro: () => {},
      setScene: () => {},
    };
  }
  return ctx;
}
