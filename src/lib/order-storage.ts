import type { CustomerOrder, CheckoutDraft, DeliveryMethod, DeliveryMethodId } from "./order-types";

export const CUSTOMER_ORDERS_STORAGE_KEY = "vendora_customer_orders_v1";
export const CHECKOUT_DRAFT_STORAGE_KEY = "vendora_checkout_draft_v1";

function formatEstimatedDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDeliveryMethods(): DeliveryMethod[] {
  return [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "Reliable doorstep delivery in 3–5 business days",
      estimatedDays: "3–5 Days",
      estimatedDate: formatEstimatedDate(4),
      fee: 0,
    },
    {
      id: "express",
      name: "Express Priority Delivery",
      description: "Guaranteed express dispatch in 1–2 business days",
      estimatedDays: "1–2 Days",
      estimatedDate: formatEstimatedDate(2),
      fee: 149,
    },
  ];
}

export function generateOrderId(): string {
  const timeHex = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VD-${timeHex}-${randomSuffix}`;
}

export function getCustomerOrders(): CustomerOrder[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(CUSTOMER_ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCustomerOrderById(orderId: string): CustomerOrder | undefined {
  if (!orderId) return undefined;
  const list = getCustomerOrders();
  const normalized = orderId.trim().toUpperCase();
  return list.find((o) => o.orderId.toUpperCase() === normalized);
}

export function saveCustomerOrder(order: CustomerOrder): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const existing = getCustomerOrders();
    // Prepend new order
    const updated = [order, ...existing.filter((o) => o.orderId !== order.orderId)];
    window.localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Ignore storage errors
  }
}

export function getCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutDraft;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
