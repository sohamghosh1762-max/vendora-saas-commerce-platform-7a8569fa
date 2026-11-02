import type { CustomerAddress, CustomerUser, CustomerSession } from "./customer-types";

export const CUSTOMER_ACCOUNTS_STORAGE_KEY = "vendora_customer_accounts_v1";
export const CUSTOMER_SESSION_STORAGE_KEY = "vendora_customer_session_v1";

/**
 * Generate a random salt for password hashing
 */
export function generateSalt(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * SHA-256 password hashing via Web Crypto API with synchronous fallback
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${password}:${salt}`);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      // Fall through to basic hashing
    }
  }

  // Fallback string hash for testing / non-crypto environments
  let hash = 0;
  const str = `${password}:${salt}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback_hash_${Math.abs(hash).toString(16)}`;
}

export function generateCustomerId(): string {
  return `cust_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}

export function generateAddressId(): string {
  return `addr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}

export const INITIAL_DEMO_ADDRESS: CustomerAddress = {
  id: "addr_aarav_default",
  fullName: "Aarav Sharma",
  phone: "9876543210",
  addressLine: "Flat 402, Sunshine Heights, MG Road",
  apartment: "Near Marine Metro Station",
  city: "Mumbai",
  state: "Maharashtra",
  pinCode: "400001",
  country: "India",
  label: "Home",
  isDefault: true,
};

export const INITIAL_DEMO_CUSTOMER: CustomerUser = {
  id: "cust_aarav_sharma_001",
  name: "Aarav Sharma",
  fullName: "Aarav Sharma",
  email: "aarav.sharma@example.com",
  phone: "9876543210",
  passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // Initial pre-computed demo hash
  salt: "vendora_demo_salt_2026",
  createdAt: "2026-01-10T10:00:00.000Z",
  addresses: [INITIAL_DEMO_ADDRESS],
};

/**
 * Retrieve all registered customer accounts from localStorage safely
 */
export function getCustomerAccounts(): CustomerUser[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [INITIAL_DEMO_CUSTOMER];
  }
  try {
    const raw = window.localStorage.getItem(CUSTOMER_ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial demo customer
      saveCustomerAccounts([INITIAL_DEMO_CUSTOMER]);
      return [INITIAL_DEMO_CUSTOMER];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((acc: CustomerUser) => ({
        ...acc,
        name: acc.fullName || acc.name,
        fullName: acc.fullName || acc.name,
      }));
    }
    return [INITIAL_DEMO_CUSTOMER];
  } catch {
    return [INITIAL_DEMO_CUSTOMER];
  }
}

/**
 * Save customer accounts array to localStorage safely
 */
export function saveCustomerAccounts(accounts: CustomerUser[]): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const normalized = accounts.map((acc) => ({
      ...acc,
      name: acc.fullName || acc.name,
      fullName: acc.fullName || acc.name,
    }));
    window.localStorage.setItem(CUSTOMER_ACCOUNTS_STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

/**
 * Find customer by email (case-insensitive)
 */
export function findCustomerByEmail(email: string): CustomerUser | undefined {
  if (!email) return undefined;
  const accounts = getCustomerAccounts();
  const normalized = email.trim().toLowerCase();
  return accounts.find((acc) => acc.email.toLowerCase() === normalized);
}

/** Alias for finding customer by email */
export const getCustomerByEmail = findCustomerByEmail;

/**
 * Retrieve current customer session from localStorage safely
 */
export function getCustomerSession(): CustomerSession | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    return {
      customerId: parsed.customerId || parsed.user?.id || "cust_demo",
      customerEmail: parsed.customerEmail || parsed.user?.email || "",
      createdAt: parsed.createdAt || parsed.loginAt || new Date().toISOString(),
      user: parsed.user,
      token: parsed.token,
      loginAt: parsed.loginAt,
    };
  } catch {
    return null;
  }
}

/** Alias for getting current customer session */
export const getCurrentCustomerSession = getCustomerSession;

/**
 * Save current customer session to localStorage safely
 */
export function saveCustomerSession(session: CustomerSession | Partial<CustomerSession>): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const normalizedSession: CustomerSession = {
      customerId: session.customerId || session.user?.id || "cust_demo",
      customerEmail: session.customerEmail || session.user?.email || "",
      createdAt: session.createdAt || session.loginAt || new Date().toISOString(),
      user: session.user || undefined,
      token: session.token,
      loginAt: session.loginAt,
    };
    window.localStorage.setItem(CUSTOMER_SESSION_STORAGE_KEY, JSON.stringify(normalizedSession));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear customer session from localStorage (logout)
 */
export function clearCustomerSession(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
