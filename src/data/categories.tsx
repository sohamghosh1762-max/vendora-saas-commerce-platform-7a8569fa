import {
  BookOpen,
  Car,
  Dumbbell,
  Gamepad2,
  Headphones,
  Leaf,
  Shirt,
  Sofa,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Tile background + icon color utility classes (design tokens). */
  tint: string;
  fg: string;
};

export const categories: Category[] = [
  {
    id: "fashion",
    label: "Fashion",
    icon: Shirt,
    tint: "bg-cat-fashion",
    fg: "text-cat-fashion-fg",
  },
  {
    id: "electronics",
    label: "Electronics",
    icon: Headphones,
    tint: "bg-cat-electronics",
    fg: "text-cat-electronics-fg",
  },
  {
    id: "home-living",
    label: "Home & Living",
    icon: Sofa,
    tint: "bg-cat-home",
    fg: "text-cat-home-fg",
  },
  {
    id: "beauty",
    label: "Beauty & Personal Care",
    icon: Sparkles,
    tint: "bg-cat-beauty",
    fg: "text-cat-beauty-fg",
  },
  {
    id: "sports",
    label: "Sports & Fitness",
    icon: Dumbbell,
    tint: "bg-cat-sports",
    fg: "text-cat-sports-fg",
  },
  {
    id: "books",
    label: "Books & Stationery",
    icon: BookOpen,
    tint: "bg-cat-books",
    fg: "text-cat-books-fg",
  },
  { id: "toys", label: "Toys & Kids", icon: Gamepad2, tint: "bg-cat-toys", fg: "text-cat-toys-fg" },
  {
    id: "food",
    label: "Food & Beverages",
    icon: UtensilsCrossed,
    tint: "bg-cat-food",
    fg: "text-cat-food-fg",
  },
  {
    id: "health",
    label: "Health & Wellness",
    icon: Leaf,
    tint: "bg-cat-health",
    fg: "text-cat-health-fg",
  },
  { id: "automotive", label: "Automotive", icon: Car, tint: "bg-cat-auto", fg: "text-cat-auto-fg" },
];
