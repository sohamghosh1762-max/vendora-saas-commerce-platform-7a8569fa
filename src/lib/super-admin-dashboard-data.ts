import storeUrbanNestCover from "@/assets/store-urban-nest.jpg";
import storeStyleNestCover from "@/assets/store-stylenest.jpg";
import storeTechZoneCover from "@/assets/store-techzone.jpg";
import storeBeautyBlissCover from "@/assets/store-beautybliss.jpg";
import storeHomeHavenCover from "@/assets/store-homehaven.jpg";

import productSkincare from "@/assets/product-skincare.jpg";
import productShoes from "@/assets/product-shoes.jpg";
import productLeatherHandbag from "@/assets/product-leather-handbag.jpg";
import productHeadphones from "@/assets/product-headphones.jpg";
import productCeramicMug from "@/assets/product-ceramic-mug.jpg";

import avatarRohan from "@/assets/avatar-rohan.jpg";
import avatarAditi from "@/assets/avatar-aditi.jpg";
import avatarNeha from "@/assets/avatar-nehak.jpg";

export const REFERENCE_ADMIN = {
  name: "Arjun Mehta",
  role: "Super Admin",
  email: "admin@vendora.com",
  avatar: avatarRohan,
  dateRange: "Oct 1, 2024 - Oct 26, 2024",
};

export interface AdminKpiItem {
  id: "stores" | "vendors" | "products" | "orders" | "revenue";
  title: string;
  value: string;
  rawValue: number;
  growth: string;
  comparison: string;
  accent: "violet" | "blue" | "green" | "orange";
  colorHex: string;
  bgHex: string;
  sparkline: {
    stroke: string;
    fillGradId: string;
    path: string;
    line: string;
  };
}

export const REFERENCE_KPIS: AdminKpiItem[] = [
  {
    id: "stores",
    title: "Total Stores",
    value: "428",
    rawValue: 428,
    growth: "↑ 12%",
    comparison: "vs last month",
    accent: "violet",
    colorHex: "#6538F5",
    bgHex: "#F0EBFF",
    sparkline: {
      stroke: "#6538F5",
      fillGradId: "sparkViolet",
      path: "M0,32 C20,30 40,24 60,26 C80,28 100,16 120,20 C140,24 160,12 180,14 C200,16 220,8 240,6 L240,40 L0,40 Z",
      line: "M0,32 C20,30 40,24 60,26 C80,28 100,16 120,20 C140,24 160,12 180,14 C200,16 220,8 240,6",
    },
  },
  {
    id: "vendors",
    title: "Total Vendors",
    value: "412",
    rawValue: 412,
    growth: "↑ 18%",
    comparison: "vs last month",
    accent: "blue",
    colorHex: "#1685FF",
    bgHex: "#EBF3FF",
    sparkline: {
      stroke: "#1685FF",
      fillGradId: "sparkBlue",
      path: "M0,35 C25,32 50,30 75,22 C100,14 125,26 150,18 C175,10 200,14 240,8 L240,40 L0,40 Z",
      line: "M0,35 C25,32 50,30 75,22 C100,14 125,26 150,18 C175,10 200,14 240,8",
    },
  },
  {
    id: "products",
    title: "Total Products",
    value: "8,542",
    rawValue: 8542,
    growth: "↑ 25%",
    comparison: "vs last month",
    accent: "green",
    colorHex: "#08C784",
    bgHex: "#EBFBF5",
    sparkline: {
      stroke: "#08C784",
      fillGradId: "sparkGreen",
      path: "M0,36 C30,34 60,22 90,20 C120,18 150,28 180,16 C210,12 225,10 240,4 L240,40 L0,40 Z",
      line: "M0,36 C30,34 60,22 90,20 C120,18 150,28 180,16 C210,12 225,10 240,4",
    },
  },
  {
    id: "orders",
    title: "Total Orders",
    value: "12,560",
    rawValue: 12560,
    growth: "↑ 22%",
    comparison: "vs last month",
    accent: "orange",
    colorHex: "#FF8A00",
    bgHex: "#FFF4EB",
    sparkline: {
      stroke: "#FF8A00",
      fillGradId: "sparkOrange",
      path: "M0,38 C30,36 60,28 90,30 C120,24 150,18 180,14 C210,16 225,10 240,6 L240,40 L0,40 Z",
      line: "M0,38 C30,36 60,28 90,30 C120,24 150,18 180,14 C210,16 225,10 240,6",
    },
  },
  {
    id: "revenue",
    title: "Platform Revenue",
    value: "₹18,42,560",
    rawValue: 1842560,
    growth: "↑ 28%",
    comparison: "vs last month",
    accent: "violet",
    colorHex: "#6538F5",
    bgHex: "#F0EBFF",
    sparkline: {
      stroke: "#6538F5",
      fillGradId: "sparkRevenue",
      path: "M0,34 C25,30 50,32 75,22 C100,12 125,24 150,16 C175,8 200,12 240,4 L240,40 L0,40 Z",
      line: "M0,34 C25,30 50,32 75,22 C100,12 125,24 150,16 C175,8 200,12 240,4",
    },
  },
];

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export const REVENUE_DAILY_DATA: RevenueDataPoint[] = [
  { date: "Oct 1", revenue: 210000, orders: 140 },
  { date: "Oct 3", revenue: 280000, orders: 180 },
  { date: "Oct 5", revenue: 250000, orders: 165 },
  { date: "Oct 7", revenue: 390000, orders: 245 },
  { date: "Oct 9", revenue: 340000, orders: 215 },
  { date: "Oct 11", revenue: 480000, orders: 310 },
  { date: "Oct 13", revenue: 520000, orders: 340 },
  { date: "Oct 15", revenue: 624350, orders: 412 }, // reference tooltip peak
  { date: "Oct 17", revenue: 580000, orders: 385 },
  { date: "Oct 19", revenue: 690000, orders: 450 },
  { date: "Oct 21", revenue: 720000, orders: 470 },
  { date: "Oct 23", revenue: 680000, orders: 440 },
  { date: "Oct 25", revenue: 790000, orders: 510 },
  { date: "Oct 26", revenue: 840000, orders: 545 },
];

export const REVENUE_WEEKLY_DATA: RevenueDataPoint[] = [
  { date: "Week 1", revenue: 1650000, orders: 1080 },
  { date: "Week 2", revenue: 2240000, orders: 1460 },
  { date: "Week 3", revenue: 3150000, orders: 2040 },
  { date: "Week 4", revenue: 4120000, orders: 2680 },
];

export const REVENUE_MONTHLY_DATA: RevenueDataPoint[] = [
  { date: "May", revenue: 8200000, orders: 5400 },
  { date: "Jun", revenue: 9800000, orders: 6500 },
  { date: "Jul", revenue: 11400000, orders: 7600 },
  { date: "Aug", revenue: 13200000, orders: 8800 },
  { date: "Sep", revenue: 15600000, orders: 10400 },
  { date: "Oct", revenue: 1842560, orders: 12560 },
];

export const REVENUE_YEARLY_DATA: RevenueDataPoint[] = [
  { date: "2021", revenue: 28400000, orders: 18500 },
  { date: "2022", revenue: 48900000, orders: 32400 },
  { date: "2023", revenue: 76200000, orders: 51200 },
  { date: "2024", revenue: 118400000, orders: 79600 },
];

export interface GrowthDataPoint {
  month: string;
  newStores: number;
  newVendors: number;
}

export const PLATFORM_GROWTH_DATA: GrowthDataPoint[] = [
  { month: "May", newStores: 32, newVendors: 28 },
  { month: "Jun", newStores: 45, newVendors: 40 },
  { month: "Jul", newStores: 58, newVendors: 52 },
  { month: "Aug", newStores: 70, newVendors: 64 },
  { month: "Sep", newStores: 84, newVendors: 76 },
  { month: "Oct", newStores: 102, newVendors: 94 },
];

export interface RecentStore {
  id: string;
  name: string;
  logo: string;
  vendor: string;
  products: number;
  status: "Active" | "Pending" | "Suspended";
  joined: string;
}

export const RECENT_STORES: RecentStore[] = [
  {
    id: "store_1",
    name: "The Urban Nest",
    logo: storeUrbanNestCover,
    vendor: "Priya Sharma",
    products: 124,
    status: "Active",
    joined: "Oct 26, 2024",
  },
  {
    id: "store_2",
    name: "StyleHub",
    logo: storeStyleNestCover,
    vendor: "Karan Malhotra",
    products: 86,
    status: "Active",
    joined: "Oct 25, 2024",
  },
  {
    id: "store_3",
    name: "TechNova",
    logo: storeTechZoneCover,
    vendor: "Rohit Verma",
    products: 210,
    status: "Pending",
    joined: "Oct 24, 2024",
  },
  {
    id: "store_4",
    name: "Glow & Grace",
    logo: storeBeautyBlissCover,
    vendor: "Sneha Kapoor",
    products: 74,
    status: "Active",
    joined: "Oct 24, 2024",
  },
  {
    id: "store_5",
    name: "HomeFynd",
    logo: storeHomeHavenCover,
    vendor: "Ankit Jain",
    products: 156,
    status: "Suspended",
    joined: "Oct 23, 2024",
  },
];

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerAvatar: string;
  store: string;
  amount: string;
  rawAmount: number;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
}

export const RECENT_ORDERS: RecentOrder[] = [
  {
    id: "ord_1024",
    orderNumber: "#1024",
    customer: "Aditi Singh",
    customerAvatar: avatarAditi,
    store: "The Urban Nest",
    amount: "₹1,499",
    rawAmount: 1499,
    status: "Delivered",
  },
  {
    id: "ord_1023",
    orderNumber: "#1023",
    customer: "Rohan Desai",
    customerAvatar: avatarRohan,
    store: "StyleHub",
    amount: "₹3,499",
    rawAmount: 3499,
    status: "Shipped",
  },
  {
    id: "ord_1022",
    orderNumber: "#1022",
    customer: "Meera Patel",
    customerAvatar: avatarNeha,
    store: "Glow & Grace",
    amount: "₹2,199",
    rawAmount: 2199,
    status: "Processing",
  },
  {
    id: "ord_1021",
    orderNumber: "#1021",
    customer: "Vikram Nair",
    customerAvatar: avatarAditi,
    store: "TechNova",
    amount: "₹899",
    rawAmount: 899,
    status: "Delivered",
  },
  {
    id: "ord_1020",
    orderNumber: "#1020",
    customer: "Kavya Iyer",
    customerAvatar: avatarNeha,
    store: "HomeFynd",
    amount: "₹1,299",
    rawAmount: 1299,
    status: "Cancelled",
  },
];

export interface PlatformHealthMetric {
  service: string;
  status: string;
  isOnline: boolean;
  value: string;
}

export const PLATFORM_HEALTH: {
  score: number;
  label: string;
  items: PlatformHealthMetric[];
} = {
  score: 92,
  label: "All systems operational",
  items: [
    { service: "Website Uptime", status: "Operational", isOnline: true, value: "99.9%" },
    { service: "Payment Services", status: "Online", isOnline: true, value: "Online" },
    { service: "Email Service", status: "Online", isOnline: true, value: "Online" },
    { service: "Database", status: "Online", isOnline: true, value: "Online" },
    { service: "Storage Usage", status: "Healthy", isOnline: true, value: "68%" },
  ],
};

export interface TopStore {
  rank: number;
  name: string;
  logo: string;
  vendor: string;
  totalSales: string;
  rawSales: number;
  orders: number;
  growth: string;
}

export const TOP_STORES: TopStore[] = [
  {
    rank: 1,
    name: "The Urban Nest",
    logo: storeUrbanNestCover,
    vendor: "Priya Sharma",
    totalSales: "₹2,84,560",
    rawSales: 284560,
    orders: 240,
    growth: "↑ 28%",
  },
  {
    rank: 2,
    name: "StyleHub",
    logo: storeStyleNestCover,
    vendor: "Karan Malhotra",
    totalSales: "₹1,92,430",
    rawSales: 192430,
    orders: 186,
    growth: "↑ 24%",
  },
  {
    rank: 3,
    name: "TechNova",
    logo: storeTechZoneCover,
    vendor: "Rohit Verma",
    totalSales: "₹1,65,230",
    rawSales: 165230,
    orders: 142,
    growth: "↑ 18%",
  },
  {
    rank: 4,
    name: "Glow & Grace",
    logo: storeBeautyBlissCover,
    vendor: "Sneha Kapoor",
    totalSales: "₹1,28,990",
    rawSales: 128990,
    orders: 118,
    growth: "↑ 16%",
  },
  {
    rank: 5,
    name: "HomeFynd",
    logo: storeHomeHavenCover,
    vendor: "Ankit Jain",
    totalSales: "₹1,05,670",
    rawSales: 105670,
    orders: 96,
    growth: "↑ 14%",
  },
];

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  store: string;
  sold: number;
  revenue: string;
  rawRevenue: number;
}

export const TOP_PRODUCTS: TopProduct[] = [
  {
    id: "prod_1",
    name: "Minimalist Skincare Set",
    image: productSkincare,
    store: "Glow & Grace",
    sold: 420,
    revenue: "₹2,10,000",
    rawRevenue: 210000,
  },
  {
    id: "prod_2",
    name: "Running Shoes",
    image: productShoes,
    store: "StyleHub",
    sold: 380,
    revenue: "₹1,32,100",
    rawRevenue: 132100,
  },
  {
    id: "prod_3",
    name: "Leather Handbag",
    image: productLeatherHandbag,
    store: "The Urban Nest",
    sold: 320,
    revenue: "₹1,02,400",
    rawRevenue: 102400,
  },
  {
    id: "prod_4",
    name: "Wireless Headphones",
    image: productHeadphones,
    store: "TechNova",
    sold: 280,
    revenue: "₹78,400",
    rawRevenue: 78400,
  },
  {
    id: "prod_5",
    name: "Ceramic Coffee Mug",
    image: productCeramicMug,
    store: "HomeFynd",
    sold: 250,
    revenue: "₹62,500",
    rawRevenue: 62500,
  },
];

export interface QuickActionItem {
  id: "add-store" | "approve-vendors" | "manage-products" | "view-reports";
  label: string;
  iconName: "Store" | "UserCheck" | "Package" | "BarChart3";
  bgColor: string;
  iconColor: string;
  hoverBorder: string;
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "add-store",
    label: "Add New Store",
    iconName: "Store",
    bgColor: "bg-[#F0EBFF]",
    iconColor: "text-[#6538F5]",
    hoverBorder: "hover:border-[#6538F5]/40",
  },
  {
    id: "approve-vendors",
    label: "Approve Vendors",
    iconName: "UserCheck",
    bgColor: "bg-[#EBF3FF]",
    iconColor: "text-[#1685FF]",
    hoverBorder: "hover:border-[#1685FF]/40",
  },
  {
    id: "manage-products",
    label: "Manage Products",
    iconName: "Package",
    bgColor: "bg-[#EBFBF5]",
    iconColor: "text-[#08C784]",
    hoverBorder: "hover:border-[#08C784]/40",
  },
  {
    id: "view-reports",
    label: "View Reports",
    iconName: "BarChart3",
    bgColor: "bg-[#FFF4EB]",
    iconColor: "text-[#FF8A00]",
    hoverBorder: "hover:border-[#FF8A00]/40",
  },
];

export interface AdminNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "warning" | "success" | "info";
  unread: boolean;
}

export const REFERENCE_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif_1",
    title: "Pending Merchant Approval",
    description: "Zenith Home & Living submitted onboarding KYC documents for review.",
    time: "10m ago",
    type: "warning",
    unread: true,
  },
  {
    id: "notif_2",
    title: "Payout Batch Dispatched",
    description: "₹48.2L merchant payout successfully processed via RazorpayX.",
    time: "1h ago",
    type: "success",
    unread: true,
  },
  {
    id: "notif_3",
    title: "Storage Backup Completed",
    description: "Automated snapshot of edge Postgres replica completed in 42s.",
    time: "3h ago",
    type: "info",
    unread: true,
  },
];

export function generateDashboardCsvReport(): string {
  const lines: string[] = [];
  lines.push("VENDORA SAAS COMMERCE PLATFORM — SUPER ADMIN EXECUTIVE REPORT");
  lines.push(`Generated On,${new Date().toISOString()}`);
  lines.push(`Reporting Period,Oct 1 2024 - Oct 26 2024`);
  lines.push(`Administrator,Arjun Mehta (admin@vendora.com)`);
  lines.push("");
  lines.push("KEY PERFORMANCE METRICS");
  lines.push("Metric,Value,Growth vs Last Month");
  REFERENCE_KPIS.forEach((kpi) => {
    lines.push(`"${kpi.title}","${kpi.value}","${kpi.growth}"`);
  });
  lines.push("");
  lines.push("TOP PERFORMING STORES");
  lines.push("Rank,Store Name,Vendor,Total Sales,Orders,Growth");
  TOP_STORES.forEach((s) => {
    lines.push(`${s.rank},"${s.name}","${s.vendor}","${s.totalSales}",${s.orders},"${s.growth}"`);
  });
  lines.push("");
  lines.push("RECENT STORES");
  lines.push("Store Name,Vendor,Products,Status,Joined");
  RECENT_STORES.forEach((s) => {
    lines.push(`"${s.name}","${s.vendor}",${s.products},"${s.status}","${s.joined}"`);
  });
  lines.push("");
  lines.push("RECENT ORDERS");
  lines.push("Order ID,Customer,Store,Amount,Status");
  RECENT_ORDERS.forEach((o) => {
    lines.push(`"${o.orderNumber}","${o.customer}","${o.store}","${o.amount}","${o.status}"`);
  });
  lines.push("");
  lines.push("TOP SELLING PRODUCTS");
  lines.push("Product,Store,Sold,Revenue");
  TOP_PRODUCTS.forEach((p) => {
    lines.push(`"${p.name}","${p.store}",${p.sold},"${p.revenue}"`);
  });

  return lines.join("\n");
}
