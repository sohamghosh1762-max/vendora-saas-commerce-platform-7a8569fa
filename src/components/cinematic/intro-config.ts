/**
 * Timing and configuration parameters for the Vendora Brand Reveal.
 * Art-directed for natural motion, realistic studio lighting, and seamless transitions.
 * All timing is centralized here and can be adjusted in one place.
 */
export const INTRO_CONFIG = {
  /** Total duration in milliseconds (5.0 seconds) */
  totalDuration: 5000,

  /** Scene timing boundaries (in ms from start) */
  scene1ArrivalEnd: 1000, // 0.0s - 1.0s: Quiet Arrival (warm ambient backdrop, understated mark arrival)
  scene2BrandRevealEnd: 2500, // 1.0s - 2.5s: The Brand Reveal (mark settles, wordmark unmasks horizontally)
  scene3BrandStatementEnd: 4000, // 2.5s - 4.0s: Brand Statement (descriptor & tagline move together)
  scene4FadeStart: 4250, // 4.0s - 4.25s: Visual hold; 4.25s - 5.0s: Seamless homepage crossfade
  scene4TransitionEnd: 5000, // 5.0s: Sequence complete

  /** Storage key to prevent replaying automatically on ordinary page refreshes */
  storageKey: "vendora_intro_seen_v1",

  /** Brand Color Palette Constants */
  colors: {
    primaryViolet: "#6538F5",
    deepViolet: "#4B20D8",
    inkNavy: "#0F0D1B",
    softLavender: "#F3EFFF",
    warmOffWhite: "#FAF9FD",
    white: "#FFFFFF",
  },
};
