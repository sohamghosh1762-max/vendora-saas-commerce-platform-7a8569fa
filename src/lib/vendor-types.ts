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
  logoUrl?: string;
  cover?: string;
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
  taxId?: string;
  status: "ACTIVE" | "PENDING_APPROVAL";
  rating: number;
  reviews: number;
  productCount: number;
  createdAt: string;
};

export type VendorOrder = {
  id: string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  items: { productName: string; qty: number; price: number }[];
  total: number;
  status: "Delivered" | "Shipped" | "Processing" | "Pending";
  date: string;
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
