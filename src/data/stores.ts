import stylenestCover from "@/assets/store-stylenest.jpg";
import techzoneCover from "@/assets/store-techzone.jpg";
import homehavenCover from "@/assets/store-homehaven.jpg";
import urbanNestCover from "@/assets/store-urban-nest.jpg";

export type Store = {
  id: string;
  name: string;
  tagline: string;
  category: string;
  rating: number;
  reviews: number;
  productCount: number;
  tint: string;
  cover?: string;
  description: string;
};

export const stores: Store[] = [
  {
    id: "the-urban-nest",
    name: "The Urban Nest",
    tagline: "Your Storefront",
    category: "home-living",
    rating: 4.9,
    reviews: 320,
    productCount: 48,
    tint: "bg-cat-home text-cat-home-fg",
    cover: urbanNestCover,
    description:
      "Curated artisan home decor, ceramics, and lifestyle essentials for modern living.",
  },
  {
    id: "stylenest",
    name: "StyleNest",
    tagline: "Fashion & Accessories",
    category: "fashion",
    rating: 4.8,
    reviews: 4127,
    productCount: 120,
    tint: "bg-cat-fashion text-cat-fashion-fg",
    cover: stylenestCover,
    description:
      "Curated fashion and accessories from independent designers — everyday essentials and statement pieces.",
  },
  {
    id: "techzone",
    name: "TechZone",
    tagline: "Electronics & Gadgets",
    category: "electronics",
    rating: 4.7,
    reviews: 3198,
    productCount: 86,
    tint: "bg-cat-electronics text-cat-electronics-fg",
    cover: techzoneCover,
    description:
      "The latest gadgets and electronics, hand-tested by a team of tinkerers who love great tech.",
  },
  {
    id: "homehaven",
    name: "HomeHaven",
    tagline: "Home & Living",
    category: "home-living",
    rating: 4.6,
    reviews: 2105,
    productCount: 94,
    tint: "bg-cat-home text-cat-home-fg",
    cover: homehavenCover,
    description:
      "Warm, functional homeware that makes every corner feel considered — from ceramics to soft furnishings.",
  },
  {
    id: "beautybliss",
    name: "BeautyBliss",
    tagline: "Beauty & Personal Care",
    category: "beauty",
    rating: 4.5,
    reviews: 4960,
    productCount: 73,
    tint: "bg-cat-beauty text-cat-beauty-fg",
    description:
      "Kind-to-skin beauty and personal care made in small batches with clean ingredients.",
  },
  {
    id: "urbancart",
    name: "UrbanCart",
    tagline: "Lifestyle & Essentials",
    category: "sports",
    rating: 4.6,
    reviews: 2308,
    productCount: 65,
    tint: "bg-cat-sports text-cat-sports-fg",
    description:
      "Lifestyle and everyday essentials for people on the move — sportswear, gear and daily carry.",
  },
  {
    id: "bookcraft",
    name: "BookCraft Studios",
    tagline: "Books & Fine Stationery",
    category: "books",
    rating: 4.9,
    reviews: 1820,
    productCount: 92,
    tint: "bg-cat-books text-cat-books-fg",
    description:
      "Independent press and artisanal binder creating archival notebooks, journals, and literary editions.",
  },
  {
    id: "wonderland",
    name: "Wonderland Toys",
    tagline: "Toys & Creative Play",
    category: "toys",
    rating: 4.8,
    reviews: 1450,
    productCount: 78,
    tint: "bg-cat-toys text-cat-toys-fg",
    description:
      "Safe, eco-friendly wooden toys, STEM builders, and creative play kits designed to spark young imaginations.",
  },
  {
    id: "artisangourmet",
    name: "Artisan Gourmet Co.",
    tagline: "Farm-to-Table Food & Drinks",
    category: "food",
    rating: 4.9,
    reviews: 2940,
    productCount: 84,
    tint: "bg-cat-food text-cat-food-fg",
    description:
      "Single-origin coffees, organic forest honey, stone-ground nut butters, and small-batch pantry staples.",
  },
  {
    id: "pranaherbal",
    name: "Prana Herbal Living",
    tagline: "Holistic Health & Wellness",
    category: "health",
    rating: 4.8,
    reviews: 2130,
    productCount: 56,
    tint: "bg-cat-health text-cat-health-fg",
    description:
      "Authentic herbal extracts, clean plant proteins, and therapeutic self-care formulated with Ayurvedic principles.",
  },
  {
    id: "gearshift",
    name: "GearShift Auto Labs",
    tagline: "Automotive Accessories & Care",
    category: "automotive",
    rating: 4.7,
    reviews: 1670,
    productCount: 68,
    tint: "bg-cat-auto text-cat-auto-fg",
    description:
      "Precision automotive gadgets, smart dash cameras, emergency roadside tools, and pro-grade detailing supplies.",
  },
];

export function getAllStores(): Store[] {
  if (typeof window !== "undefined") {
    try {
      const customRaw = window.localStorage.getItem("vendora_custom_stores_v1");
      if (customRaw) {
        const custom = JSON.parse(customRaw) as Store[];
        const customIds = new Set(custom.map((c) => c.id));
        return [...custom, ...stores.filter((s) => !customIds.has(s.id))];
      }
    } catch {
      // Fallback to default
    }
  }
  return stores;
}

export function getStore(id: string): Store | undefined {
  return getAllStores().find((s) => s.id === id);
}
