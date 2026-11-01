export const SUPER_ADMIN_ROLE = "SUPER_ADMIN" as const;
export type SuperAdminRole = typeof SUPER_ADMIN_ROLE;

export interface SuperAdminUser {
  email: string;
  role: SuperAdminRole;
}

export interface SuperAdminAuthStatus {
  isConfigured: boolean;
  isAuthenticated: boolean;
  admin: SuperAdminUser | null;
}

export interface SuperAdminLoginResult {
  success: boolean;
  error?: string;
  admin?: SuperAdminUser;
  rateLimited?: boolean;
  retryAfterSeconds?: number;
}

export interface SuperAdminAuditLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "BLOCKED";
  metadata?: Record<string, unknown>;
}

export interface SuperAdminDashboardData {
  metrics: {
    totalStores: number;
    activeStores: number;
    pendingStores: number;
    suspendedStores?: number;
    grossMerchandiseVolumeINR: number;
    platformCommissionINR: number;
    activeMerchants: number;
    systemHealth: "OPTIMAL" | "DEGRADED" | "CRITICAL";
    uptimePercentage: number;
  };
  pendingApprovals: Array<{
    id: string;
    storeName: string;
    category: string;
    ownerName: string;
    ownerEmail: string;
    submittedAt: string;
  }>;
  auditLogs: SuperAdminAuditLog[];
}

export type StoreStatus = "Active" | "Pending" | "Suspended";

export interface SuperAdminManagedStore {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  logo?: string;
  cover?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  vendorId: string;
  status: StoreStatus;
  suspensionReason?: string;
  productsCount: number;
  ordersCount: number;
  revenueINR: number;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
  storefrontUrl: string;
  address?: string;
  city?: string;
  state?: string;
  isArchived?: boolean;
}

export interface SuperAdminStoresSummary {
  total: number;
  active: number;
  pending: number;
  suspended: number;
}

export interface SuperAdminStoreFilters {
  search?: string;
  status?: "All" | StoreStatus;
  category?: string;
  sortBy?: "newest" | "oldest" | "name" | "revenue" | "products" | "orders";
  page?: number;
  pageSize?: number;
}

export interface SuperAdminStoreListResponse {
  stores: SuperAdminManagedStore[];
  summary: SuperAdminStoresSummary;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SuperAdminStoreCreateInput {
  name: string;
  slug?: string;
  category: string;
  tagline?: string;
  description?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  status?: StoreStatus;
  initialProductsCount?: number;
}

export interface SuperAdminStoreUpdateInput {
  name?: string;
  category?: string;
  tagline?: string;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  status?: StoreStatus;
  suspensionReason?: string;
}

export interface SuperAdminStoreOperationResult {
  success: boolean;
  store?: SuperAdminManagedStore;
  error?: string;
}
