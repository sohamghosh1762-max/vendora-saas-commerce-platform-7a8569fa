import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { OnboardingData, VendorSession, VendorStore, VendorUser } from "./vendor-types";
import {
  getActiveSession,
  getVendorStore,
  loginVendor,
  logoutVendor,
  registerVendor,
} from "./vendor-api";
import { ensureSeeded } from "./vendor-storage";

type VendorAuthContextType = {
  session: VendorSession | null;
  vendor: VendorUser | null;
  store: VendorStore | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  register: (data: OnboardingData) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshStore: () => void;
};

const VendorAuthContext = createContext<VendorAuthContextType | null>(null);

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<VendorSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureSeeded().then(() => {
      const active = getActiveSession();
      setSession(active);
      setHydrated(true);
    });
  }, []);

  const refreshStore = useCallback(() => {
    if (!session) return;
    const updatedStore = getVendorStore(session.store.id);
    if (updatedStore) {
      setSession((prev) => (prev ? { ...prev, store: updatedStore } : null));
    }
  }, [session]);

  const register = useCallback(async (data: OnboardingData) => {
    const res = await registerVendor(data);
    if (res.success && res.session) {
      setSession(res.session);
      return { success: true };
    }
    return { success: false, error: res.error || "Failed to register vendor." };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    const res = await loginVendor(email, pass);
    if (res.success && res.session) {
      setSession(res.session);
      return { success: true };
    }
    return { success: false, error: res.error || "Failed to log in." };
  }, []);

  const logout = useCallback(() => {
    logoutVendor();
    setSession(null);
  }, []);

  return (
    <VendorAuthContext.Provider
      value={{
        session,
        vendor: session?.vendor ?? null,
        store: session?.store ?? null,
        isAuthenticated: Boolean(session),
        hydrated,
        register,
        login,
        logout,
        refreshStore,
      }}
    >
      {children}
    </VendorAuthContext.Provider>
  );
}

export function useVendorAuth(): VendorAuthContextType {
  const ctx = useContext(VendorAuthContext);
  if (!ctx) {
    throw new Error("useVendorAuth must be used within a VendorAuthProvider");
  }
  return ctx;
}
