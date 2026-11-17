import type {
  VendorUser,
  VendorStore,
  VendorOrder,
  VendorSession,
  VendorConversation,
  VendorChatMessage,
  VendorReview,
  VendorPayout,
  VendorIntegration,
  VendorCoupon,
} from "./vendor-types";
import { stores as initialStores, type Store } from "@/data/stores";
import { hashPassword } from "./vendor-crypto";

const VENDORS_KEY = "vendora_vendors_v1";
const STORES_KEY = "vendora_custom_stores_v1";
const ORDERS_KEY = "vendora_orders_v1";
const SESSION_KEY = "vendora_session_v1";
const CUSTOMER_NOTES_KEY = "vendora_vendor_customer_notes_v1";
const MESSAGES_KEY = "vendora_vendor_conversations_v1";
const REVIEWS_KEY = "vendora_vendor_reviews_v1";
const PAYOUTS_KEY = "vendora_vendor_payouts_v1";
const INTEGRATIONS_KEY = "vendora_vendor_integrations_v1";
const COUPONS_KEY = "vendora_vendor_coupons_v1";

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
    id: "ord-1018",
    orderNumber: "#1018",
    storeId: "the-urban-nest",
    customerName: "Priya Sharma",
    customerEmail: "priya.sharma@example.com",
    customerPhone: "+91 98450 12345",
    shippingAddress: "12 Palm Grove Road, Koramangala 4th Block, Bengaluru - 560034",
    items: [{ productName: "Ceramic Coffee Mug", qty: 2, price: 899 }],
    total: 1798,
    status: "Delivered",
    date: "Oct 12, 2024",
    paymentMethod: "UPI (Prepaid)",
    trackingNumber: "VND-98311-IN",
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

export const initialDemoConversations: VendorConversation[] = [
  {
    id: "conv-urban-001",
    storeId: "the-urban-nest",
    customerName: "Priya Sharma",
    customerEmail: "priya.sharma@example.com",
    customerPhone: "+91 98450 12345",
    unreadCount: 0,
    lastMessage: "Thank you so much! Looking forward to receiving my package.",
    lastMessageTimestamp: "2026-11-13T10:15:00.000Z",
    createdAt: "2026-11-12T14:20:00.000Z",
    orderNumber: "#1024",
    messages: [
      {
        id: "msg-001-1",
        senderRole: "customer",
        senderName: "Priya Sharma",
        text: "Hi! Can you tell me if the Ceramic Mug is microwave safe?",
        timestamp: "2026-11-12T14:20:00.000Z",
        isRead: true,
      },
      {
        id: "msg-001-2",
        senderRole: "vendor",
        senderName: "The Urban Nest Support",
        text: "Hello Priya! Yes, our handcrafted ceramic mugs are 100% microwave and dishwasher safe.",
        timestamp: "2026-11-12T14:25:00.000Z",
        isRead: true,
      },
      {
        id: "msg-001-3",
        senderRole: "customer",
        senderName: "Priya Sharma",
        text: "Thank you so much! Looking forward to receiving my package.",
        timestamp: "2026-11-13T10:15:00.000Z",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-urban-002",
    storeId: "the-urban-nest",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram.m@example.com",
    customerPhone: "+91 98765 11223",
    unreadCount: 1,
    lastMessage: "Hi, could you please confirm when order #1025 will be dispatched?",
    lastMessageTimestamp: "2026-11-13T11:45:00.000Z",
    createdAt: "2026-11-13T11:45:00.000Z",
    orderNumber: "#1025",
    messages: [
      {
        id: "msg-002-1",
        senderRole: "customer",
        senderName: "Vikram Malhotra",
        text: "Hi, could you please confirm when order #1025 will be dispatched?",
        timestamp: "2026-11-13T11:45:00.000Z",
        isRead: false,
      },
    ],
  },
  {
    id: "conv-urban-003",
    storeId: "the-urban-nest",
    customerName: "Sneha Gupta",
    customerEmail: "sneha.gupta@example.com",
    customerPhone: "+91 98210 98765",
    unreadCount: 0,
    lastMessage: "Thanks for checking! I will place the order once restocked.",
    lastMessageTimestamp: "2026-11-12T16:50:00.000Z",
    createdAt: "2026-11-12T16:30:00.000Z",
    orderNumber: "#1022",
    messages: [
      {
        id: "msg-003-1",
        senderRole: "customer",
        senderName: "Sneha Gupta",
        text: "Do you have the leather handbag in a deep chestnut brown color?",
        timestamp: "2026-11-12T16:30:00.000Z",
        isRead: true,
      },
      {
        id: "msg-003-2",
        senderRole: "vendor",
        senderName: "The Urban Nest Support",
        text: "Hi Sneha, chestnut brown is currently undergoing restocking and will be live early next week!",
        timestamp: "2026-11-12T16:40:00.000Z",
        isRead: true,
      },
      {
        id: "msg-003-3",
        senderRole: "customer",
        senderName: "Sneha Gupta",
        text: "Thanks for checking! I will place the order once restocked.",
        timestamp: "2026-11-12T16:50:00.000Z",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-urban-004",
    storeId: "the-urban-nest",
    customerName: "Arjun Patel",
    customerEmail: "arjun.patel@example.com",
    customerPhone: "+91 97123 45678",
    unreadCount: 1,
    lastMessage: "Received order #1023 in pristine condition! Outstanding quality.",
    lastMessageTimestamp: "2026-11-13T12:05:00.000Z",
    createdAt: "2026-11-13T12:05:00.000Z",
    orderNumber: "#1023",
    messages: [
      {
        id: "msg-004-1",
        senderRole: "customer",
        senderName: "Arjun Patel",
        text: "Received order #1023 in pristine condition! Outstanding quality.",
        timestamp: "2026-11-13T12:05:00.000Z",
        isRead: false,
      },
    ],
  },
  {
    id: "conv-style-001",
    storeId: "stylenest",
    customerName: "Priya Patel",
    customerEmail: "priya@example.com",
    customerPhone: "+91 98765 43210",
    unreadCount: 1,
    lastMessage: "Hello, do you offer customized gift packaging for the denim jacket?",
    lastMessageTimestamp: "2026-11-13T09:30:00.000Z",
    createdAt: "2026-11-13T09:30:00.000Z",
    orderNumber: "#1024",
    messages: [
      {
        id: "msg-sn-001",
        senderRole: "customer",
        senderName: "Priya Patel",
        text: "Hello, do you offer customized gift packaging for the denim jacket?",
        timestamp: "2026-11-13T09:30:00.000Z",
        isRead: false,
      },
    ],
  },
];

export const initialDemoReviews: VendorReview[] = [
  {
    id: "rev-urban-001",
    storeId: "the-urban-nest",
    productId: "prod_skincare_01",
    productName: "Minimalist Skincare Set",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram.m@example.com",
    rating: 5,
    comment:
      "The minimalist skincare set exceeded all my expectations. The packaging was eco-friendly and the texture is so lightweight. Will definitely be a regular customer!",
    date: "2024-10-25",
    verifiedPurchase: true,
    vendorReply: {
      replyText:
        "Thank you Vikram! We are delighted to hear you love the eco-friendly packaging and lightweight formula. - The Urban Nest Support",
      repliedAt: "2024-10-26T10:30:00.000Z",
      repliedBy: "The Urban Nest Support",
    },
  },
  {
    id: "rev-urban-002",
    storeId: "the-urban-nest",
    productId: "prod_ceramic_01",
    productName: "Handcrafted Ceramic Mug",
    customerName: "Priya Sharma",
    customerEmail: "priya.sharma@example.com",
    rating: 5,
    comment:
      "Incredible craftsmanship! The glaze on this mug is gorgeous and feels great in hand for my morning brew.",
    date: "2024-10-22",
    verifiedPurchase: true,
  },
  {
    id: "rev-urban-003",
    storeId: "the-urban-nest",
    productId: "prod_handbag_01",
    productName: "Leather Handbag",
    customerName: "Arjun Patel",
    customerEmail: "arjun.patel@example.com",
    rating: 4,
    comment:
      "Great stitching and premium leather quality. The inner zipper pocket could be a tiny bit larger, but overall very pleased.",
    date: "2024-10-18",
    verifiedPurchase: true,
  },
  {
    id: "rev-urban-004",
    storeId: "the-urban-nest",
    productId: "prod_shoes_01",
    productName: "Running Shoes",
    customerName: "Sneha Gupta",
    customerEmail: "sneha.gupta@example.com",
    rating: 5,
    comment:
      "Very comfortable for daily runs, breathable mesh, and the color is exactly as pictured. Super fast shipping too!",
    date: "2024-10-14",
    verifiedPurchase: true,
  },
  {
    id: "rev-urban-005",
    storeId: "the-urban-nest",
    productId: "prod_ceramic_01",
    productName: "Handcrafted Ceramic Mug",
    customerName: "Ananya Iyer",
    customerEmail: "ananya.iyer@example.com",
    rating: 4,
    comment:
      "Bought two for our new apartment. Beautiful earthy tone. One minor smudge on the handle, but very charming handmade quality.",
    date: "2024-10-10",
    verifiedPurchase: true,
  },
  {
    id: "rev-urban-006",
    storeId: "the-urban-nest",
    productId: "prod_skincare_01",
    productName: "Minimalist Skincare Set",
    customerName: "Kabir Mehta",
    customerEmail: "kabir.m@example.com",
    rating: 3,
    comment:
      "Decent product, gentle on skin, but the scent was a bit milder than I anticipated based on the description.",
    date: "2024-10-05",
    verifiedPurchase: true,
  },
  {
    id: "rev-urban-007",
    storeId: "the-urban-nest",
    productId: "prod_skincare_01",
    productName: "Minimalist Skincare Set",
    customerName: "Meera Desai",
    customerEmail: "meera.desai@example.com",
    rating: 2,
    comment:
      "Delivery took longer than expected and the outer box was slightly dented. Product inside was fine though.",
    date: "2024-09-28",
    verifiedPurchase: true,
  },
  {
    id: "rev-urban-008",
    storeId: "the-urban-nest",
    productId: "prod_watch_01",
    productName: "Smart Watch",
    customerName: "Rohan Joshi",
    customerEmail: "rohan.j@example.com",
    rating: 5,
    comment:
      "Battery life easily lasts 4 days with all fitness tracking sensors enabled. Highly recommend!",
    date: "2024-09-15",
    verifiedPurchase: true,
  },
  {
    id: "rev-style-001",
    storeId: "stylenest",
    productId: "prod_jacket_01",
    productName: "Classic Denim Jacket",
    customerName: "Priya Patel",
    customerEmail: "priya@example.com",
    rating: 5,
    comment:
      "Fits like a dream! Premium denim wash and sturdy buttons. Truly worth the price.",
    date: "2024-10-20",
    verifiedPurchase: true,
  },
  {
    id: "rev-style-002",
    storeId: "stylenest",
    productId: "prod_tshirt_01",
    productName: "Cotton Oversized T-Shirt",
    customerName: "Rahul Verma",
    customerEmail: "rahul.v@example.com",
    rating: 4,
    comment:
      "Very soft breathable cotton. Great oversized silhouette.",
    date: "2024-10-12",
    verifiedPurchase: true,
  },
];

export const initialDemoPayouts: VendorPayout[] = [
  {
    id: "PO-8941",
    storeId: "the-urban-nest",
    amount: 42800,
    fee: 856,
    netAmount: 41944,
    status: "Completed",
    initiatedDate: "2026-11-08",
    completedDate: "2026-11-09",
    payoutMethod: "Bank Transfer (NEFT)",
    bankAccountMasked: "HDFC Bank •••• 4892",
    utrNumber: "HDFCN26312489123",
  },
  {
    id: "PO-8940",
    storeId: "the-urban-nest",
    amount: 38500,
    fee: 770,
    netAmount: 37730,
    status: "Completed",
    initiatedDate: "2026-11-01",
    completedDate: "2026-11-02",
    payoutMethod: "Bank Transfer (NEFT)",
    bankAccountMasked: "HDFC Bank •••• 4892",
    utrNumber: "HDFCN26305190412",
  },
  {
    id: "PO-8942",
    storeId: "the-urban-nest",
    amount: 14200,
    fee: 284,
    netAmount: 13916,
    status: "Processing",
    initiatedDate: "2026-11-15",
    payoutMethod: "Bank Transfer (NEFT)",
    bankAccountMasked: "HDFC Bank •••• 4892",
  },
  {
    id: "PO-7712",
    storeId: "stylenest",
    amount: 22400,
    fee: 448,
    netAmount: 21952,
    status: "Completed",
    initiatedDate: "2026-11-05",
    completedDate: "2026-11-06",
    payoutMethod: "UPI Auto-Payout",
    bankAccountMasked: "ICICI Bank •••• 9102",
    utrNumber: "UPI26309812401",
  },
];

export const initialDemoIntegrations: VendorIntegration[] = [
  {
    id: "razorpay",
    storeId: "the-urban-nest",
    name: "Razorpay Payments",
    description: "Accept UPI, debit/credit cards, and net banking with instant webhooks.",
    category: "payments",
    status: "connected",
    isFunctional: true,
    connectedAt: "2024-01-15",
    apiKeyMasked: "rzp_live_••••••••••••39A1",
    config: { keyId: "rzp_live_demo39A1", autoCapture: "true" },
  },
  {
    id: "shiprocket",
    storeId: "the-urban-nest",
    name: "Shiprocket Logistics",
    description: "Multi-carrier automated dispatch, label printing, and live customer tracking.",
    category: "shipping",
    status: "connected",
    isFunctional: true,
    connectedAt: "2024-02-01",
    apiKeyMasked: "sr_tok_••••••••••••77F2",
    config: { pickupPincode: "560038", autoManifest: "true" },
  },
  {
    id: "whatsapp",
    storeId: "the-urban-nest",
    name: "WhatsApp Business API",
    description: "Send automated dispatch updates, tracking links, and customer inquiries.",
    category: "communication",
    status: "connected",
    isFunctional: true,
    connectedAt: "2024-03-10",
    apiKeyMasked: "wa_biz_••••••••••••9941",
    config: { phoneNumber: "+91 98200 12345", notifyOnDispatch: "true" },
  },
  {
    id: "delhivery",
    storeId: "the-urban-nest",
    name: "Delhivery Direct",
    description: "Dedicated courier pickup, surface freight, and express air delivery across India.",
    category: "shipping",
    status: "disconnected",
    isFunctional: false,
  },
  {
    id: "tally",
    storeId: "the-urban-nest",
    name: "Tally Prime ERP",
    description: "Sync invoices, GST tax compliance, and automated accounting entries.",
    category: "accounting",
    status: "disconnected",
    isFunctional: false,
  },
  {
    id: "google_analytics",
    storeId: "the-urban-nest",
    name: "Google Analytics 4",
    description: "Measure storefront visits, conversion funnels, and customer acquisition channels.",
    category: "marketing",
    status: "action_required",
    isFunctional: true,
    apiKeyMasked: "G-••••••••42",
    config: { measurementId: "G-DEMO123442" },
  },
  {
    id: "razorpay",
    storeId: "stylenest",
    name: "Razorpay Payments",
    description: "Accept UPI, debit/credit cards, and net banking.",
    category: "payments",
    status: "connected",
    isFunctional: true,
    connectedAt: "2026-01-20",
    apiKeyMasked: "rzp_live_••••••••••••109B",
  },
  {
    id: "shiprocket",
    storeId: "stylenest",
    name: "Shiprocket Logistics",
    description: "Multi-carrier automated dispatch and live customer tracking.",
    category: "shipping",
    status: "disconnected",
    isFunctional: true,
  },
];

export const initialDemoCoupons: VendorCoupon[] = [
  {
    id: "cpn-1",
    storeId: "the-urban-nest",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 999,
    expiryDate: "2026-12-31",
    status: "active",
    usedCount: 48,
  },
  {
    id: "cpn-2",
    storeId: "the-urban-nest",
    code: "FESTIVE500",
    discountType: "flat",
    discountValue: 500,
    minOrderValue: 2999,
    expiryDate: "2026-11-30",
    status: "active",
    usedCount: 22,
  },
  {
    id: "cpn-3",
    storeId: "the-urban-nest",
    code: "DIWALI20",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 1999,
    expiryDate: "2026-10-31",
    status: "expired",
    usedCount: 115,
  },
  {
    id: "cpn-sn-1",
    storeId: "stylenest",
    code: "STYLE15",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 1499,
    expiryDate: "2026-12-31",
    status: "active",
    usedCount: 19,
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
        } else {
          const has1018 = parsed.some((o) => o.id === "ord-1018");
          if (!has1018) {
            const ord1018 = initialDemoOrders.find((o) => o.id === "ord-1018");
            if (ord1018) {
              parsed.push(ord1018);
              window.localStorage.setItem(ORDERS_KEY, JSON.stringify(parsed));
            }
          }
        }
      } catch {
        window.localStorage.setItem(ORDERS_KEY, JSON.stringify(initialDemoOrders));
      }
    }

    const existingConversations = window.localStorage.getItem(MESSAGES_KEY);
    if (!existingConversations) {
      window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialDemoConversations));
    } else {
      try {
        const parsed = JSON.parse(existingConversations) as VendorConversation[];
        const hasUrbanNest = parsed.some((c) => c.storeId === "the-urban-nest");
        if (!hasUrbanNest) {
          const urbanNestConvs = initialDemoConversations.filter(
            (c) => c.storeId === "the-urban-nest",
          );
          parsed.push(...urbanNestConvs);
          window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(parsed));
        }
      } catch {
        window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialDemoConversations));
      }
    }

    const existingReviews = window.localStorage.getItem(REVIEWS_KEY);
    if (!existingReviews) {
      window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(initialDemoReviews));
    } else {
      try {
        const parsed = JSON.parse(existingReviews) as VendorReview[];
        const hasUrbanNest = parsed.some((r) => r.storeId === "the-urban-nest");
        if (!hasUrbanNest) {
          const urbanNestReviews = initialDemoReviews.filter(
            (r) => r.storeId === "the-urban-nest",
          );
          parsed.push(...urbanNestReviews);
          window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(parsed));
        }
      } catch {
        window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(initialDemoReviews));
      }
    }

    const existingPayouts = window.localStorage.getItem(PAYOUTS_KEY);
    if (!existingPayouts) {
      window.localStorage.setItem(PAYOUTS_KEY, JSON.stringify(initialDemoPayouts));
    } else {
      try {
        const parsed = JSON.parse(existingPayouts) as VendorPayout[];
        const hasUrbanNest = parsed.some((p) => p.storeId === "the-urban-nest");
        if (!hasUrbanNest) {
          const urbanNestPayouts = initialDemoPayouts.filter(
            (p) => p.storeId === "the-urban-nest",
          );
          parsed.push(...urbanNestPayouts);
          window.localStorage.setItem(PAYOUTS_KEY, JSON.stringify(parsed));
        }
      } catch {
        window.localStorage.setItem(PAYOUTS_KEY, JSON.stringify(initialDemoPayouts));
      }
    }

    const existingIntegrations = window.localStorage.getItem(INTEGRATIONS_KEY);
    if (!existingIntegrations) {
      window.localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(initialDemoIntegrations));
    } else {
      try {
        const parsed = JSON.parse(existingIntegrations) as VendorIntegration[];
        const hasUrbanNest = parsed.some((i) => i.storeId === "the-urban-nest");
        if (!hasUrbanNest) {
          const urbanNestIntegrations = initialDemoIntegrations.filter(
            (i) => i.storeId === "the-urban-nest",
          );
          parsed.push(...urbanNestIntegrations);
          window.localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(parsed));
        }
      } catch {
        window.localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(initialDemoIntegrations));
      }
    }

    const existingCoupons = window.localStorage.getItem(COUPONS_KEY);
    if (!existingCoupons) {
      window.localStorage.setItem(COUPONS_KEY, JSON.stringify(initialDemoCoupons));
    } else {
      try {
        const parsed = JSON.parse(existingCoupons) as VendorCoupon[];
        const hasUrbanNest = parsed.some((c) => c.storeId === "the-urban-nest");
        if (!hasUrbanNest) {
          const urbanNestCoupons = initialDemoCoupons.filter(
            (c) => c.storeId === "the-urban-nest",
          );
          parsed.push(...urbanNestCoupons);
          window.localStorage.setItem(COUPONS_KEY, JSON.stringify(parsed));
        }
      } catch {
        window.localStorage.setItem(COUPONS_KEY, JSON.stringify(initialDemoCoupons));
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

export function getStoredCustomerNotes(storeId: string): Record<string, string> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(CUSTOMER_NOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed[storeId] || {};
    }
  } catch {
    return {};
  }
  return {};
}

export function saveStoredCustomerNote(
  storeId: string,
  customerEmail: string,
  note: string,
): void {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_NOTES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    if (!all[storeId]) all[storeId] = {};
    all[storeId][customerEmail.toLowerCase().trim()] = note;
    window.localStorage.setItem(CUSTOMER_NOTES_KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable
  }
}

export function getStoredConversations(storeId?: string): VendorConversation[] {
  if (!isBrowser()) {
    return storeId
      ? initialDemoConversations.filter((c) => c.storeId === storeId)
      : initialDemoConversations;
  }
  try {
    const raw = window.localStorage.getItem(MESSAGES_KEY);
    if (raw) {
      const all = JSON.parse(raw) as VendorConversation[];
      return storeId ? all.filter((c) => c.storeId === storeId) : all;
    }
  } catch {
    // Return initial on error
  }
  return storeId
    ? initialDemoConversations.filter((c) => c.storeId === storeId)
    : initialDemoConversations;
}

export function saveStoredConversations(conversations: VendorConversation[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(conversations));
  } catch {
    // Storage unavailable
  }
}

export function getStoredReviews(storeId?: string): VendorReview[] {
  if (!isBrowser()) {
    return storeId
      ? initialDemoReviews.filter((r) => r.storeId === storeId)
      : initialDemoReviews;
  }
  try {
    const raw = window.localStorage.getItem(REVIEWS_KEY);
    if (raw) {
      const all = JSON.parse(raw) as VendorReview[];
      return storeId ? all.filter((r) => r.storeId === storeId) : all;
    }
  } catch {
    // Return initial on error
  }
  return storeId
    ? initialDemoReviews.filter((r) => r.storeId === storeId)
    : initialDemoReviews;
}

export function saveStoredReviews(reviews: VendorReview[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  } catch {
    // Storage unavailable
  }
}

export function getStoredPayouts(storeId?: string): VendorPayout[] {
  if (!isBrowser()) {
    return storeId
      ? initialDemoPayouts.filter((p) => p.storeId === storeId)
      : initialDemoPayouts;
  }
  try {
    const raw = window.localStorage.getItem(PAYOUTS_KEY);
    if (raw) {
      const all = JSON.parse(raw) as VendorPayout[];
      return storeId ? all.filter((p) => p.storeId === storeId) : all;
    }
  } catch {
    // Return initial on error
  }
  return storeId
    ? initialDemoPayouts.filter((p) => p.storeId === storeId)
    : initialDemoPayouts;
}

export function saveStoredPayouts(payouts: VendorPayout[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PAYOUTS_KEY, JSON.stringify(payouts));
  } catch {
    // Storage unavailable
  }
}

export function getStoredIntegrations(storeId?: string): VendorIntegration[] {
  if (!isBrowser()) {
    return storeId
      ? initialDemoIntegrations.filter((i) => i.storeId === storeId)
      : initialDemoIntegrations;
  }
  try {
    const raw = window.localStorage.getItem(INTEGRATIONS_KEY);
    if (raw) {
      const all = JSON.parse(raw) as VendorIntegration[];
      return storeId ? all.filter((i) => i.storeId === storeId) : all;
    }
  } catch {
    // Return initial on error
  }
  return storeId
    ? initialDemoIntegrations.filter((i) => i.storeId === storeId)
    : initialDemoIntegrations;
}

export function saveStoredIntegrations(integrations: VendorIntegration[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
  } catch {
    // Storage unavailable
  }
}

export function getStoredCoupons(storeId?: string): VendorCoupon[] {
  if (!isBrowser()) {
    return storeId
      ? initialDemoCoupons.filter((c) => c.storeId === storeId)
      : initialDemoCoupons;
  }
  try {
    const raw = window.localStorage.getItem(COUPONS_KEY);
    if (raw) {
      const all = JSON.parse(raw) as VendorCoupon[];
      return storeId ? all.filter((c) => c.storeId === storeId) : all;
    }
  } catch {
    // Return initial on error
  }
  return storeId
    ? initialDemoCoupons.filter((c) => c.storeId === storeId)
    : initialDemoCoupons;
}

export function saveStoredCoupons(coupons: VendorCoupon[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  } catch {
    // Storage unavailable
  }
}
