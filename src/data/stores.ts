import stylenestCover from "@/assets/store-stylenest.jpg";
import techzoneCover from "@/assets/store-techzone.jpg";
import homehavenCover from "@/assets/store-homehaven.jpg";

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
    tint: "bg-cat-auto text-cat-auto-fg",
    description:
      "Lifestyle and everyday essentials for people on the move — sportswear, gear and daily carry.",
  },
];

export function getStore(id: string): Store | undefined {
  return stores.find((s) => s.id === id);
}
