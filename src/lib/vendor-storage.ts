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

const initialDemoOrders: VendorOrder[] = [
  {
    id: "ORD-1024",
    storeId: "stylenest",
    customerName: "Priya Patel",
    customerEmail: "priya@example.com",
    items: [{ productName: "Artisan Ceramic Mug", qty: 2, price: 599 }],
    total: 1198,
    status: "Delivered",
    date: "Today, 11:30 AM",
  },
  {
    id: "ORD-1023",
    storeId: "stylenest",
    customerName: "Rahul Verma",
    customerEmail: "rahul@example.com",
    items: [{ productName: "Classic Denim Jacket", qty: 1, price: 2499 }],
    total: 2499,
    status: "Shipped",
    date: "Yesterday, 3:45 PM",
  },
  {
    id: "ORD-1022",
    storeId: "stylenest",
    customerName: "Ananya Iyer",
    customerEmail: "ananya@example.com",
    items: [{ productName: "Silk Scarf", qty: 1, price: 1299 }],
    total: 1299,
    status: "Processing",
    date: "24 Oct 2026",
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
