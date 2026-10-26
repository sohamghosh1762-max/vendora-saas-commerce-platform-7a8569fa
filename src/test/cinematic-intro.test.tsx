import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CinematicIntro } from "@/components/cinematic/CinematicIntro";
import { CinematicProvider, useCinematic } from "@/components/cinematic/cinematic-context";
import { INTRO_CONFIG } from "@/components/cinematic/intro-config";

describe("Cinematic Brand Introduction", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the cinematic intro with accessible dialog attributes and skip button", () => {
    const onComplete = vi.fn();
    render(<CinematicIntro onComplete={onComplete} />);

    const dialog = screen.getByRole("dialog", { name: /vendora brand introduction/i });
    expect(dialog).toBeInTheDocument();

    const skipButton = screen.getByRole("button", { name: /skip/i });
    expect(skipButton).toBeInTheDocument();
  });

  it("clicking Skip Intro calls onComplete immediately and persists session flag", () => {
    const onComplete = vi.fn();
    render(<CinematicIntro onComplete={onComplete} />);

    const skipBtn = screen.getByRole("button", { name: /skip/i });
    fireEvent.click(skipBtn);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(INTRO_CONFIG.storageKey)).toBe("true");
  });

  it("pressing Escape key skips the cinematic intro", () => {
    const onComplete = vi.fn();
    render(<CinematicIntro onComplete={onComplete} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("renders sound toggle button, muted by default with aria-pressed false", () => {
    const onComplete = vi.fn();
    render(<CinematicIntro onComplete={onComplete} scene={1} />);

    const soundBtn = screen.getByRole("button", { name: /sound/i });
    expect(soundBtn).toBeInTheDocument();
    expect(soundBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders brand descriptor and tagline inside intro", () => {
    const onComplete = vi.fn();
    render(<CinematicIntro onComplete={onComplete} />);

    expect(screen.getByText("SAAS COMMERCE PLATFORM")).toBeInTheDocument();
    expect(screen.getByText(/One Platform\. Every Store\./i)).toBeInTheDocument();
    expect(screen.getByText("Endless Possibilities.")).toBeInTheDocument();
  });

  it("CinematicProvider exposes startIntro and finishIntro controls", () => {
    // Set already seen in session storage first to verify starting inactive state
    sessionStorage.setItem(INTRO_CONFIG.storageKey, "true");

    function TestConsumer() {
      const { isIntroActive, startIntro, finishIntro } = useCinematic();
      return (
        <div>
          <span data-testid="status">{isIntroActive ? "active" : "inactive"}</span>
          <button onClick={startIntro}>Start</button>
          <button onClick={finishIntro}>Finish</button>
        </div>
      );
    }

    render(
      <CinematicProvider>
        <TestConsumer />
      </CinematicProvider>,
    );

    const status = screen.getByTestId("status");
    expect(status.textContent).toBe("inactive");

    act(() => {
      screen.getByText("Start").click();
    });
    expect(screen.getByTestId("status").textContent).toBe("active");

    act(() => {
      screen.getByText("Finish").click();
    });
    expect(screen.getByTestId("status").textContent).toBe("inactive");
  });
});
