export type VendorUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  salt: string;
  role: "vendor";
  createdAt: string;
  storeId: string;
};

export type VendorStore = {
  id: string; // unique slug
  slug: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  logoUrl?: string | undefined;
  cover?: string | undefined;
  tint: string;
  ownerId: string;
  ownerEmail: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  businessType: string;
  returnPolicy: string;
  shippingMethod: string;
  processingTime: string;
  supportEmail: string;
  taxId?: string | undefined;
  status: "ACTIVE" | "PENDING_APPROVAL";
  rating: number;
  reviews: number;
  productCount: number;
  createdAt: string;
};

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type OrderItem = {
  productId?: string | undefined;
  productName: string;
  qty: number;
  price: number;
  image?: string | undefined;
};

export type VendorOrder = {
  id: string;
  orderNumber?: string | undefined;
  storeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | undefined;
  shippingAddress?: string | undefined;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  paymentMethod?: string | undefined;
  trackingNumber?: string | undefined;
};

export type CustomerTier = "VIP" | "Repeat" | "New";

export type MessageSenderRole = "customer" | "vendor";

export interface VendorChatMessage {
  id: string;
  senderRole: MessageSenderRole;
  senderName: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface VendorConversation {
  id: string;
  storeId: string;
  customerId?: string | undefined;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | undefined;
  unreadCount: number;
  lastMessage: string;
  lastMessageTimestamp: string;
  messages: VendorChatMessage[];
  createdAt: string;
  orderNumber?: string | undefined;
}

export type VendorCustomer = {
  id: string;
  name: string;
  email: string;
  phone?: string | undefined;
  shippingAddress?: string | undefined;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  tier: CustomerTier;
  orders: VendorOrder[];
  notes?: string | undefined;
};

export interface VendorReviewReply {
  replyText: string;
  repliedAt: string;
  repliedBy?: string | undefined;
}

export interface VendorReview {
  id: string;
  storeId: string;
  productId?: string | undefined;
  productName: string;
  productImage?: string | undefined;
  customerName: string;
  customerEmail?: string | undefined;
  customerAvatar?: string | undefined;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedPurchase?: boolean | undefined;
  vendorReply?: VendorReviewReply | undefined;
}

export interface VendorReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  distributionPercentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  repliedCount: number;
  unrepliedCount: number;
}

export type PayoutStatus = "Completed" | "Processing" | "Pending" | "Failed";

export interface VendorPayout {
  id: string;
  storeId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: PayoutStatus;
  initiatedDate: string;
  completedDate?: string | undefined;
  payoutMethod: string;
  bankAccountMasked: string;
  utrNumber?: string | undefined;
}

export interface VendorPayoutSummary {
  totalEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  nextPayoutDate: string;
}

export type IntegrationCategory =
  | "payments"
  | "shipping"
  | "accounting"
  | "marketing"
  | "communication";

export type IntegrationStatus = "connected" | "disconnected" | "action_required";

export interface VendorIntegration {
  id: string;
  storeId: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  isFunctional: boolean;
  connectedAt?: string | undefined;
  apiKeyMasked?: string | undefined;
  config?: Record<string, string> | undefined;
}

export interface VendorCoupon {
  id: string;
  storeId: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  status: "active" | "expired" | "paused";
  usedCount: number;
}

export interface VendorAnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  productsSold: number;
  averageOrderValue: number;
  growthRate: number;
}

export type VendorSession = {
  token: string;
  vendor: VendorUser;
  store: VendorStore;
  expiresAt: number;
};

export type OnboardingData = {
  // Step 1: Account
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;

  // Step 2: Store
  storeName: string;
  storeSlug: string;
  category: string;
  description: string;
  logoDataUrl?: string;
  storePhone: string;
  storeEmail: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;

  // Step 3: Business & Fulfilment
  businessType: string;
  returnPolicy: string;
  shippingMethod: string;
  processingTime: string;
  supportEmail: string;
  taxId?: string;
};
