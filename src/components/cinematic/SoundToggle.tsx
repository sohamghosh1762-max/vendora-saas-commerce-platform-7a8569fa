import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Optional ambient cinematic synthesizer using Web Audio API.
 * Muted by default to respect user experience and browser autoplay policies.
 */
export function SoundToggle({ scene }: { scene: number }) {
  const [isMuted, setIsMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playCinematicChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Master gain
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 1.2);
      master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);
      master.connect(ctx.destination);
      gainNodeRef.current = master;

      // Warm chord: D# minor / violet aura (Eb3, Bb3, Eb4, G4)
      const freqs = [155.56, 233.08, 311.13, 392.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 2.0);
        filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 4.5);

        osc.connect(filter);
        filter.connect(master);

        osc.start(ctx.currentTime + 0.1);
        osc.stop(ctx.currentTime + 4.6);
      });
    } catch {
      // Audio not supported
    }
  };

  const toggleSound = () => {
    if (isMuted) {
      setIsMuted(false);
      playCinematicChime();
    } else {
      setIsMuted(true);
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.3);
      }
    }
  };

  // If user enabled sound during scene 2/3, trigger chime
  useEffect(() => {
    if (!isMuted && (scene === 2 || scene === 3)) {
      playCinematicChime();
    }
  }, [scene, isMuted]);

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-label={isMuted ? "Enable Cinematic Sound" : "Mute Sound"}
      aria-pressed={!isMuted}
      title={isMuted ? "Sound Off (Click to unmute)" : "Sound On (Click to mute)"}
      className="group flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/80 px-3.5 py-1.5 text-xs text-[#0F0D1B]/70 shadow-sm backdrop-blur-md transition-all hover:border-[#6538F5]/40 hover:bg-white hover:text-[#0F0D1B]"
    >
      {isMuted ? (
        <>
          <VolumeX className="size-3.5 text-[#0F0D1B]/50 group-hover:text-[#6538F5]" />
          <span className="text-[11px] font-medium tracking-wide">Sound Off</span>
        </>
      ) : (
        <>
          <Volume2 className="size-3.5 text-[#6538F5] animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide text-[#6538F5]">Sound On</span>
        </>
      )}
    </button>
  );
}
