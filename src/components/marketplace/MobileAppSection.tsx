import { ArrowRight, Apple, Play, Smartphone } from "lucide-react";

/**
 * Design placeholder QR pattern. The brief allows a clearly designated
 * placeholder until a real destination URL is configured.
 */
function QrPlaceholder() {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21;
    const y = Math.floor(i / 21);
    const inFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    if (inFinder) {
      const lx = x < 7 ? x : x - 14;
      const ly = y < 7 ? y : y - 14;
      const border = lx === 0 || ly === 0 || lx === 6 || ly === 6;
      const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      return border || core;
    }
    return (x * 31 + y * 17 + ((x * y) % 7)) % 3 === 0;
  });

  return (
    <svg viewBox="0 0 21 21" className="size-32" role="img" aria-label="QR code placeholder">
      <rect width="21" height="21" fill="white" />
      {cells.map((on, i) =>
        on ? <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill="#10152F" /> : null,
      )}
    </svg>
  );
}

function StoreBadge({
  icon: Icon,
  top,
  bottom,
  href,
}: {
  icon: typeof Apple;
  top: string;
  bottom: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2.5 rounded-xl bg-foreground px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"
      aria-label={bottom}
    >
      <Icon className="size-6" />
      <span className="flex flex-col leading-tight">
        <span className="text-[9px] uppercase tracking-wide opacity-80">{top}</span>
        <span className="text-sm font-bold">{bottom}</span>
      </span>
    </a>
  );
}

export { StoreBadge };

export function MobileAppSection() {
  return (
    <section className="bg-hero-gradient relative overflow-hidden py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-[1fr_auto_0.9fr]">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Take Vendora
            <span className="block">Everywhere</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Shop your favourite products on the go. Available on iOS and Android.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <StoreBadge icon={Apple} top="Download on the" bottom="App Store" href="#app-store" />
            <StoreBadge icon={Play} top="Get it on" bottom="Google Play" href="#google-play" />
          </div>
        </div>

        <div className="relative mx-auto flex justify-center">
          <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/40 blur-2xl" />
          <img
            src="/phones"
            alt=""
            aria-hidden
            className="hidden"
          />
          {/* Phone mockups */}
          <img
            src={phonesImg}
            alt="Vendora shopping app on two phones"
            loading="lazy"
            width={1024}
            height={1024}
            className="relative z-10 w-72 object-contain sm:w-80 lg:w-[24rem]"
          />
          <span className="absolute -right-4 bottom-10 z-20 hidden rotate-12 font-script text-xl font-semibold text-primary-dark lg:block">
            Shop anytime,
            <br />
            anywhere
            <ArrowRight className="ml-2 inline size-4 -rotate-12" />
          </span>
        </div>

        <div className="mx-auto flex w-full max-w-xs flex-col items-center rounded-3xl bg-card p-6 text-center shadow-card">
          <QrPlaceholder />
          <h3 className="mt-4 text-base font-bold text-foreground">Scan to Download Vendora App</h3>
          <p className="mt-1 text-xs text-muted-foreground">Fast. Secure. Seamless.</p>
        </div>
      </div>
    </section>
  );
}

import phonesImg from "@/assets/phones.png";
