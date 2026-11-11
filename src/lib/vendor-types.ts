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
