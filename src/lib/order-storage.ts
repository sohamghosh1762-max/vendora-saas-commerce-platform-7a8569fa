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

export function getOrdersByCustomer(customerIdOrEmail: string): CustomerOrder[] {
  if (!customerIdOrEmail) return [];
  const list = getCustomerOrders();
  const search = customerIdOrEmail.trim().toLowerCase();
  return list.filter((order) => {
    if (order.customerId && order.customerId.toLowerCase() === search) return true;
    if (order.customer?.id && order.customer.id.toLowerCase() === search) return true;
    if (order.customer?.email && order.customer.email.toLowerCase() === search) return true;
    if (order.shippingAddress?.email && order.shippingAddress.email.toLowerCase() === search) return true;
    return false;
  });
}

export function updateOrderStatus(
  orderId: string,
  status: import("./order-types").OrderStatus,
): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const list = getCustomerOrders();
    const normalized = orderId.trim().toUpperCase();
    let updated = false;
    const nowIso = new Date().toISOString();
    const mapped = list.map((order) => {
      if (order.orderId.toUpperCase() === normalized) {
        updated = true;
        const currentTimestamps = order.statusTimestamps || {};
        return {
          ...order,
          orderStatus: status,
          statusTimestamps: {
            ...currentTimestamps,
            [status]: nowIso,
          },
        };
      }
      return order;
    });
    if (updated) {
      window.localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(mapped));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function seedDemoOrdersForCustomer(customer: {
  id: string;
  name: string;
  email: string;
  phone: string;
}): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const existingForCustomer = getOrdersByCustomer(customer.id);
  if (existingForCustomer.length > 0) return;

  const now = Date.now();
  const d1 = new Date(now - 7 * 86400000).toISOString();
  const d2 = new Date(now - 2 * 86400000).toISOString();
  const d3 = new Date(now - 4 * 3600000).toISOString();

  const demoOrders: CustomerOrder[] = [
    {
      orderId: "VD-DEMO-9903",
      customerId: customer.id,
      customer: {
        id: customer.id,
        fullName: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      shippingAddress: {
        fullName: customer.name,
        email: customer.email,
        phone: customer.phone,
        addressLine: "Flat 402, Lotus Grand Residency",
        apartment: "Near Indiranagar Metro",
        city: "Bengaluru",
        state: "Karnataka",
        pinCode: "560038",
        country: "India",
      },
      items: [
        {
          id: "ceramic-coffee-set",
          name: "Ceramic Coffee Pour-Over Set",
          storeId: "artisan-brews",
          storeName: "Artisan Brews",
          category: "home-living",
          price: 2499,
          originalPrice: 2999,
          qty: 1,
          image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
          selectedVariants: { Finish: "Matte Black" },
        },
      ],
      priceBreakdown: {
        subtotal: 2499,
        couponCode: "VENDORA10",
        couponDiscount: 250,
        deliveryFee: 0,
        total: 2249,
      },
      deliveryMethod: {
        id: "standard",
        name: "Standard Delivery",
        description: "Reliable doorstep delivery in 3–5 business days",
        estimatedDays: "3–5 Days",
        estimatedDate: formatEstimatedDate(3),
        fee: 0,
      },
      payment: {
        method: "upi",
        status: "CONFIRMED_DEMO",
        label: "UPI (Demo Selection)",
      },
      orderStatus: "Processing",
      statusTimestamps: {
        Placed: d3,
        Confirmed: d3,
        Processing: d3,
      },
      createdAt: d3,
      estimatedDeliveryDate: formatEstimatedDate(3),
    },
    {
      orderId: "VD-DEMO-9415",
      customerId: customer.id,
      customer: {
        id: customer.id,
        fullName: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      shippingAddress: {
        fullName: customer.name,
        email: customer.email,
        phone: customer.phone,
        addressLine: "Flat 402, Lotus Grand Residency",
        apartment: "Near Indiranagar Metro",
        city: "Bengaluru",
        state: "Karnataka",
        pinCode: "560038",
        country: "India",
      },
      items: [
        {
          id: "mechanical-keyboard-rgb",
          name: "RGB Mechanical Gaming Keyboard",
          storeId: "pixel-peripherals",
          storeName: "Pixel Peripherals",
          category: "electronics",
          price: 4999,
          originalPrice: 6499,
          qty: 1,
          image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
          selectedVariants: { Switch: "Brown Tactile" },
        },
      ],
      priceBreakdown: {
        subtotal: 4999,
        couponCode: null,
        couponDiscount: 0,
        deliveryFee: 149,
        total: 5148,
      },
      deliveryMethod: {
        id: "express",
        name: "Express Priority Delivery",
        description: "Guaranteed express dispatch in 1–2 business days",
        estimatedDays: "1–2 Days",
        estimatedDate: formatEstimatedDate(1),
        fee: 149,
      },
      payment: {
        method: "card",
        status: "CONFIRMED_DEMO",
        label: "Credit / Debit Card (Demo Selection)",
      },
      orderStatus: "Shipped",
      statusTimestamps: {
        Placed: d2,
        Confirmed: d2,
        Processing: d2,
        Shipped: d2,
      },
      createdAt: d2,
      estimatedDeliveryDate: formatEstimatedDate(1),
    },
    {
      orderId: "VD-DEMO-8821",
      customerId: customer.id,
      customer: {
        id: customer.id,
        fullName: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      shippingAddress: {
        fullName: customer.name,
        email: customer.email,
        phone: customer.phone,
        addressLine: "Tech Park, Building 4B",
        apartment: "Floor 3, Work Desk 12",
        city: "Bengaluru",
        state: "Karnataka",
        pinCode: "560103",
        country: "India",
      },
      items: [
        {
          id: "wireless-headphones",
          name: "Wireless Noise-Canceling Headphones",
          storeId: "soundcraft",
          storeName: "SoundCraft Audio",
          category: "electronics",
          price: 7999,
          originalPrice: 9999,
          qty: 1,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
          selectedVariants: { Color: "Midnight Black" },
        },
      ],
      priceBreakdown: {
        subtotal: 7999,
        couponCode: "VENDORA10",
        couponDiscount: 800,
        deliveryFee: 0,
        total: 7199,
      },
      deliveryMethod: {
        id: "standard",
        name: "Standard Delivery",
        description: "Reliable doorstep delivery in 3–5 business days",
        estimatedDays: "3–5 Days",
        estimatedDate: "Delivered",
        fee: 0,
      },
      payment: {
        method: "cod",
        status: "CONFIRMED_DEMO",
        label: "Cash on Delivery (Simulated)",
      },
      orderStatus: "Delivered",
      statusTimestamps: {
        Placed: d1,
        Confirmed: d1,
        Processing: d1,
        Shipped: d1,
        "Out for Delivery": d1,
        Delivered: d1,
      },
      createdAt: d1,
      estimatedDeliveryDate: "Delivered",
    },
  ];

  const existingAll = getCustomerOrders();
  const merged = [...demoOrders, ...existingAll];
  try {
    window.localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Ignore storage errors
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
