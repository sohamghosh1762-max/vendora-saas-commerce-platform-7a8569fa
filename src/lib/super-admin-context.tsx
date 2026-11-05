import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getSuperAdminAuthStatus, loginSuperAdmin, logoutSuperAdmin } from "./super-admin-api";
import { verifyClientAdminCredentials, getClientAdminSession } from "./super-admin-storage";
import type { SuperAdminUser } from "./super-admin-types";

interface SuperAdminAuthContextType {
  admin: SuperAdminUser | null;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | null>(null);

export function SuperAdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<SuperAdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await getSuperAdminAuthStatus();
      setIsConfigured(status.isConfigured);
      setIsAuthenticated(status.isAuthenticated);
      setAdmin(status.admin);
    } catch (err) {
      console.warn(
        "Failed to verify super admin auth status from server, checking local session:",
        err,
      );
      const clientSession = getClientAdminSession();
      setIsConfigured(true);
      setIsAuthenticated(Boolean(clientSession));
      setAdmin(clientSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await loginSuperAdmin({ data: { email, password: pass } });
        if (res.success && res.admin) {
          setAdmin(res.admin);
          setIsAuthenticated(true);
          return { success: true };
        }
        if (res.rateLimited) {
          const errorMsg = res.error || "Too many failed attempts.";
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
        // Fallback verification for preview/development environments
        const clientRes = await verifyClientAdminCredentials(email, pass);
        if (clientRes.success && clientRes.admin) {
          setAdmin(clientRes.admin);
          setIsAuthenticated(true);
          return { success: true };
        }
        const errorMsg = res.error || clientRes.error || "Invalid administrator credentials.";
        setError(errorMsg);
        setIsAuthenticated(false);
        setAdmin(null);
        return { success: false, error: errorMsg };
      } catch {
        // Fallback to client verification for preview/development environments
        try {
          const clientRes = await verifyClientAdminCredentials(email, pass);
          if (clientRes.success && clientRes.admin) {
            setAdmin(clientRes.admin);
            setIsAuthenticated(true);
            return { success: true };
          }
        } catch {
          // ignore
        }
        const errorMsg = "Invalid administrator credentials.";
        setError(errorMsg);
        setIsAuthenticated(false);
        setAdmin(null);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutSuperAdmin();
    } catch (err) {
      console.error("Error during super admin logout:", err);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  return (
    <SuperAdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        isConfigured,
        isLoading,
        error,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </SuperAdminAuthContext.Provider>
  );
}

export function useSuperAdminAuth(): SuperAdminAuthContextType {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx) {
    throw new Error("useSuperAdminAuth must be used within a SuperAdminAuthProvider");
  }
  return ctx;
}
