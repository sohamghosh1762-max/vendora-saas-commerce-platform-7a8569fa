import type {
  OnboardingData,
  VendorOrder,
  VendorSession,
  VendorStore,
  VendorUser,
} from "./vendor-types";
import {
  ensureSeeded,
  getActiveSession,
  getCustomStores,
  getStoredOrders,
  getStoredVendors,
  saveActiveSession,
  saveCustomStores,
  saveStoredOrders,
  saveVendors,
} from "./vendor-storage";

export { getActiveSession };
import { generateSalt, hashPassword, verifyPassword } from "./vendor-crypto";
import { getAllStores, stores as mockStores, type Store } from "@/data/stores";
import { products as initialProducts, type Product } from "@/data/products";

const CUSTOM_PRODUCTS_KEY = "vendora_custom_products_v1";

function getStoredCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch {
    // Return empty
  }
  return [];
}

function saveCustomProducts(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(products));
  } catch {
    // Storage unavailable
  }
}

/** Check if email is already registered */
export async function checkEmailAvailability(email: string): Promise<boolean> {
  await ensureSeeded();
  const cleanEmail = email.trim().toLowerCase();
  const vendors = getStoredVendors();
  const exists = vendors.some((v) => v.email.toLowerCase() === cleanEmail);
  return !exists;
}

/** Check if a store slug is available */
export async function checkSlugAvailability(slug: string): Promise<boolean> {
  await ensureSeeded();
  const cleanSlug = slug.trim().toLowerCase();
  const all = getAllStores();
  const exists = all.some((s) => s.id.toLowerCase() === cleanSlug);
  return !exists;
}

/** Utility to generate URL-safe slug */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Category tint mapping for newly created stores */
const categoryTints: Record<string, string> = {
  fashion: "bg-cat-fashion text-cat-fashion-fg",
  electronics: "bg-cat-electronics text-cat-electronics-fg",
  "home-living": "bg-cat-home text-cat-home-fg",
  beauty: "bg-cat-beauty text-cat-beauty-fg",
  sports: "bg-cat-sports text-cat-sports-fg",
  books: "bg-cat-books text-cat-books-fg",
  toys: "bg-cat-toys text-cat-toys-fg",
  food: "bg-cat-food text-cat-food-fg",
  health: "bg-cat-health text-cat-health-fg",
  automotive: "bg-cat-auto text-cat-auto-fg",
};

/** Register a new Vendor and create their store */
export async function registerVendor(
  data: OnboardingData,
): Promise<{ success: boolean; session?: VendorSession; error?: string }> {
  await ensureSeeded();

  // Validate step 1 fields
  if (!data.fullName.trim()) return { success: false, error: "Full name is required." };
  const cleanEmail = data.email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: "A valid email address is required." };
  }
  if (!data.phone.trim()) return { success: false, error: "Phone number is required." };
  if (!data.password || data.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }
  if (data.password !== data.confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }
  if (!data.agreeTerms) {
    return { success: false, error: "You must accept the Terms and Privacy Policy." };
  }

  // Check email uniqueness
  const emailAvailable = await checkEmailAvailability(cleanEmail);
  if (!emailAvailable) {
    return { success: false, error: "An account with this email already exists. Please sign in." };
  }

  // Validate step 2 fields
  if (!data.storeName.trim()) return { success: false, error: "Store name is required." };
  const slug = generateSlug(data.storeSlug || data.storeName);
  if (!slug) return { success: false, error: "A valid store slug is required." };
  const slugAvailable = await checkSlugAvailability(slug);
  if (!slugAvailable) {
    return { success: false, error: `The store slug '${slug}' is already taken. Please pick another.` };
  }
  if (!data.category) return { success: false, error: "Please select a store category." };
  if (!data.description.trim()) return { success: false, error: "Store description is required." };

  // Validate step 3 fields
  if (!data.businessType) return { success: false, error: "Please select a business type." };
  if (!data.returnPolicy) return { success: false, error: "Please specify a return policy." };
  if (!data.shippingMethod) return { success: false, error: "Please select a fulfilment method." };

  // Secure Password Hashing
  const salt = generateSalt();
  const passwordHash = await hashPassword(data.password, salt);

  const vendorId = `vendor_${Date.now()}`;
  const now = new Date().toISOString();

  // Create Vendor User
  const vendor: VendorUser = {
    id: vendorId,
    fullName: data.fullName.trim(),
    email: cleanEmail,
    phone: data.phone.trim(),
    passwordHash,
    salt,
    role: "vendor",
    createdAt: now,
    storeId: slug,
  };

  // Create Vendor Store
  const store: VendorStore = {
    id: slug,
    slug,
    name: data.storeName.trim(),
    tagline: `${data.category.toUpperCase()} • Independent Store`,
    category: data.category,
    description: data.description.trim(),
    logoUrl: data.logoDataUrl,
    tint: categoryTints[data.category] ?? "bg-cat-fashion text-cat-fashion-fg",
    ownerId: vendorId,
    ownerEmail: cleanEmail,
    phone: data.storePhone.trim() || data.phone.trim(),
    address: data.address.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    postalCode: data.postalCode.trim(),
    businessType: data.businessType,
    returnPolicy: data.returnPolicy,
    shippingMethod: data.shippingMethod,
    processingTime: data.processingTime || "1-2 Business Days",
    supportEmail: data.supportEmail.trim() || cleanEmail,
    taxId: data.taxId?.trim(),
    status: "ACTIVE",
    rating: 5.0,
    reviews: 0,
    productCount: 0,
    createdAt: now,
  };

  // Persist Vendor & Store
  const vendors = getStoredVendors();
  vendors.push(vendor);
  saveVendors(vendors);

  const customStores = getCustomStores();
  customStores.unshift(store);
  saveCustomStores(customStores);

  // Create Active Session
  const session: VendorSession = {
    token: `vtok_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    vendor,
    store,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  saveActiveSession(session);

  return { success: true, session };
}

/** Login an existing Vendor */
export async function loginVendor(
  email: string,
  pass: string,
): Promise<{ success: boolean; session?: VendorSession; error?: string }> {
  await ensureSeeded();
  const cleanEmail = email.trim().toLowerCase();
  const vendors = getStoredVendors();
  const vendor = vendors.find((v) => v.email.toLowerCase() === cleanEmail);

  if (!vendor) {
    return { success: false, error: "No vendor account found with this email." };
  }

  const matches = await verifyPassword(pass, vendor.passwordHash, vendor.salt);
  if (!matches) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  // Retrieve store
  const store = getVendorStore(vendor.storeId);
  if (!store) {
    return { success: false, error: "Associated store not found for this vendor account." };
  }

  const session: VendorSession = {
    token: `vtok_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    vendor,
    store,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  saveActiveSession(session);

  return { success: true, session };
}

/** Retrieve current vendor store */
export function getVendorStore(storeId: string): VendorStore | null {
  const custom = getCustomStores();
  const foundCustom = custom.find((s) => s.id === storeId);
  if (foundCustom) return foundCustom;

  // If matches an initial mock store (e.g. stylenest for Neha)
  const mock = mockStores.find((s) => s.id === storeId);
  if (mock) {
    return {
      ...mock,
      slug: mock.id,
      ownerId: "vendor_stylenest",
      ownerEmail: "neha@stylenest.in",
      phone: "+91 98765 43210",
      address: "124 Commercial St",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      businessType: "Sole Proprietorship",
      returnPolicy: "7-Day Easy Returns",
      shippingMethod: "Vendora Logistics",
      processingTime: "1-2 Business Days",
      supportEmail: "support@stylenest.in",
      status: "ACTIVE",
      createdAt: "2026-01-15T00:00:00.000Z",
    };
  }
  return null;
}

/** Update store information */
export async function updateVendorStore(
  storeId: string,
  updates: Partial<VendorStore>,
): Promise<VendorStore | null> {
  const custom = getCustomStores();
  const index = custom.findIndex((s) => s.id === storeId);
  if (index !== -1) {
    custom[index] = { ...custom[index], ...updates };
    saveCustomStores(custom);
    // Update active session store if matching
    const currentSession = getActiveSession();
    if (currentSession && currentSession.store.id === storeId) {
      currentSession.store = custom[index];
      saveActiveSession(currentSession);
    }
    return custom[index];
  }
  return null;
}

/** Products for a store */
export function getVendorProducts(storeId: string): Product[] {
  const custom = getStoredCustomProducts().filter((p) => p.storeId === storeId);
  const initial = initialProducts.filter((p) => p.storeId === storeId);
  return [...custom, ...initial];
}

/** Add a product to a vendor store */
export function addVendorProduct(product: Omit<Product, "id">): Product {
  const custom = getStoredCustomProducts();
  const newProduct: Product = {
    ...product,
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };
  custom.unshift(newProduct);
  saveCustomProducts(custom);

  // Update store productCount
  const customStores = getCustomStores();
  const store = customStores.find((s) => s.id === product.storeId);
  if (store) {
    store.productCount = (store.productCount || 0) + 1;
    saveCustomStores(customStores);
  }

  return newProduct;
}

/** Delete a product */
export function deleteVendorProduct(productId: string): boolean {
  const custom = getStoredCustomProducts();
  const filtered = custom.filter((p) => p.id !== productId);
  if (filtered.length !== custom.length) {
    saveCustomProducts(filtered);
    return true;
  }
  return false;
}

/** Get orders for a store */
export function getVendorOrders(storeId: string): VendorOrder[] {
  return getStoredOrders(storeId);
}

/** Logout current vendor session */
export function logoutVendor(): void {
  saveActiveSession(null);
}
