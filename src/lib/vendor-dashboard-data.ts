import avatarRohan from "@/assets/avatar-rohan.jpg";
import productSkincare from "@/assets/product-skincare.jpg";
import productShoes from "@/assets/product-shoes.jpg";
import productHeadphones from "@/assets/product-headphones.jpg";
import productLeatherHandbag from "@/assets/product-leather-handbag.jpg";
import productCeramicMug from "@/assets/product-ceramic-mug.jpg";
import storeUrbanNestCover from "@/assets/store-urban-nest.jpg";
import type { VendorOrder, VendorStore, VendorUser } from "./vendor-types";
import type { Product } from "@/data/products";

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  growth: string;
  isPositive: boolean;
  color: "purple" | "blue" | "green" | "orange";
  sparkline: number[];
}

export interface ChartDataPoint {
  date: string;
  sales: number;
  orders: number;
  views: number;
  formattedSales: string;
  formattedOrders: string;
  formattedViews: string;
}

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  amount: number;
  formattedAmount: string;
  status: "Pending" | "Delivered" | "Shipped" | "Processing" | "Cancelled";
  image: string;
}

export interface DashboardProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  formattedRevenue: string;
  progressPercent: number;
  image: string;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  color: "green" | "blue" | "purple" | "orange";
}

export interface DashboardChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  actionKey: "store-info" | "logo" | "business" | "products" | "shipping";
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "inventory" | "system";
}

/**
 * Exact visual reference mode data matching the provided screenshot.
 */
export const REFERENCE_VENDOR_NAME = "Rohan Mehta";
export const REFERENCE_VENDOR_ROLE = "Store Owner";
export const REFERENCE_STORE_NAME = "The Urban Nest";
export const REFERENCE_STORE_SLUG = "the-urban-nest";
export const REFERENCE_STORE_URL = "vendora.com/stores/the-urban-nest";
export const REFERENCE_DATE_RANGE = "Oct 1, 2024 - Oct 26, 2024";

export const REFERENCE_KPIS: KpiMetric[] = [
  {
    id: "sales",
    title: "Total Sales",
    value: "₹1,24,560",
    growth: "↑ 12% vs last month",
    isPositive: true,
    color: "purple",
    sparkline: [20, 32, 28, 45, 38, 52, 48, 62, 58, 70, 75],
  },
  {
    id: "orders",
    title: "Total Orders",
    value: "320",
    growth: "↑ 18% vs last month",
    isPositive: true,
    color: "blue",
    sparkline: [15, 22, 35, 28, 42, 36, 50, 44, 58, 62, 68],
  },
  {
    id: "customers",
    title: "Total Customers",
    value: "256",
    growth: "↑ 22% vs last month",
    isPositive: true,
    color: "green",
    sparkline: [10, 28, 22, 36, 30, 44, 38, 48, 42, 52, 58],
  },
  {
    id: "views",
    title: "Store Views",
    value: "12,450",
    growth: "↑ 35% vs last month",
    isPositive: true,
    color: "orange",
    sparkline: [18, 24, 38, 30, 48, 40, 56, 50, 68, 62, 72],
  },
];

export const REFERENCE_CHART_DATA: ChartDataPoint[] = [
  {
    date: "Oct 1",
    sales: 12000,
    orders: 28,
    views: 1100,
    formattedSales: "₹12,000",
    formattedOrders: "28 orders",
    formattedViews: "1,100 views",
  },
  {
    date: "Oct 5",
    sales: 18500,
    orders: 45,
    views: 1850,
    formattedSales: "₹18,500",
    formattedOrders: "45 orders",
    formattedViews: "1,850 views",
  },
  {
    date: "Oct 10",
    sales: 16200,
    orders: 38,
    views: 1600,
    formattedSales: "₹16,200",
    formattedOrders: "38 orders",
    formattedViews: "1,600 views",
  },
  {
    date: "Oct 15",
    sales: 28450,
    orders: 68,
    views: 2950,
    formattedSales: "₹28,450",
    formattedOrders: "68 orders",
    formattedViews: "2,950 views",
  },
  {
    date: "Oct 20",
    sales: 21800,
    orders: 52,
    views: 2200,
    formattedSales: "₹21,800",
    formattedOrders: "52 orders",
    formattedViews: "2,200 views",
  },
  {
    date: "Oct 26",
    sales: 31500,
    orders: 78,
    views: 3400,
    formattedSales: "₹31,500",
    formattedOrders: "78 orders",
    formattedViews: "3,400 views",
  },
];

export const REFERENCE_ORDERS: DashboardOrder[] = [
  {
    id: "ord-1024",
    orderNumber: "#1024",
    customerName: "Priya Sharma",
    date: "Oct 26, 2024",
    amount: 1499,
    formattedAmount: "₹1,499",
    status: "Delivered",
    image: productSkincare,
  },
  {
    id: "ord-1023",
    orderNumber: "#1023",
    customerName: "Arjun Patel",
    date: "Oct 25, 2024",
    amount: 3499,
    formattedAmount: "₹3,499",
    status: "Shipped",
    image: productShoes,
  },
  {
    id: "ord-1022",
    orderNumber: "#1022",
    customerName: "Sneha Gupta",
    date: "Oct 24, 2024",
    amount: 2199,
    formattedAmount: "₹2,199",
    status: "Processing",
    image: productLeatherHandbag,
  },
  {
    id: "ord-1021",
    orderNumber: "#1021",
    customerName: "Karan Verma",
    date: "Oct 24, 2024",
    amount: 899,
    formattedAmount: "₹899",
    status: "Delivered",
    image: productCeramicMug,
  },
  {
    id: "ord-1020",
    orderNumber: "#1020",
    customerName: "Neha Kapoor",
    date: "Oct 23, 2024",
    amount: 1299,
    formattedAmount: "₹1,299",
    status: "Cancelled",
    image: productHeadphones,
  },
];

export const REFERENCE_TOP_PRODUCTS: DashboardProduct[] = [
  {
    id: "skincare-set",
    name: "Minimalist Skincare Set",
    unitsSold: 124,
    revenue: 56120,
    formattedRevenue: "₹56,120",
    progressPercent: 82,
    image: productSkincare,
  },
  {
    id: "running-shoes",
    name: "Running Shoes",
    unitsSold: 98,
    revenue: 34290,
    formattedRevenue: "₹34,290",
    progressPercent: 62,
    image: productShoes,
  },
  {
    id: "leather-handbag",
    name: "Leather Handbag",
    unitsSold: 76,
    revenue: 28450,
    formattedRevenue: "₹28,450",
    progressPercent: 48,
    image: productLeatherHandbag,
  },
  {
    id: "ceramic-mug",
    name: "Ceramic Coffee Mug",
    unitsSold: 64,
    revenue: 12480,
    formattedRevenue: "₹12,480",
    progressPercent: 32,
    image: productCeramicMug,
  },
  {
    id: "wireless-headphones",
    name: "Wireless Headphones",
    unitsSold: 52,
    revenue: 10390,
    formattedRevenue: "₹10,390",
    progressPercent: 22,
    image: productHeadphones,
  },
];


export const REFERENCE_VENDOR_PRODUCTS: Product[] = [
  {
    id: "prod-skincare-set",
    name: "Minimalist Skincare Set",
    storeId: "the-urban-nest",
    storeName: "The Urban Nest",
    category: "beauty",
    price: 1499,
    originalPrice: 1999,
    rating: 4.9,
    reviews: 124,
    badge: "Best Seller",
    image: productSkincare,
    description: "Gentle botanically active skincare collection formulated for daily nourishment.",
    stock: 48,
    status: "active",
  },
  {
    id: "prod-running-shoes",
    name: "Running Shoes",
    storeId: "the-urban-nest",
    storeName: "The Urban Nest",
    category: "sports",
    price: 3499,
    originalPrice: 4299,
    rating: 4.8,
    reviews: 98,
    badge: "Popular",
    image: productShoes,
    description: "Breathable ergonomic athletic shoes for active movement and endurance.",
    stock: 32,
    status: "active",
  },
  {
    id: "prod-leather-handbag",
    name: "Leather Handbag",
    storeId: "the-urban-nest",
    storeName: "The Urban Nest",
    category: "fashion",
    price: 2499,
    originalPrice: 3199,
    rating: 4.7,
    reviews: 76,
    badge: "Featured",
    image: productLeatherHandbag,
    description: "Hand-stitched genuine leather shoulder handbag with brushed metal hardware.",
    stock: 15,
    status: "active",
  },
  {
    id: "prod-ceramic-mug",
    name: "Ceramic Coffee Mug",
    storeId: "the-urban-nest",
    storeName: "The Urban Nest",
    category: "home-living",
    price: 599,
    originalPrice: 799,
    rating: 5.0,
    reviews: 54,
    image: productCeramicMug,
    description: "Artisan stoneware ceramic coffee mug with matte glaze finish.",
    stock: 60,
    status: "active",
  },
  {
    id: "prod-wireless-headphones",
    name: "Wireless Headphones",
    storeId: "the-urban-nest",
    storeName: "The Urban Nest",
    category: "electronics",
    price: 1299,
    originalPrice: 1799,
    rating: 4.6,
    reviews: 42,
    image: productHeadphones,
    description: "High-fidelity Bluetooth wireless headphones with active noise cancelling.",
    stock: 24,
    status: "active",
  },
];

export const REFERENCE_CHECKLIST: DashboardChecklistItem[] = [
  {
    id: "check-1",
    label: "Store information",
    completed: true,
    actionKey: "store-info",
  },
  {
    id: "check-2",
    label: "Add store logo",
    completed: true,
    actionKey: "logo",
  },
  {
    id: "check-3",
    label: "Add business details",
    completed: true,
    actionKey: "business",
  },
  {
    id: "check-4",
    label: "Add at least 5 products",
    completed: false,
    actionKey: "products",
  },
  {
    id: "check-5",
    label: "Set up shipping details",
    completed: false,
    actionKey: "shipping",
  },
];

export const REFERENCE_ACTIVITY: DashboardActivity[] = [
  {
    id: "act-1",
    title: "New order received",
    description: "Order #1024 from Priya Sharma",
    timeAgo: "2m ago",
    color: "green",
  },
  {
    id: "act-2",
    title: "Product updated",
    description: "Minimalist Skincare Set",
    timeAgo: "1h ago",
    color: "blue",
  },
  {
    id: "act-3",
    title: "Store profile updated",
    description: "Business details",
    timeAgo: "3h ago",
    color: "purple",
  },
];

export const REFERENCE_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "notif-1",
    title: "New Order #1024",
    message: "Priya Sharma placed an order for ₹1,499.",
    time: "2 mins ago",
    read: false,
    type: "order",
  },
  {
    id: "notif-2",
    title: "Inventory Alert",
    message: "Minimalist Skincare Set has 8 units left in stock.",
    time: "1 hour ago",
    read: false,
    type: "inventory",
  },
  {
    id: "notif-3",
    title: "Payout Processed",
    message: "Weekly payout of ₹42,800 has been transferred.",
    time: "Yesterday",
    read: false,
    type: "system",
  },
];

export {
  avatarRohan,
  storeUrbanNestCover,
  productSkincare,
  productShoes,
  productHeadphones,
  productLeatherHandbag,
  productCeramicMug,
};
