import type { VendorUser, VendorStore, VendorOrder, VendorSession } from "./vendor-types";
import { stores as initialStores, type Store } from "@/data/stores";
import { hashPassword } from "./vendor-crypto";

const VENDORS_KEY = "vendora_vendors_v1";
const STORES_KEY = "vendora_custom_stores_v1";
const ORDERS_KEY = "vendora_orders_v1";
const SESSION_KEY = "vendora_session_v1";

const DEFAULT_SALT = "vendora_salt_demo";

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

// Initial demo vendors seeded into storage
export const initialDemoVendor: VendorUser = {
  id: "vendor_stylenest",
  fullName: "Neha Sharma",
  email: "neha@stylenest.in",
  phone: "+91 98765 43210",
  passwordHash: "", // Will be computed on seed
  salt: DEFAULT_SALT,
  role: "vendor",
  createdAt: new Date().toISOString(),
  storeId: "stylenest",
};

export const initialRohanVendor: VendorUser = {
  id: "vendor_rohan_urban_nest",
  fullName: "Rohan Mehta",
  email: "rohan@theurbannest.com",
  phone: "+91 98200 12345",
  passwordHash: "", // Will be computed on seed
  salt: DEFAULT_SALT,
  role: "vendor",
  createdAt: new Date().toISOString(),
  storeId: "the-urban-nest",
};

export const initialDemoOrders: VendorOrder[] = [
  {
    id: "ord-1025",
    orderNumber: "#1025",
    storeId: "the-urban-nest",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram.m@example.com",
    customerPhone: "+91 98765 11223",
    shippingAddress: "Flat 402, Sunrise Towers, Indiranagar, Bengaluru - 560038",
    items: [{ productName: "Minimalist Skincare Set", qty: 2, price: 1499 }],
    total: 2998,
    status: "Pending",
    date: "Oct 27, 2024",
    paymentMethod: "UPI (Prepaid)",
    trackingNumber: "VND-PEND-1025",
  },
  {
    id: "ord-1024",
    orderNumber: "#1024",
    storeId: "the-urban-nest",
    customerName: "Priya Sharma",
    customerEmail: "priya.sharma@example.com",
    customerPhone: "+91 98450 12345",
    shippingAddress: "12 Palm Grove Road, Koramangala 4th Block, Bengaluru - 560034",
    items: [{ productName: "Minimalist Skincare Set", qty: 1, price: 1499 }],
    total: 1499,
    status: "Delivered",
    date: "Oct 26, 2024",
    paymentMethod: "Credit Card (Prepaid)",
    trackingNumber: "VND-98432-IN",
  },
  {
    id: "ord-1023",
    orderNumber: "#1023",
    storeId: "the-urban-nest",
    customerName: "Arjun Patel",
    customerEmail: "arjun.patel@example.com",
    customerPhone: "+91 97123 45678",
    shippingAddress: "45 Silver Oak Society, Satellite, Ahmedabad - 380015",
    items: [{ productName: "Running Shoes", qty: 1, price: 3499 }],
    total: 3499,
    status: "Shipped",
    date: "Oct 25, 2024",
    paymentMethod: "Net Banking (Prepaid)",
    trackingNumber: "VND-EXP-77412",
  },
  {
    id: "ord-1022",
    orderNumber: "#1022",
    storeId: "the-urban-nest",
    customerName: "Sneha Gupta",
    customerEmail: "sneha.gupta@example.com",
    customerPhone: "+91 98210 98765",
    shippingAddress: "78 Park Street, 2nd Floor, Kolkata - 700016",
    items: [{ productName: "Leather Handbag", qty: 1, price: 2199 }],
    total: 2199,
    status: "Processing",
    date: "Oct 24, 2024",
    paymentMethod: "Debit Card (Prepaid)",
    trackingNumber: "VND-PROC-66231",
  },
  {
    id: "ord-1021",
    orderNumber: "#1021",
    storeId: "the-urban-nest",
    customerName: "Karan Verma",
    customerEmail: "karan.verma@example.com",
    customerPhone: "+91 99887 65432",
    shippingAddress: "10B Green Glen Layout, Bellandur, Bengaluru - 560103",
    items: [{ productName: "Ceramic Coffee Mug", qty: 1, price: 899 }],
    total: 899,
    status: "Delivered",
    date: "Oct 24, 2024",
    paymentMethod: "UPI (Prepaid)",
    trackingNumber: "VND-98401-IN",
  },
  {
    id: "ord-1020",
    orderNumber: "#1020",
    storeId: "the-urban-nest",
    customerName: "Neha Kapoor",
    customerEmail: "neha.kapoor@example.com",
    customerPhone: "+91 98111 22334",
    shippingAddress: "C-14 Defence Colony, New Delhi - 110024",
    items: [{ productName: "Wireless Headphones", qty: 1, price: 1299 }],
    total: 1299,
    status: "Cancelled",
    date: "Oct 23, 2024",
    paymentMethod: "Refunded to Source",
    trackingNumber: "VND-CANC-55102",
  },
  {
    id: "ORD-1024",
    orderNumber: "#1024",
    storeId: "stylenest",
    customerName: "Priya Patel",
    customerEmail: "priya@example.com",
    customerPhone: "+91 98765 43210",
    shippingAddress: "22 MG Road, Bengaluru - 560001",
    items: [{ productName: "Artisan Ceramic Mug", qty: 2, price: 599 }],
    total: 1198,
    status: "Delivered",
    date: "Today, 11:30 AM",
    paymentMethod: "UPI",
    trackingNumber: "VND-99120-SN",
  },
  {
    id: "ORD-1023",
    orderNumber: "#1023",
    storeId: "stylenest",
    customerName: "Rahul Verma",
    customerEmail: "rahul@example.com",
    customerPhone: "+91 98123 77889",
    shippingAddress: "18 Marine Drive, Mumbai - 400020",
    items: [{ productName: "Classic Denim Jacket", qty: 1, price: 2499 }],
    total: 2499,
    status: "Shipped",
    date: "Yesterday, 3:45 PM",
    paymentMethod: "Credit Card",
    trackingNumber: "VND-99119-SN",
  },
  {
    id: "ORD-1022",
    orderNumber: "#1022",
    storeId: "stylenest",
    customerName: "Ananya Iyer",
    customerEmail: "ananya@example.com",
    customerPhone: "+91 97400 33445",
    shippingAddress: "88 Anna Salai, Chennai - 600002",
    items: [{ productName: "Silk Scarf", qty: 1, price: 1299 }],
    total: 1299,
    status: "Processing",
    date: "24 Oct 2026",
    paymentMethod: "Debit Card",
    trackingNumber: "VND-99118-SN",
  },
];

let seeded = false;

export async function ensureSeeded(): Promise<void> {
  if (seeded || !isBrowser()) return;
  try {
    const demoHash = await hashPassword("vendora123", DEFAULT_SALT);
    initialDemoVendor.passwordHash = demoHash;
    initialRohanVendor.passwordHash = demoHash;

    const existing = window.localStorage.getItem(VENDORS_KEY);
    if (!existing) {
      window.localStorage.setItem(
        VENDORS_KEY,
        JSON.stringify([initialDemoVendor, initialRohanVendor]),
      );
    } else {
      const parsed = JSON.parse(existing) as VendorUser[];
      const hasRohan = parsed.some((v) => v.email.toLowerCase() === "rohan@theurbannest.com");
      if (!hasRohan) {
        parsed.push(initialRohanVendor);
        window.localStorage.setItem(VENDORS_KEY, JSON.stringify(parsed));
      }
    }

    const existingOrders = window.localStorage.getItem(ORDERS_KEY);
    if (!existingOrders) {
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(initialDemoOrders));
    } else {
      try {
        const parsed = JSON.parse(existingOrders) as VendorOrder[];
        const hasUrbanNest = parsed.some((o) => o.storeId === "the-urban-nest");
        if (!hasUrbanNest) {
          const urbanNestOrders = initialDemoOrders.filter((o) => o.storeId === "the-urban-nest");
          parsed.push(...urbanNestOrders);
          window.localStorage.setItem(ORDERS_KEY, JSON.stringify(parsed));
        }
      } catch {
        window.localStorage.setItem(ORDERS_KEY, JSON.stringify(initialDemoOrders));
      }
    }
    seeded = true;
  } catch {
    // Ignore storage errors
  }
}

export function getStoredVendors(): VendorUser[] {
  if (!isBrowser()) return [initialDemoVendor, initialRohanVendor];
  try {
    const raw = window.localStorage.getItem(VENDORS_KEY);
    if (raw) return JSON.parse(raw) as VendorUser[];
  } catch {
    // Return empty on parse error
  }
  return [initialDemoVendor, initialRohanVendor];
}

export function saveVendors(vendors: VendorUser[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(VENDORS_KEY, JSON.stringify(vendors));
  } catch {
    // Storage unavailable
  }
}

export function getCustomStores(): VendorStore[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORES_KEY);
    if (raw) return JSON.parse(raw) as VendorStore[];
  } catch {
    // Return empty on error
  }
  return [];
}

export function saveCustomStores(stores: VendorStore[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  } catch {
    // Storage unavailable
  }
}

/** Persist store edits and let the caller surface storage failures. */
export function saveCustomStoresStrict(stores: VendorStore[]): void {
  if (!isBrowser()) throw new Error("Store changes can only be saved in a browser.");
  window.localStorage.setItem(STORES_KEY, JSON.stringify(stores));
}

export function getStoredOrders(storeId?: string): VendorOrder[] {
  if (!isBrowser())
    return storeId ? initialDemoOrders.filter((o) => o.storeId === storeId) : initialDemoOrders;
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const all = JSON.parse(raw) as VendorOrder[];
      return storeId ? all.filter((o) => o.storeId === storeId) : all;
    }
  } catch {
    // Return empty on error
  }
  return storeId ? initialDemoOrders.filter((o) => o.storeId === storeId) : initialDemoOrders;
}

export function saveStoredOrders(orders: VendorOrder[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Storage unavailable
  }
}

export function getActiveSession(): VendorSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw) as VendorSession;
      if (session.expiresAt > Date.now()) {
        return session;
      }
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Return null
  }
  return null;
}

export function saveActiveSession(session: VendorSession | null): void {
  if (!isBrowser()) return;
  try {
    if (!session) {
      window.localStorage.removeItem(SESSION_KEY);
    } else {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Storage unavailable
  }
}
