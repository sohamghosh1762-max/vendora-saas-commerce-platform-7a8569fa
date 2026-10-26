import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/marketplace/HeroSection";
import { CategoryStrip } from "@/components/marketplace/CategoryStrip";
import { FeaturedProducts } from "@/components/marketplace/FeaturedProducts";
import { PromoBanners } from "@/components/marketplace/PromoBanners";
import { WhyVendora } from "@/components/marketplace/WhyVendora";
import { TopRatedStores } from "@/components/marketplace/TopRatedStores";
import { MobileAppSection } from "@/components/marketplace/MobileAppSection";
import { Testimonials } from "@/components/marketplace/Testimonials";
import { NewsletterBanner } from "@/components/marketplace/NewsletterBanner";
import { useCinematic } from "@/components/cinematic/cinematic-context";
import { CinematicIntro } from "@/components/cinematic/CinematicIntro";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Vendora — Everything You Love, All in One Place" },
      {
        name: "description",
        content:
          "Discover unique products from thousands of independent stores. Support local entrepreneurs and enjoy a seamless shopping experience on Vendora.",
      },
      { property: "og:title", content: "Vendora — Everything You Love, All in One Place" },
      {
        property: "og:description",
        content:
          "Discover unique products from thousands of independent stores. Support local entrepreneurs and enjoy a seamless shopping experience on Vendora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const { isIntroActive, finishIntro, setScene, startIntro } = useCinematic();

  return (
    <>
      {isIntroActive && (
        <CinematicIntro onComplete={finishIntro} onSceneChange={setScene} />
      )}
      <HeroSection onReplayIntro={startIntro} />
      <CategoryStrip />
      <FeaturedProducts />
      <PromoBanners />
      <WhyVendora />
      <TopRatedStores />
      <MobileAppSection />
      <Testimonials />
      <NewsletterBanner />
    </>
  );
}
