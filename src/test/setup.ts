import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import type {
  SuperAdminStoreFilters,
  SuperAdminStoreCreateInput,
  SuperAdminStoreUpdateInput,
  StoreStatus,
} from "@/lib/super-admin-types";

vi.mock("@/lib/super-admin-api", async () => {
  const serverModule = await import("@/lib/super-admin-auth.server");
  return {
    getSuperAdminAuthStatus: vi.fn(async () => serverModule.handleGetStatus()),
    loginSuperAdmin: vi.fn(async ({ data }: { data: { email: string; password: string } }) =>
      serverModule.handleLogin(data.email, data.password),
    ),
    logoutSuperAdmin: vi.fn(async () => serverModule.handleLogout()),
    getSuperAdminDashboardData: vi.fn(async () => serverModule.handleGetDashboardData()),
    getSuperAdminStores: vi.fn(async ({ data }: { data?: unknown } = {}) =>
      serverModule.handleGetStores((data || {}) as SuperAdminStoreFilters),
    ),
    getSuperAdminStoreById: vi.fn(async ({ data }: { data: string }) =>
      serverModule.handleGetStoreById(data),
    ),
    createSuperAdminStore: vi.fn(async ({ data }: { data: unknown }) =>
      serverModule.handleCreateStore(data as SuperAdminStoreCreateInput),
    ),
    updateSuperAdminStore: vi.fn(async ({ data }: { data: { id: string; input: unknown } }) =>
      serverModule.handleUpdateStore(data.id, data.input as SuperAdminStoreUpdateInput),
    ),
    updateSuperAdminStoreStatus: vi.fn(
      async ({ data }: { data: { id: string; status: unknown; reason?: string } }) =>
        serverModule.handleUpdateStoreStatus(data.id, data.status as StoreStatus, data.reason),
    ),
    deleteSuperAdminStore: vi.fn(async ({ data }: { data: string }) =>
      serverModule.handleDeleteStore(data),
    ),
  };
});

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};
