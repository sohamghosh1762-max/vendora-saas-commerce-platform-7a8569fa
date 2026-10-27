import headphonesImg from "@/assets/product-headphones.jpg";
import denimImg from "@/assets/product-denim-jacket.jpg";
import smartwatchImg from "@/assets/product-smartwatch.jpg";
import skincareImg from "@/assets/product-skincare.jpg";
import shoesImg from "@/assets/product-shoes.jpg";
import sofaImg from "@/assets/promo-sofa.jpg";

export type Product = {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  badge?: string;
  image: string;
  imagePosition?: string;
  featured?: boolean;
  description: string;
};

export const products: Product[] = [
  {
    id: "wireless-headphones",
    name: "Wireless Headphones",
    storeId: "techzone",
    storeName: "TechZone",
    category: "electronics",
    price: 1299,
    originalPrice: 2499,
    rating: 4.6,
    reviews: 1852,
    badge: "30% OFF",
    image: headphonesImg,
    featured: true,
    description:
      "Over-ear wireless headphones with deep bass, soft cushioned ear cups and up to 30 hours of battery life. Foldable design with a built-in mic for calls.",
  },
  {
    id: "classic-denim-jacket",
    name: "Classic Denim Jacket",
    storeId: "stylenest",
    storeName: "StyleNest",
    category: "fashion",
    price: 2499,
    originalPrice: 3499,
    rating: 4.8,
    reviews: 1234,
    badge: "31% OFF",
    image: denimImg,
    featured: true,
    description:
      "A timeless medium-wash denim jacket with copper buttons and a comfortable regular fit. Pairs with everything, season after season.",
  },
  {
    id: "smart-watch-pro",
    name: "Smart Watch Pro",
    storeId: "fitlife",
    storeName: "FitLife",
    category: "electronics",
    price: 4990,
    originalPrice: 7999,
    rating: 4.9,
    reviews: 956,
    badge: "Best Seller",
    image: smartwatchImg,
    featured: true,
    description:
      "Round AMOLED smart watch with heart-rate tracking, step counting, workout modes and notifications. Water resistant with a 7-day battery.",
  },
  {
    id: "skincare-set",
    name: "Skincare Set",
    storeId: "beautybliss",
    storeName: "BeautyBliss",
    category: "beauty",
    price: 1499,
    originalPrice: 2999,
    rating: 4.5,
    reviews: 1130,
    badge: "50% OFF",
    image: skincareImg,
    featured: true,
    description:
      "A radiant renewal duo: hydrating serum and nourishing repair cream with rose-gold finishing. Dermatologically tested, suitable for all skin types.",
  },
  {
    id: "running-shoes",
    name: "Running Shoes",
    storeId: "urbancart",
    storeName: "UrbanCart",
    category: "sports",
    price: 3499,
    originalPrice: 6999,
    rating: 4.7,
    reviews: 1874,
    badge: "20% OFF",
    image: shoesImg,
    featured: true,
    description:
      "Lightweight running shoes with a breathable mesh upper, responsive foam midsole and grippy outsole. Built for daily runs and long walks.",
  },
  {
    id: "modern-lounge-chair",
    name: "Modern Lounge Chair",
    storeId: "homehaven",
    storeName: "HomeHaven",
    category: "home-living",
    price: 8999,
    originalPrice: 12999,
    rating: 4.7,
    reviews: 642,
    badge: "31% OFF",
    image: sofaImg,
    imagePosition: "88% center",
    description:
      "A plush fabric lounge chair with solid wood legs and a calm, neutral tone. The perfect corner companion for slow evenings.",
  },
];

export const featuredProducts = products.filter((p) => p.featured);

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
