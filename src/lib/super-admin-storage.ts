import type {
  SuperAdminManagedStore,
  SuperAdminStoresSummary,
  SuperAdminStoreFilters,
  SuperAdminStoreListResponse,
  SuperAdminStoreCreateInput,
  SuperAdminStoreUpdateInput,
  StoreStatus,
  SuperAdminAuditLog,
  SuperAdminUser,
} from "./super-admin-types";
import { SUPER_ADMIN_ROLE } from "./super-admin-types";
import { verifyPassword, hashPassword, generateSalt } from "./vendor-crypto";

const STORES_STORAGE_KEY = "vendora_super_admin_stores_v1";
const ADMIN_SESSION_STORAGE_KEY = "vendora_super_admin_session_v1";
const AUDIT_LOGS_STORAGE_KEY = "vendora_super_admin_audit_logs_v1";

export const DEFAULT_ADMIN_EMAIL = "admin@vendora.com";
export const DEFAULT_ADMIN_PASSWORD = "vendora123";

export const INITIAL_MANAGED_STORES: SuperAdminManagedStore[] = [
  {
    id: "the-urban-nest",
    slug: "the-urban-nest",
    name: "The Urban Nest",
    tagline: "Curated modern home essentials",
    description:
      "Curated artisan home decor, ceramics, and lifestyle essentials for modern living.",
    category: "home-living",
    ownerName: "Rohan Mehta",
    ownerEmail: "rohan@theurbannest.com",
    ownerPhone: "+91 98200 12345",
    vendorId: "vendor_rohan_urban_nest",
    status: "Active",
    productsCount: 48,
    ordersCount: 240,
    revenueINR: 284560,
    rating: 4.9,
    reviewsCount: 320,
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2026-10-25T11:20:00.000Z",
    storefrontUrl: "/store/the-urban-nest",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    id: "stylenest",
    slug: "stylenest",
    name: "StyleNest",
    tagline: "Contemporary apparel & accessories",
    description:
      "Elevated everyday apparel, designer basics, and curated footwear for urban living.",
    category: "fashion",
    ownerName: "Karan Malhotra",
    ownerEmail: "karan@stylenest.in",
    ownerPhone: "+91 98765 43210",
    vendorId: "vendor_stylenest",
    status: "Active",
    productsCount: 86,
    ordersCount: 186,
    revenueINR: 192430,
    rating: 4.8,
    reviewsCount: 195,
    createdAt: "2024-02-14T00:00:00.000Z",
    updatedAt: "2026-10-26T09:15:00.000Z",
    storefrontUrl: "/store/stylenest",
    city: "Mumbai",
    state: "Maharashtra",
  },
  {
    id: "technova",
    slug: "technova",
    name: "TechNova",
    tagline: "Next-gen audio & electronics",
    description: "Premium headphones, portable smart speakers, and high-fidelity desk electronics.",
    category: "electronics",
    ownerName: "Rohit Verma",
    ownerEmail: "rohit@technova.co",
    ownerPhone: "+91 98111 22334",
    vendorId: "vendor_technova",
    status: "Pending",
    productsCount: 210,
    ordersCount: 142,
    revenueINR: 165230,
    rating: 4.7,
    reviewsCount: 140,
    createdAt: "2024-03-01T00:00:00.000Z",
    updatedAt: "2026-10-27T16:40:00.000Z",
    storefrontUrl: "/store/technova",
    city: "Hyderabad",
    state: "Telangana",
  },
  {
    id: "glow-and-grace",
    slug: "glow-and-grace",
    name: "Glow & Grace",
    tagline: "Clean skincare & botanicals",
    description:
      "Organic botanical extracts, cruelty-free serums, and dermatologically tested care.",
    category: "beauty",
    ownerName: "Sneha Kapoor",
    ownerEmail: "sneha@glowgrace.in",
    ownerPhone: "+91 97654 32109",
    vendorId: "vendor_glow_grace",
    status: "Active",
    productsCount: 74,
    ordersCount: 118,
    revenueINR: 128990,
    rating: 4.9,
    reviewsCount: 210,
    createdAt: "2024-03-15T00:00:00.000Z",
    updatedAt: "2026-10-27T14:10:00.000Z",
    storefrontUrl: "/store/glow-and-grace",
    city: "Bengaluru",
    state: "Karnataka",
  },
  {
    id: "homefynd",
    slug: "homefynd",
    name: "HomeFynd",
    tagline: "Smart living & storage solutions",
    description: "Modular furniture, space-saving kitchenware, and minimalist household storage.",
    category: "home-living",
    ownerName: "Ankit Jain",
    ownerEmail: "ankit@homefynd.com",
    ownerPhone: "+91 99000 88776",
    vendorId: "vendor_homefynd",
    status: "Suspended",
    suspensionReason: "Documentation verification pending compliance check",
    productsCount: 156,
    ordersCount: 96,
    revenueINR: 105670,
    rating: 4.5,
    reviewsCount: 88,
    createdAt: "2024-04-02T00:00:00.000Z",
    updatedAt: "2026-10-24T18:00:00.000Z",
    storefrontUrl: "/store/homefynd",
    city: "Delhi",
    state: "Delhi",
  },
  {
    id: "artisan-leathercraft",
    slug: "artisan-leathercraft",
    name: "Artisan Leathercraft",
    tagline: "Handcrafted full-grain leather goods",
    description:
      "Hand-stitched leather wallets, heritage messenger bags, and timeless accessories.",
    category: "fashion",
    ownerName: "Devendra Patel",
    ownerEmail: "devendra@artisanleather.in",
    ownerPhone: "+91 98450 11223",
    vendorId: "vendor_artisan_leather",
    status: "Pending",
    productsCount: 32,
    ordersCount: 54,
    revenueINR: 78200,
    rating: 4.6,
    reviewsCount: 42,
    createdAt: "2026-10-27T14:32:00.000Z",
    updatedAt: "2026-10-27T14:32:00.000Z",
    storefrontUrl: "/store/artisan-leathercraft",
    city: "Ahmedabad",
    state: "Gujarat",
  },
  {
    id: "zenith-living",
    slug: "zenith-living",
    name: "Zenith Home & Living",
    tagline: "Nordic inspired ceramics and lights",
    description: "Handmade ceramic dinnerware, matte pendants, and Scandinavian lifestyle goods.",
    category: "home-living",
    ownerName: "Sana Farooqui",
    ownerEmail: "sana@zenithliving.co",
    ownerPhone: "+91 99345 67890",
    vendorId: "vendor_zenith_living",
    status: "Pending",
    productsCount: 28,
    ordersCount: 41,
    revenueINR: 62400,
    rating: 4.8,
    reviewsCount: 35,
    createdAt: "2026-10-28T07:15:00.000Z",
    updatedAt: "2026-10-28T07:15:00.000Z",
    storefrontUrl: "/store/zenith-living",
    city: "Pune",
    state: "Maharashtra",
  },
];

// Memory cache fallback for SSR and test execution
let memoryStoresCache: SuperAdminManagedStore[] | null = null;
let memoryAuditLogsCache: SuperAdminAuditLog[] | null = null;
let memoryAdminSession: { email: string; role: typeof SUPER_ADMIN_ROLE; expiresAt: number } | null =
  null;

export function getStoredManagedStores(): SuperAdminManagedStore[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORES_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as SuperAdminManagedStore[];
      }
      // Seed initial
      window.localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(INITIAL_MANAGED_STORES));
      return [...INITIAL_MANAGED_STORES];
    } catch {
      // localStorage failed, fall back to memory
    }
  }

  if (!memoryStoresCache) {
    memoryStoresCache = [...INITIAL_MANAGED_STORES];
  }
  return memoryStoresCache;
}

export function saveStoredManagedStores(stores: SuperAdminManagedStore[]): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
    } catch {
      // Ignore storage error
    }
  }
  memoryStoresCache = [...stores];
}

export function calculateStoresSummary(stores: SuperAdminManagedStore[]): SuperAdminStoresSummary {
  const activeStores = stores.filter((s) => !s.isArchived);
  return {
    total: activeStores.length,
    active: activeStores.filter((s) => s.status === "Active").length,
    pending: activeStores.filter((s) => s.status === "Pending").length,
    suspended: activeStores.filter((s) => s.status === "Suspended").length,
  };
}

export function queryManagedStores(
  filters: SuperAdminStoreFilters = {},
): SuperAdminStoreListResponse {
  const allStores = getStoredManagedStores().filter((s) => !s.isArchived);
  const summary = calculateStoresSummary(allStores);

  let filtered = [...allStores];

  // Search filter
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.ownerEmail.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }

  // Status filter
  if (filters.status && filters.status !== "All") {
    filtered = filtered.filter((s) => s.status === filters.status);
  }

  // Category filter
  if (filters.category && filters.category !== "All") {
    filtered = filtered.filter((s) => s.category.toLowerCase() === filters.category!.toLowerCase());
  }

  // Sort
  const sortBy = filters.sortBy || "newest";
  filtered.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "revenue":
        return b.revenueINR - a.revenueINR;
      case "products":
        return b.productsCount - a.productsCount;
      case "orders":
        return b.ordersCount - a.ordersCount;
      default:
        return 0;
    }
  });

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, filters.pageSize || 10);
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    stores: paginated,
    summary,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

export function createNewManagedStore(
  input: SuperAdminStoreCreateInput,
  actorEmail = DEFAULT_ADMIN_EMAIL,
): SuperAdminManagedStore {
  const stores = getStoredManagedStores();
  const slug = (input.slug || input.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (stores.some((s) => s.id === slug && !s.isArchived)) {
    throw new Error(`Store with ID or slug '${slug}' already exists.`);
  }

  const now = new Date().toISOString();
  const newStore: SuperAdminManagedStore = {
    id: slug,
    slug,
    name: input.name.trim(),
    tagline: input.tagline?.trim() || `${input.category.toUpperCase()} • Official Storefront`,
    description: input.description?.trim() || `Official verified storefront on Vendora.`,
    category: input.category,
    ownerName: input.ownerName.trim(),
    ownerEmail: input.ownerEmail.trim().toLowerCase(),
    ownerPhone: input.ownerPhone?.trim(),
    vendorId: `vendor_${slug}_${Date.now()}`,
    status: input.status || "Active",
    productsCount: input.initialProductsCount || 0,
    ordersCount: 0,
    revenueINR: 0,
    rating: 5.0,
    reviewsCount: 0,
    createdAt: now,
    updatedAt: now,
    storefrontUrl: `/store/${slug}`,
  };

  stores.unshift(newStore);
  saveStoredManagedStores(stores);

  recordSuperAdminAuditLog({
    action: "STORE_CREATED",
    actor: actorEmail,
    details: `Created new store '${newStore.name}' (${newStore.id}) with status ${newStore.status}.`,
  });

  return newStore;
}

export function updateExistingManagedStore(
  id: string,
  input: SuperAdminStoreUpdateInput,
  actorEmail = DEFAULT_ADMIN_EMAIL,
): SuperAdminManagedStore {
  const stores = getStoredManagedStores();
  const index = stores.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error(`Store '${id}' not found.`);
  }

  const updated: SuperAdminManagedStore = {
    ...stores[index],
    ...(input.name ? { name: input.name.trim() } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.tagline ? { tagline: input.tagline.trim() } : {}),
    ...(input.description ? { description: input.description.trim() } : {}),
    ...(input.ownerName ? { ownerName: input.ownerName.trim() } : {}),
    ...(input.ownerEmail ? { ownerEmail: input.ownerEmail.trim().toLowerCase() } : {}),
    ...(input.ownerPhone ? { ownerPhone: input.ownerPhone.trim() } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.suspensionReason !== undefined ? { suspensionReason: input.suspensionReason } : {}),
    updatedAt: new Date().toISOString(),
  };

  stores[index] = updated;
  saveStoredManagedStores(stores);

  recordSuperAdminAuditLog({
    action: "STORE_UPDATED",
    actor: actorEmail,
    details: `Updated store '${updated.name}' (${updated.id}).`,
  });

  return updated;
}

export function updateManagedStoreStatus(
  id: string,
  status: StoreStatus,
  reason?: string,
  actorEmail = DEFAULT_ADMIN_EMAIL,
): SuperAdminManagedStore {
  const stores = getStoredManagedStores();
  const index = stores.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error(`Store '${id}' not found.`);
  }

  const updated: SuperAdminManagedStore = {
    ...stores[index],
    status,
    suspensionReason: status === "Suspended" ? reason || "Administrative suspension" : undefined,
    updatedAt: new Date().toISOString(),
  };

  stores[index] = updated;
  saveStoredManagedStores(stores);

  recordSuperAdminAuditLog({
    action: `STORE_STATUS_${status.toUpperCase()}`,
    actor: actorEmail,
    details: `Store '${updated.name}' status changed to ${status}${reason ? ` (Reason: ${reason})` : ""}.`,
  });

  return updated;
}

export function archiveManagedStore(id: string, actorEmail = DEFAULT_ADMIN_EMAIL): boolean {
  const stores = getStoredManagedStores();
  const index = stores.findIndex((s) => s.id === id);
  if (index === -1) return false;

  stores[index] = {
    ...stores[index],
    isArchived: true,
    status: "Suspended",
    updatedAt: new Date().toISOString(),
  };
  saveStoredManagedStores(stores);

  recordSuperAdminAuditLog({
    action: "STORE_ARCHIVED",
    actor: actorEmail,
    details: `Store '${id}' archived by administrator.`,
  });

  return true;
}

// -----------------------------------------------------------------------------
// Audit Logs
// -----------------------------------------------------------------------------

export function getSuperAdminAuditLogs(): SuperAdminAuditLog[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as SuperAdminAuditLog[];
    } catch {
      // Memory fallback
    }
  }
  return memoryAuditLogsCache || [];
}

export function recordSuperAdminAuditLog(entry: {
  action: string;
  actor: string;
  details: string;
}): void {
  const logs = getSuperAdminAuditLogs();
  const newLog: SuperAdminAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    action: entry.action,
    actor: entry.actor,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    status: "SUCCESS",
    metadata: { details: entry.details },
  };
  logs.unshift(newLog);
  const trimmed = logs.slice(0, 50);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Ignore
    }
  }
  memoryAuditLogsCache = trimmed;
}

// -----------------------------------------------------------------------------
// Client Authentication Session Helpers
// -----------------------------------------------------------------------------

export function getClientAdminSession(): SuperAdminUser | null {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return { email: parsed.email, role: SUPER_ADMIN_ROLE };
        }
        window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      }
    } catch {
      // Storage error
    }
  }

  if (memoryAdminSession && Date.now() < memoryAdminSession.expiresAt) {
    return { email: memoryAdminSession.email, role: SUPER_ADMIN_ROLE };
  }
  return null;
}

export function saveClientAdminSession(email: string): void {
  const session = {
    email,
    role: SUPER_ADMIN_ROLE,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage error
    }
  }
  memoryAdminSession = session;
}

export function clearClientAdminSession(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    } catch {
      // Storage error
    }
  }
  memoryAdminSession = null;
}

export async function verifyClientAdminCredentials(
  email: string,
  pass: string,
): Promise<{ success: boolean; admin?: SuperAdminUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const expectedEmail = DEFAULT_ADMIN_EMAIL.toLowerCase();

  if (cleanEmail !== expectedEmail) {
    return { success: false, error: "Invalid administrator credentials." };
  }

  if (pass !== DEFAULT_ADMIN_PASSWORD) {
    return { success: false, error: "Invalid administrator credentials." };
  }

  saveClientAdminSession(DEFAULT_ADMIN_EMAIL);

  recordSuperAdminAuditLog({
    action: "ADMIN_SIGN_IN_SUCCESS",
    actor: DEFAULT_ADMIN_EMAIL,
    details: "Super Admin authenticated via platform credentials.",
  });

  return {
    success: true,
    admin: { email: DEFAULT_ADMIN_EMAIL, role: SUPER_ADMIN_ROLE },
  };
}
