import crypto from "node:crypto";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import {
  SUPER_ADMIN_ROLE,
  type SuperAdminRole,
  type SuperAdminUser,
  type SuperAdminAuthStatus,
  type SuperAdminLoginResult,
  type SuperAdminDashboardData,
  type SuperAdminManagedStore,
  type SuperAdminStoreFilters,
  type SuperAdminStoreListResponse,
  type SuperAdminStoreCreateInput,
  type SuperAdminStoreUpdateInput,
  type SuperAdminStoreOperationResult,
  type StoreStatus,
  type SuperAdminAuditLog,
} from "./super-admin-types";

export { SUPER_ADMIN_ROLE };
export type {
  SuperAdminRole,
  SuperAdminUser,
  SuperAdminAuthStatus,
  SuperAdminLoginResult,
  SuperAdminDashboardData,
  SuperAdminManagedStore,
  SuperAdminStoreFilters,
  SuperAdminStoreListResponse,
  SuperAdminStoreCreateInput,
  SuperAdminStoreUpdateInput,
  SuperAdminStoreOperationResult,
  StoreStatus,
  SuperAdminAuditLog,
};

export const ADMIN_COOKIE_NAME = "vendora_admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export interface SuperAdminSessionPayload {
  sessionId: string;
  email: string;
  role: SuperAdminRole;
  issuedAt: number;
  expiresAt: number;
}

// -----------------------------------------------------------------------------
// In-Memory Revocation & Rate-Limiter Stores (Server-side)
// -----------------------------------------------------------------------------
const revokedSessionIds = new Set<string>();

interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

let testConfigOverride: {
  email?: string;
  passwordHash?: string;
  passwordSalt?: string;
  sessionSecret?: string;
  isUnconfigured?: boolean;
} | null = null;

export function setSuperAdminConfigForTesting(config: {
  email: string;
  passwordHash: string;
  passwordSalt: string;
  sessionSecret: string;
}) {
  testConfigOverride = config;
}

export function setSuperAdminUnconfiguredForTesting() {
  testConfigOverride = { isUnconfigured: true };
}

export function resetSuperAdminConfigForTesting() {
  testConfigOverride = null;
  revokedSessionIds.clear();
  rateLimitMap.clear();
}

// -----------------------------------------------------------------------------
// Cryptographic Helpers (PBKDF2-SHA256 & Timing-Safe Comparison)
// -----------------------------------------------------------------------------
export function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
}

export function verifyPassword(provided: string, storedHash: string, salt: string): boolean {
  if (!provided || !storedHash || !salt) return false;
  try {
    const computedHash = hashPassword(provided, salt);
    const computedBuf = Buffer.from(computedHash, "hex");
    const storedBuf = Buffer.from(storedHash, "hex");
    if (computedBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, storedBuf);
  } catch {
    return false;
  }
}

export function generateSessionSecret(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export function signSessionToken(payload: SuperAdminSessionPayload, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string, secret: string): SuperAdminSessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const data = parts[0];
  const signature = parts[1];
  if (!data || !signature) return null;

  try {
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expectedSigBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedSigBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedSigBuf)) return null;

    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8"),
    ) as SuperAdminSessionPayload;

    if (!payload || payload.role !== SUPER_ADMIN_ROLE) return null;
    if (typeof payload.expiresAt !== "number" || Date.now() > payload.expiresAt) return null;
    if (payload.sessionId && revokedSessionIds.has(payload.sessionId)) return null;

    return payload;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Rate Limiter
// -----------------------------------------------------------------------------
export function checkRateLimit(key: string): { locked: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record) return { locked: false, retryAfterSeconds: 0 };

  if (record.lockedUntil) {
    if (now < record.lockedUntil) {
      const remainingSec = Math.max(1, Math.ceil((record.lockedUntil - now) / 1000));
      return { locked: true, retryAfterSeconds: remainingSec };
    }
    // Lock expired, reset window
    rateLimitMap.delete(key);
    return { locked: false, retryAfterSeconds: 0 };
  }

  // Reset window if older than rate limit window
  if (now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.delete(key);
    return { locked: false, retryAfterSeconds: 0 };
  }

  return { locked: false, retryAfterSeconds: 0 };
}

export function recordFailedAttempt(key: string): { locked: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const current = rateLimitMap.get(key);

  if (!current || now - current.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { attempts: 1, firstAttemptAt: now, lockedUntil: null });
    return { locked: false, retryAfterSeconds: 0 };
  }

  const attempts = current.attempts + 1;
  if (attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    const lockedUntil = now + RATE_LIMIT_LOCKOUT_MS;
    rateLimitMap.set(key, { attempts, firstAttemptAt: current.firstAttemptAt, lockedUntil });
    return { locked: true, retryAfterSeconds: Math.ceil(RATE_LIMIT_LOCKOUT_MS / 1000) };
  }

  rateLimitMap.set(key, { ...current, attempts });
  return { locked: false, retryAfterSeconds: 0 };
}

export function clearRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

// -----------------------------------------------------------------------------
// Server Environment Configuration Reader & Development Defaults
// -----------------------------------------------------------------------------
const DEV_DEFAULT_ADMIN_EMAIL = "admin@vendora.com";
const DEV_DEFAULT_PASSWORD_SALT = "f2e4c138e1dc9f6d9c7a00b8a421d3d2";
// PBKDF2-SHA256 (100,000 iterations) hash of "vendora123" with the salt above
const DEV_DEFAULT_PASSWORD_HASH =
  "9f19224221750ae3d7ae3d746e5e2d0ea5d7b9ceaebce63419b5318a4a24c4443eb7a762ca66870d3a1a5a312577fbb4e5c375c365da9b67b7d6e9aa7206c12e";
const DEV_DEFAULT_SESSION_SECRET = "vendora_dev_super_admin_secret_key_32chars_min";

let dynamicInitialSalt: string | null = null;
let dynamicInitialHash: string | null = null;

export function getSuperAdminConfig(): {
  email: string | null;
  passwordHash: string | null;
  passwordSalt: string | null;
  sessionSecret: string | null;
  isConfigured: boolean;
} {
  if (testConfigOverride) {
    if (testConfigOverride.isUnconfigured) {
      return {
        email: null,
        passwordHash: null,
        passwordSalt: null,
        sessionSecret: null,
        isConfigured: false,
      };
    }
    return {
      email: testConfigOverride.email || null,
      passwordHash: testConfigOverride.passwordHash || null,
      passwordSalt: testConfigOverride.passwordSalt || null,
      sessionSecret: testConfigOverride.sessionSecret || null,
      isConfigured: Boolean(
        testConfigOverride.email &&
        testConfigOverride.passwordHash &&
        testConfigOverride.passwordSalt &&
        testConfigOverride.sessionSecret,
      ),
    };
  }

  let email = process.env["SUPER_ADMIN_EMAIL"]?.trim() || null;
  let passwordHash = process.env["SUPER_ADMIN_PASSWORD_HASH"]?.trim() || null;
  let passwordSalt = process.env["SUPER_ADMIN_PASSWORD_SALT"]?.trim() || null;
  let sessionSecret = process.env["SUPER_ADMIN_SESSION_SECRET"]?.trim() || null;

  // Development convenience: derive from initial password if hash not provided
  const initialPassword = process.env["SUPER_ADMIN_INITIAL_PASSWORD"]?.trim();
  if (email && initialPassword && !passwordHash) {
    if (!dynamicInitialSalt || !dynamicInitialHash) {
      dynamicInitialSalt = generateSalt(16);
      dynamicInitialHash = hashPassword(initialPassword, dynamicInitialSalt);
    }
    passwordSalt = dynamicInitialSalt;
    passwordHash = dynamicInitialHash;
  }

  // Fallback to development default administrator if environment variables are not set
  if (!email || !passwordHash || !passwordSalt || !sessionSecret) {
    email = email || DEV_DEFAULT_ADMIN_EMAIL;
    passwordSalt = passwordSalt || DEV_DEFAULT_PASSWORD_SALT;
    passwordHash = passwordHash || DEV_DEFAULT_PASSWORD_HASH;
    sessionSecret = sessionSecret || DEV_DEFAULT_SESSION_SECRET;
  }

  const isConfigured = Boolean(email && passwordHash && passwordSalt && sessionSecret);

  return {
    email,
    passwordHash,
    passwordSalt,
    sessionSecret,
    isConfigured,
  };
}

export function isSuperAdminConfigured(): boolean {
  return getSuperAdminConfig().isConfigured;
}

// Safe cookie helpers that do not throw outside active StartEvent
export function safeGetCookie(name: string): string | undefined {
  try {
    return getCookie(name);
  } catch {
    return undefined;
  }
}

export function safeSetCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    maxAge?: number;
  } = {},
): void {
  try {
    setCookie(name, value, {
      httpOnly: options.httpOnly ?? true,
      secure: options.secure ?? process.env["NODE_ENV"] === "production",
      sameSite: options.sameSite ?? "lax",
      path: options.path ?? "/",
      maxAge: options.maxAge ?? Math.floor(SESSION_DURATION_MS / 1000),
    });
  } catch {
    // In standalone test environments, cookie write is a no-op
  }
}

export function safeDeleteCookie(name: string, options: { path?: string } = {}): void {
  try {
    deleteCookie(name, { path: options.path ?? "/" });
  } catch {
    // No-op outside active StartEvent
  }
}

// -----------------------------------------------------------------------------
// In-Memory Managed Stores State (Server-side)
// -----------------------------------------------------------------------------
export const serverManagedStores: SuperAdminManagedStore[] = [
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

const serverAuditLogs: SuperAdminAuditLog[] = [
  {
    id: "log_101",
    action: "ADMIN_SIGN_IN_SUCCESS",
    actor: DEV_DEFAULT_ADMIN_EMAIL,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    status: "SUCCESS",
  },
  {
    id: "log_100",
    action: "PLATFORM_CONFIG_VERIFIED",
    actor: "SYSTEM",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ipAddress: "INTERNAL",
    status: "SUCCESS",
  },
];

// -----------------------------------------------------------------------------
// Pure Core Verification Method (Reusable in Server Functions and Unit Tests)
// -----------------------------------------------------------------------------
export async function authenticateSuperAdminCredentials(
  emailInput: string,
  passwordInput: string,
  rateLimitKey = "global",
): Promise<SuperAdminLoginResult> {
  const config = getSuperAdminConfig();
  if (
    !config.isConfigured ||
    !config.email ||
    !config.passwordHash ||
    !config.passwordSalt ||
    !config.sessionSecret
  ) {
    return {
      success: false,
      error:
        "Administrator authentication is unconfigured. Initial platform administrator provisioning is required via server environment variables.",
    };
  }

  // Rate Limiter Check
  const rateLimitStatus = checkRateLimit(rateLimitKey);
  if (rateLimitStatus.locked) {
    return {
      success: false,
      rateLimited: true,
      retryAfterSeconds: rateLimitStatus.retryAfterSeconds,
      error: `Too many failed authentication attempts. Access locked for ${Math.ceil(
        rateLimitStatus.retryAfterSeconds / 60,
      )} minutes to prevent unauthorized access.`,
    };
  }

  const normalizedInputEmail = emailInput.trim().toLowerCase();
  const normalizedConfigEmail = config.email.trim().toLowerCase();

  // Validate email match
  if (normalizedInputEmail !== normalizedConfigEmail) {
    const failure = recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      rateLimited: failure.locked,
      retryAfterSeconds: failure.retryAfterSeconds,
      error: failure.locked
        ? `Too many failed authentication attempts. Access locked for ${Math.ceil(
            failure.retryAfterSeconds / 60,
          )} minutes to prevent unauthorized access.`
        : "Invalid administrator credentials.",
    };
  }

  // Validate password using timing-safe PBKDF2 comparison
  const isValid = verifyPassword(passwordInput, config.passwordHash, config.passwordSalt);
  if (!isValid) {
    const failure = recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      rateLimited: failure.locked,
      retryAfterSeconds: failure.retryAfterSeconds,
      error: failure.locked
        ? `Too many failed authentication attempts. Access locked for ${Math.ceil(
            failure.retryAfterSeconds / 60,
          )} minutes to prevent unauthorized access.`
        : "Invalid administrator credentials.",
    };
  }

  // Success: Clear rate limits
  clearRateLimit(rateLimitKey);

  const sessionId = crypto.randomUUID();
  const payload: SuperAdminSessionPayload = {
    sessionId,
    email: config.email,
    role: SUPER_ADMIN_ROLE,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  const token = signSessionToken(payload, config.sessionSecret);

  // Set HTTP-only Cookie
  safeSetCookie(ADMIN_COOKIE_NAME, token);

  return {
    success: true,
    admin: {
      email: config.email,
      role: SUPER_ADMIN_ROLE,
    },
  };
}

export function getActiveSuperAdminSession(): SuperAdminSessionPayload | null {
  const config = getSuperAdminConfig();
  if (!config.isConfigured || !config.sessionSecret) return null;

  const cookieToken = safeGetCookie(ADMIN_COOKIE_NAME);
  if (!cookieToken) return null;

  return verifySessionToken(cookieToken, config.sessionSecret);
}

// -----------------------------------------------------------------------------
// Handlers called by Server Functions (RPC Endpoints)
// -----------------------------------------------------------------------------

export async function handleGetStatus(): Promise<SuperAdminAuthStatus> {
  const config = getSuperAdminConfig();
  if (!config.isConfigured) {
    return {
      isConfigured: false,
      isAuthenticated: false,
      admin: null,
    };
  }

  const session = getActiveSuperAdminSession();
  if (!session || session.role !== SUPER_ADMIN_ROLE) {
    return {
      isConfigured: true,
      isAuthenticated: false,
      admin: null,
    };
  }

  return {
    isConfigured: true,
    isAuthenticated: true,
    admin: {
      email: session.email,
      role: session.role,
    },
  };
}

export async function handleLogin(email: string, pass: string): Promise<SuperAdminLoginResult> {
  const rateLimitKey = email.trim().toLowerCase();
  return await authenticateSuperAdminCredentials(email, pass, rateLimitKey);
}

export async function handleLogout(): Promise<{ success: boolean }> {
  const session = getActiveSuperAdminSession();
  if (session?.sessionId) {
    revokedSessionIds.add(session.sessionId);
  }
  safeDeleteCookie(ADMIN_COOKIE_NAME);
  return { success: true };
}

// -----------------------------------------------------------------------------
// Stores Management Server Handlers
// -----------------------------------------------------------------------------

export async function handleGetStores(
  filters: SuperAdminStoreFilters = {},
): Promise<SuperAdminStoreListResponse> {
  const all = serverManagedStores.filter((s) => !s.isArchived);

  const summary = {
    total: all.length,
    active: all.filter((s) => s.status === "Active").length,
    pending: all.filter((s) => s.status === "Pending").length,
    suspended: all.filter((s) => s.status === "Suspended").length,
  };

  let filtered = [...all];

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

  if (filters.status && filters.status !== "All") {
    filtered = filtered.filter((s) => s.status === filters.status);
  }

  if (filters.category && filters.category !== "All") {
    filtered = filtered.filter((s) => s.category.toLowerCase() === filters.category!.toLowerCase());
  }

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

export async function handleGetStoreById(id: string): Promise<SuperAdminManagedStore | null> {
  const store = serverManagedStores.find((s) => s.id === id && !s.isArchived);
  return store || null;
}

export async function handleCreateStore(
  input: SuperAdminStoreCreateInput,
): Promise<SuperAdminStoreOperationResult> {
  const slug = (input.slug || input.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (serverManagedStores.some((s) => s.id === slug && !s.isArchived)) {
    return {
      success: false,
      error: `Store with ID or slug '${slug}' already exists.`,
    };
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

  serverManagedStores.unshift(newStore);

  serverAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: "STORE_CREATED",
    actor: DEV_DEFAULT_ADMIN_EMAIL,
    timestamp: now,
    ipAddress: "127.0.0.1",
    status: "SUCCESS",
    metadata: { storeId: newStore.id, name: newStore.name },
  });

  return {
    success: true,
    store: newStore,
  };
}

export async function handleUpdateStore(
  id: string,
  input: SuperAdminStoreUpdateInput,
): Promise<SuperAdminStoreOperationResult> {
  const index = serverManagedStores.findIndex((s) => s.id === id && !s.isArchived);
  if (index === -1) {
    return { success: false, error: `Store '${id}' not found.` };
  }

  const updated: SuperAdminManagedStore = {
    ...serverManagedStores[index],
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

  serverManagedStores[index] = updated;

  serverAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: "STORE_UPDATED",
    actor: DEV_DEFAULT_ADMIN_EMAIL,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    status: "SUCCESS",
    metadata: { storeId: id },
  });

  return { success: true, store: updated };
}

export async function handleUpdateStoreStatus(
  id: string,
  status: StoreStatus,
  reason?: string,
): Promise<SuperAdminStoreOperationResult> {
  const index = serverManagedStores.findIndex((s) => s.id === id && !s.isArchived);
  if (index === -1) {
    return { success: false, error: `Store '${id}' not found.` };
  }

  const updated: SuperAdminManagedStore = {
    ...serverManagedStores[index],
    status,
    suspensionReason: status === "Suspended" ? reason || "Administrative suspension" : undefined,
    updatedAt: new Date().toISOString(),
  };

  serverManagedStores[index] = updated;

  serverAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: `STORE_STATUS_${status.toUpperCase()}`,
    actor: DEV_DEFAULT_ADMIN_EMAIL,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    status: "SUCCESS",
    metadata: { storeId: id, status, reason },
  });

  return { success: true, store: updated };
}

export async function handleDeleteStore(id: string): Promise<SuperAdminStoreOperationResult> {
  const index = serverManagedStores.findIndex((s) => s.id === id && !s.isArchived);
  if (index === -1) {
    return { success: false, error: `Store '${id}' not found.` };
  }

  serverManagedStores[index] = {
    ...serverManagedStores[index],
    isArchived: true,
    status: "Suspended",
    updatedAt: new Date().toISOString(),
  };

  serverAuditLogs.unshift({
    id: `log_${Date.now()}`,
    action: "STORE_ARCHIVED",
    actor: DEV_DEFAULT_ADMIN_EMAIL,
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    status: "SUCCESS",
    metadata: { storeId: id },
  });

  return { success: true };
}

// -----------------------------------------------------------------------------
// Super Admin Dashboard Data Handler (Synced with Store Repository)
// -----------------------------------------------------------------------------

export async function handleGetDashboardData(): Promise<{
  success: boolean;
  data?: SuperAdminDashboardData;
  error?: string;
  statusCode?: number;
}> {
  const session = getActiveSuperAdminSession();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized: Active Super Admin session required.",
      statusCode: 401,
    };
  }

  if (session.role !== SUPER_ADMIN_ROLE) {
    return {
      success: false,
      error: "Forbidden: Administrative role SUPER_ADMIN required.",
      statusCode: 403,
    };
  }

  // Derive live metrics from managed stores
  const activeStoresList = serverManagedStores.filter((s) => !s.isArchived);
  const totalStores = activeStoresList.length;
  const activeStores = activeStoresList.filter((s) => s.status === "Active").length;
  const pendingStores = activeStoresList.filter((s) => s.status === "Pending").length;
  const suspendedStores = activeStoresList.filter((s) => s.status === "Suspended").length;

  const pendingApprovals = activeStoresList
    .filter((s) => s.status === "Pending")
    .map((s) => ({
      id: s.id,
      storeName: s.name,
      category: s.category,
      ownerName: s.ownerName,
      ownerEmail: s.ownerEmail,
      submittedAt: s.createdAt,
    }));

  return {
    success: true,
    data: {
      metrics: {
        totalStores,
        activeStores,
        pendingStores,
        suspendedStores,
        grossMerchandiseVolumeINR: 48250000,
        platformCommissionINR: 4825000,
        activeMerchants: 486,
        systemHealth: "OPTIMAL",
        uptimePercentage: 99.98,
      },
      pendingApprovals,
      auditLogs: [...serverAuditLogs],
    },
  };
}
