import type {
  CustomerTier,
  OnboardingData,
  VendorCustomer,
  VendorConversation,
  VendorChatMessage,
  VendorReview,
  VendorReviewReply,
  VendorReviewStats,
  OrderStatus,
  VendorOrder,
  VendorSession,
  VendorStore,
  VendorUser,
} from "./vendor-types";
import {
  ensureSeeded,
  getActiveSession,
  getCustomStores,
  getStoredCustomerNotes,
  getStoredConversations,
  saveStoredConversations,
  getStoredReviews,
  saveStoredReviews,
  getStoredOrders,
  getStoredVendors,
  saveActiveSession,
  saveCustomStores,
  saveCustomStoresStrict,
  saveStoredCustomerNote,
  saveStoredOrders,
  saveVendors,
} from "./vendor-storage";

export { getActiveSession };
import { generateSalt, hashPassword, verifyPassword } from "./vendor-crypto";
import { getAllStores, stores as mockStores, type Store } from "@/data/stores";
import { products as initialProducts, type Product } from "@/data/products";
import { REFERENCE_VENDOR_PRODUCTS } from "./vendor-dashboard-data";

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
  window.localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(products));
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
    return {
      success: false,
      error: `The store slug '${slug}' is already taken. Please pick another.`,
    };
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

  if (storeId === "the-urban-nest") {
    const mock = mockStores.find((s) => s.id === "the-urban-nest");
    return {
      id: "the-urban-nest",
      slug: "the-urban-nest",
      name: "The Urban Nest",
      tagline: "Your Storefront",
      category: "home-living",
      rating: 4.9,
      reviews: 320,
      productCount: 48,
      tint: "bg-cat-home text-cat-home-fg",
      cover: mock?.cover,
      description:
        "Curated artisan home decor, ceramics, and lifestyle essentials for modern living.",
      ownerId: "vendor_rohan_urban_nest",
      ownerEmail: "rohan@theurbannest.com",
      phone: "+91 98200 12345",
      address: "42 Indiranagar 100ft Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      businessType: "Private Limited",
      returnPolicy: "14-Day Easy Returns",
      shippingMethod: "Vendora Logistics Express",
      processingTime: "Same Day Dispatch",
      supportEmail: "hello@theurbannest.com",
      status: "ACTIVE",
      createdAt: "2024-01-10T00:00:00.000Z",
    };
  }

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
  const existing = index !== -1 ? custom[index] : getVendorStore(storeId);
  if (existing) {
    const updated = { ...existing, ...updates, id: existing.id, slug: existing.slug };
    if (index !== -1) custom[index] = updated;
    else custom.unshift(updated);
    saveCustomStoresStrict(custom);
    // Update active session store if matching
    const currentSession = getActiveSession();
    if (currentSession && currentSession.store.id === storeId) {
      currentSession.store = updated;
      saveActiveSession(currentSession);
    }
    return updated;
  }
  return null;
}

/** Products for a store */
export function getVendorProducts(storeId: string): Product[] {
  const custom = getStoredCustomProducts();
  const storeCustom = custom.filter((p) => p.storeId === storeId);

  // If the store is the default reference store ('the-urban-nest') and no custom products key has been set in localStorage:
  if (storeId === "the-urban-nest") {
    const hasInitialized =
      typeof window !== "undefined" && window.localStorage.getItem(CUSTOM_PRODUCTS_KEY) !== null;
    if (!hasInitialized) {
      saveCustomProducts(REFERENCE_VENDOR_PRODUCTS);
      return [...REFERENCE_VENDOR_PRODUCTS];
    }
    return storeCustom;
  }

  const initial = initialProducts.filter((p) => p.storeId === storeId);
  return [...storeCustom, ...initial];
}

/** Add a product to a vendor store */
export function addVendorProduct(product: Omit<Product, "id">): Product {
  const custom = getStoredCustomProducts();
  if (
    product.storeId === "the-urban-nest" &&
    typeof window !== "undefined" &&
    window.localStorage.getItem(CUSTOM_PRODUCTS_KEY) === null
  ) {
    custom.push(...REFERENCE_VENDOR_PRODUCTS);
  }
  const newProduct: Product = {
    ...product,
    id: "prod_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    rating: product.rating ?? 5.0,
    reviews: product.reviews ?? 0,
    stock: product.stock !== undefined ? product.stock : 25,
    status: product.status || "active",
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

/** Update an existing product */
export function updateVendorProduct(productId: string, updates: Partial<Product>): Product | null {
  const custom = getStoredCustomProducts();
  const index = custom.findIndex((p) => p.id === productId);
  const existing = custom[index];
  if (index !== -1 && existing) {
    const updated: Product = { ...existing, ...updates };
    custom[index] = updated;
    saveCustomProducts(custom);
    return updated;
  }

  const inInitial = [...initialProducts, ...REFERENCE_VENDOR_PRODUCTS].find(
    (p) => p.id === productId,
  );
  if (inInitial) {
    const allForStore = getVendorProducts(inInitial.storeId);
    const storeUpdated = allForStore.map((p) => (p.id === productId ? { ...p, ...updates } : p));
    const otherStores = custom.filter((p) => p.storeId !== inInitial.storeId);
    saveCustomProducts([...storeUpdated, ...otherStores]);
    return storeUpdated.find((p) => p.id === productId) || null;
  }
  return null;
}

/** Delete a product */
export function deleteVendorProduct(productId: string): boolean {
  const custom = getStoredCustomProducts();
  const exists = custom.some((p) => p.id === productId);
  if (exists) {
    const filtered = custom.filter((p) => p.id !== productId);
    saveCustomProducts(filtered);
    return true;
  }

  const inInitial = [...initialProducts, ...REFERENCE_VENDOR_PRODUCTS].find(
    (p) => p.id === productId,
  );
  if (inInitial) {
    const allForStore = getVendorProducts(inInitial.storeId).filter((p) => p.id !== productId);
    const otherStores = custom.filter((p) => p.storeId !== inInitial.storeId);
    saveCustomProducts([...allForStore, ...otherStores]);
    return true;
  }
  return false;
}

/** Get orders for a store */
export function getVendorOrders(storeId: string): VendorOrder[] {
  return getStoredOrders(storeId);
}

/** Get a single order by ID */
export function getVendorOrderById(orderId: string, storeId?: string): VendorOrder | null {
  const orders = getStoredOrders(storeId);
  const normalized = orderId.toLowerCase();
  return (
    orders.find(
      (o) =>
        o.id.toLowerCase() === normalized ||
        (o.orderNumber && o.orderNumber.toLowerCase() === normalized),
    ) || null
  );
}

/** Update order status with validation */
export function updateVendorOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  storeId?: string,
): { success: boolean; order?: VendorOrder; error?: string } {
  const allOrders = getStoredOrders();
  const normalized = orderId.toLowerCase();
  const index = allOrders.findIndex(
    (o) =>
      o.id.toLowerCase() === normalized ||
      (o.orderNumber && o.orderNumber.toLowerCase() === normalized),
  );

  if (index === -1) {
    return { success: false, error: "Order not found." };
  }

  const existing = allOrders[index];
  if (!existing) {
    return { success: false, error: "Order not found." };
  }

  if (storeId && existing.storeId !== storeId) {
    return { success: false, error: "Unauthorized: Order belongs to another store." };
  }

  const validStatuses: OrderStatus[] = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, error: "Invalid order status." };
  }

  if (existing.status === newStatus) {
    return { success: false, error: `Order is already marked as ${newStatus}.` };
  }

  if (existing.status === "Delivered") {
    return { success: false, error: "Delivered orders cannot have their status modified." };
  }

  if (existing.status === "Cancelled") {
    return { success: false, error: "Cancelled orders cannot be modified." };
  }

  // Prevent reverting Shipped orders to earlier stages
  if (existing.status === "Shipped" && (newStatus === "Pending" || newStatus === "Processing")) {
    return { success: false, error: "Shipped orders cannot be reverted to earlier stages." };
  }

  // Prevent reverting Processing orders to Pending
  if (existing.status === "Processing" && newStatus === "Pending") {
    return { success: false, error: "Processing orders cannot be reverted to Pending." };
  }

  const updated: VendorOrder = {
    ...existing,
    status: newStatus,
  };

  allOrders[index] = updated;
  saveStoredOrders(allOrders);

  return { success: true, order: updated };
}

/** Logout current vendor session */
export function logoutVendor(): void {
  saveActiveSession(null);
}

/** Get aggregated customer directory scoped to a vendor store */
export function getVendorCustomers(storeId: string): VendorCustomer[] {
  const orders = getStoredOrders(storeId);
  const notes = getStoredCustomerNotes(storeId);

  const map = new Map<
    string,
    {
      name: string;
      email: string;
      phone?: string;
      shippingAddress?: string;
      orders: VendorOrder[];
    }
  >();

  for (const order of orders) {
    const emailKey = (order.customerEmail || "").trim().toLowerCase();
    if (!emailKey) continue;

    const existing = map.get(emailKey);
    if (!existing) {
      map.set(emailKey, {
        name: order.customerName || "Customer",
        email: order.customerEmail,
        phone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        orders: [order],
      });
    } else {
      existing.orders.push(order);
      if (!existing.phone && order.customerPhone) existing.phone = order.customerPhone;
      if (!existing.shippingAddress && order.shippingAddress) {
        existing.shippingAddress = order.shippingAddress;
      }
      if (order.customerName && existing.name === "Customer") {
        existing.name = order.customerName;
      }
    }
  }

  const customers: VendorCustomer[] = [];
  for (const [emailKey, data] of map.entries()) {
    // Sort customer's orders newest first
    const sortedOrders = [...data.orders].sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return timeB - timeA;
    });

    const totalOrders = sortedOrders.length;
    const totalSpent = sortedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
    const lastOrderDate = sortedOrders[0]?.date || "Unknown";
    const firstOrderDate = sortedOrders[sortedOrders.length - 1]?.date || lastOrderDate;

    let tier: CustomerTier = "New";
    if (totalOrders > 1 && totalSpent >= 2500) {
      tier = "VIP";
    } else if (totalOrders > 1) {
      tier = "Repeat";
    } else if (totalSpent >= 2500) {
      tier = "VIP";
    } else {
      tier = "New";
    }

    customers.push({
      id: `cust-${emailKey.replace(/[^a-z0-9]/g, "-")}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      shippingAddress: data.shippingAddress,
      totalOrders,
      totalSpent,
      averageOrderValue,
      firstOrderDate,
      lastOrderDate,
      tier,
      orders: sortedOrders,
      notes: notes[emailKey] || undefined,
    });
  }

  return customers.sort((a, b) => b.totalSpent - a.totalSpent);
}

/** Get a single customer by email scoped to a vendor store */
export function getVendorCustomerByEmail(
  email: string,
  storeId: string,
): VendorCustomer | null {
  const customers = getVendorCustomers(storeId);
  const normalized = email.trim().toLowerCase();
  return customers.find((c) => c.email.toLowerCase() === normalized) || null;
}

/** Save a private note on a customer for a store */
export function saveVendorCustomerNote(
  storeId: string,
  customerEmail: string,
  note: string,
): { success: boolean; note: string } {
  saveStoredCustomerNote(storeId, customerEmail, note);
  return { success: true, note };
}

/** Get customer conversations scoped to a vendor store */
export function getVendorConversations(storeId: string): VendorConversation[] {
  const all = getStoredConversations(storeId);
  return [...all].sort((a, b) => {
    const timeA = new Date(a.lastMessageTimestamp).getTime() || 0;
    const timeB = new Date(b.lastMessageTimestamp).getTime() || 0;
    return timeB - timeA;
  });
}

/** Get a single conversation by ID */
export function getVendorConversationById(
  conversationId: string,
  storeId?: string,
): VendorConversation | null {
  const conversations = getStoredConversations(storeId);
  const normalized = conversationId.toLowerCase();
  return (
    conversations.find((c) => c.id.toLowerCase() === normalized) || null
  );
}

/** Send a message in a conversation as vendor */
export function sendVendorMessage(
  conversationId: string,
  text: string,
  storeId?: string,
): {
  success: boolean;
  conversation?: VendorConversation;
  message?: VendorChatMessage;
  error?: string;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { success: false, error: "Message cannot be empty." };
  }

  const all = getStoredConversations();
  const normalized = conversationId.toLowerCase();
  const index = all.findIndex((c) => c.id.toLowerCase() === normalized);

  if (index === -1) {
    return { success: false, error: "Conversation not found." };
  }

  const existing = all[index];
  if (!existing) {
    return { success: false, error: "Conversation not found." };
  }

  if (storeId && existing.storeId !== storeId) {
    return {
      success: false,
      error: "Unauthorized: Conversation belongs to another store.",
    };
  }

  const newMessage: VendorChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    senderRole: "vendor",
    senderName: "Store Support",
    text: trimmed,
    timestamp: new Date().toISOString(),
    isRead: true,
  };

  const updated: VendorConversation = {
    ...existing,
    messages: [...existing.messages, newMessage],
    lastMessage: trimmed,
    lastMessageTimestamp: newMessage.timestamp,
  };

  all[index] = updated;
  saveStoredConversations(all);

  return { success: true, conversation: updated, message: newMessage };
}

/** Mark all messages in a conversation as read */
export function markConversationAsRead(
  conversationId: string,
  storeId?: string,
): { success: boolean; conversation?: VendorConversation } {
  const all = getStoredConversations();
  const normalized = conversationId.toLowerCase();
  const index = all.findIndex((c) => c.id.toLowerCase() === normalized);

  if (index === -1) {
    return { success: false };
  }

  const existing = all[index];
  if (!existing) {
    return { success: false };
  }

  if (storeId && existing.storeId !== storeId) {
    return { success: false };
  }

  const updatedMessages = existing.messages.map((m) => ({
    ...m,
    isRead: true,
  }));

  const updated: VendorConversation = {
    ...existing,
    unreadCount: 0,
    messages: updatedMessages,
  };

  all[index] = updated;
  saveStoredConversations(all);

  return { success: true, conversation: updated };
}

/** Get total unread messages count for a store */
export function getVendorUnreadMessagesCount(storeId: string): number {
  const conversations = getVendorConversations(storeId);
  return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
}

/** Get customer reviews scoped to a vendor store */
export function getVendorReviews(storeId: string): VendorReview[] {
  const all = getStoredReviews(storeId);
  return [...all].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeB - timeA;
  });
}

/** Get a single review by ID */
export function getVendorReviewById(
  reviewId: string,
  storeId?: string,
): VendorReview | null {
  const reviews = getStoredReviews(storeId);
  const normalized = reviewId.toLowerCase();
  return reviews.find((r) => r.id.toLowerCase() === normalized) || null;
}

/** Compute review statistics and rating distribution */
export function getVendorReviewStats(storeId: string): VendorReviewStats {
  const reviews = getVendorReviews(storeId);
  const total = reviews.length;

  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  let ratingSum = 0;
  let repliedCount = 0;

  for (const r of reviews) {
    const roundedRating = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[roundedRating] = (distribution[roundedRating] || 0) + 1;
    ratingSum += r.rating;
    if (r.vendorReply && r.vendorReply.replyText.trim().length > 0) {
      repliedCount += 1;
    }
  }

  const averageRating = total > 0 ? Number((ratingSum / total).toFixed(1)) : 0;

  const distributionPercentages = {
    5: total > 0 ? Math.round((distribution[5] / total) * 100) : 0,
    4: total > 0 ? Math.round((distribution[4] / total) * 100) : 0,
    3: total > 0 ? Math.round((distribution[3] / total) * 100) : 0,
    2: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
    1: total > 0 ? Math.round((distribution[1] / total) * 100) : 0,
  };

  return {
    averageRating,
    totalReviews: total,
    distribution,
    distributionPercentages,
    repliedCount,
    unrepliedCount: total - repliedCount,
  };
}

/** Reply to a customer review as a vendor */
export function replyToVendorReview(
  reviewId: string,
  replyText: string,
  storeId?: string,
  repliedBy?: string,
): {
  success: boolean;
  review?: VendorReview;
  error?: string;
} {
  const trimmed = replyText.trim();
  if (!trimmed) {
    return { success: false, error: "Reply text cannot be empty." };
  }

  const all = getStoredReviews();
  const normalized = reviewId.toLowerCase();
  const index = all.findIndex((r) => r.id.toLowerCase() === normalized);

  if (index === -1) {
    return { success: false, error: "Review not found." };
  }

  const existing = all[index];
  if (!existing) {
    return { success: false, error: "Review not found." };
  }

  if (storeId && existing.storeId !== storeId) {
    return {
      success: false,
      error: "Unauthorized: Review belongs to another store.",
    };
  }

  const updatedReply: VendorReviewReply = {
    replyText: trimmed,
    repliedAt: new Date().toISOString(),
    repliedBy: repliedBy || "Store Owner",
  };

  const updatedReview: VendorReview = {
    ...existing,
    vendorReply: updatedReply,
  };

  all[index] = updatedReview;
  saveStoredReviews(all);

  return { success: true, review: updatedReview };
}
