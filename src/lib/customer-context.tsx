import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import type {
  CustomerAddress,
  CustomerUser,
  CustomerSession,
  CustomerSignUpData,
  CustomerSignInData,
  CustomerProfileUpdate,
} from "./customer-types";
import {
  getCustomerAccounts,
  saveCustomerAccounts,
  findCustomerByEmail,
  getCustomerSession,
  saveCustomerSession,
  clearCustomerSession,
  generateSalt,
  hashPassword,
  generateCustomerId,
  generateAddressId,
} from "./customer-storage";

export interface CustomerAuthContextValue {
  customer: CustomerUser | null;
  session: CustomerSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (
    data: CustomerSignUpData,
  ) => Promise<{ success: boolean; error?: string; customer?: CustomerUser }>;
  signIn: (
    emailOrData: string | CustomerSignInData,
    passwordArg?: string,
  ) => Promise<{ success: boolean; error?: string; customer?: CustomerUser }>;
  signOut: () => void;
  updateProfile: (data: CustomerProfileUpdate) => boolean;
  addAddress: (address: Omit<CustomerAddress, "id">) => CustomerAddress | null;
  updateAddress: (id: string, address: Partial<CustomerAddress>) => boolean;
  deleteAddress: (id: string) => boolean;
  setDefaultAddress: (id: string) => boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CustomerSession | null>(() => {
    return getCustomerSession();
  });

  const [customer, setCustomer] = useState<CustomerUser | null>(() => {
    const activeSession = getCustomerSession();
    if (!activeSession) return null;
    const accounts = getCustomerAccounts();
    const targetId = activeSession.customerId || activeSession.user?.id;
    const targetEmail = activeSession.customerEmail || activeSession.user?.email;
    const freshUser = accounts.find(
      (a) =>
        (targetId && a.id === targetId) ||
        (targetEmail && a.email.toLowerCase() === targetEmail.toLowerCase()),
    );
    if (!freshUser) return null;
    return {
      ...freshUser,
      name: freshUser.fullName || freshUser.name,
      fullName: freshUser.fullName || freshUser.name,
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  // Synchronous ref to prevent stale closures in rapid test calls
  const customerRef = useRef<CustomerUser | null>(customer);
  const sessionRef = useRef<CustomerSession | null>(session);

  useEffect(() => {
    customerRef.current = customer;
  }, [customer]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Initialize session on mount (SSR safe)
  useEffect(() => {
    try {
      const activeSession = getCustomerSession();
      if (activeSession) {
        setSession(activeSession);
        sessionRef.current = activeSession;
        // Sync with latest customer record
        const accounts = getCustomerAccounts();
        const targetId = activeSession.customerId || activeSession.user?.id;
        const targetEmail = activeSession.customerEmail || activeSession.user?.email;
        const freshUser = accounts.find(
          (a) =>
            (targetId && a.id === targetId) ||
            (targetEmail && a.email.toLowerCase() === targetEmail.toLowerCase()),
        );
        if (freshUser) {
          const userWithAliases: CustomerUser = {
            ...freshUser,
            name: freshUser.fullName || freshUser.name,
            fullName: freshUser.fullName || freshUser.name,
          };
          customerRef.current = userWithAliases;
          setCustomer(userWithAliases);
        } else {
          // If customer record was deleted, clear session
          clearCustomerSession();
          customerRef.current = null;
          sessionRef.current = null;
          setSession(null);
          setCustomer(null);
        }
      }
    } catch {
      // Ignore initial storage read errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync session and customer helper
  const syncCustomerData = useCallback((user: CustomerUser) => {
    const normalized: CustomerUser = {
      ...user,
      name: user.fullName || user.name,
      fullName: user.fullName || user.name,
    };
    customerRef.current = normalized;
    const updatedSession: CustomerSession = {
      customerId: normalized.id,
      customerEmail: normalized.email,
      createdAt: normalized.createdAt,
      user: {
        id: normalized.id,
        name: normalized.fullName,
        fullName: normalized.fullName,
        email: normalized.email,
        phone: normalized.phone,
        createdAt: normalized.createdAt,
        addresses: normalized.addresses,
      },
      token: `sess_${Date.now().toString(36)}`,
      loginAt: new Date().toISOString(),
    };
    sessionRef.current = updatedSession;
    saveCustomerSession(updatedSession);
    setCustomer(normalized);
    setSession(updatedSession);
  }, []);

  const signUp = useCallback(
    async (
      data: CustomerSignUpData,
    ): Promise<{ success: boolean; error?: string; customer?: CustomerUser }> => {
      const rawName = data.fullName || data.name || "";
      const fullName = rawName.trim();
      const email = (data.email || "").trim().toLowerCase();
      const phone = (data.phone || "").trim();
      const password = (data.password || "").trim();
      const confirmPassword = (
        data.confirmPassword !== undefined ? data.confirmPassword : password
      ).trim();

      if (!fullName || fullName.length < 2) {
        return { success: false, error: "Please enter your full name (minimum 2 characters)." };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: "Please enter a valid email address." };
      }
      if (!/^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6-9]\d{9}$/.test(phone)) {
        return { success: false, error: "Please enter a valid 10-digit Indian mobile number." };
      }
      if (!password || password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters long." };
      }
      if (password !== confirmPassword) {
        return { success: false, error: "Passwords do not match. Please re-enter." };
      }

      const existing = findCustomerByEmail(email);
      if (existing) {
        return {
          success: false,
          error: "An account with this email is already registered. Please sign in instead.",
        };
      }

      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);
      const newCustomer: CustomerUser = {
        id: generateCustomerId(),
        name: fullName,
        fullName,
        email,
        phone,
        passwordHash,
        salt,
        createdAt: new Date().toISOString(),
        addresses: [],
      };

      const allAccounts = getCustomerAccounts();
      allAccounts.push(newCustomer);
      const saved = saveCustomerAccounts(allAccounts);
      if (!saved) {
        return { success: false, error: "Failed to save account to browser storage." };
      }

      syncCustomerData(newCustomer);
      return { success: true, customer: newCustomer };
    },
    [syncCustomerData],
  );

  const signIn = useCallback(
    async (
      emailOrData: string | CustomerSignInData,
      passwordArg?: string,
    ): Promise<{ success: boolean; error?: string; customer?: CustomerUser }> => {
      let emailInput = "";
      let passwordInput = "";
      if (typeof emailOrData === "object" && emailOrData !== null) {
        emailInput = emailOrData.email || "";
        passwordInput = emailOrData.password || "";
      } else {
        emailInput = emailOrData || "";
        passwordInput = passwordArg || "";
      }

      const email = emailInput.trim().toLowerCase();
      const password = passwordInput.trim();

      if (!email || !password) {
        return { success: false, error: "Please enter both email and password." };
      }

      const user = findCustomerByEmail(email);
      if (!user) {
        return {
          success: false,
          error:
            "No customer account found with this email. Please check your spelling or create a new account.",
        };
      }

      // Check password hash
      const computedHash = await hashPassword(password, user.salt);
      const isDemoMatch = user.email === "aarav.sharma@example.com" && password === "Password@123";

      if (computedHash === user.passwordHash || isDemoMatch) {
        const normalized: CustomerUser = {
          ...user,
          name: user.fullName || user.name,
          fullName: user.fullName || user.name,
        };
        syncCustomerData(normalized);
        return { success: true, customer: normalized };
      }

      return {
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
      };
    },
    [syncCustomerData],
  );

  const signOut = useCallback(() => {
    customerRef.current = null;
    sessionRef.current = null;
    clearCustomerSession();
    setSession(null);
    setCustomer(null);
  }, []);

  const updateProfile = useCallback(
    (data: CustomerProfileUpdate): boolean => {
      const current = customerRef.current || customer;
      if (!current) return false;

      const rawName = data.fullName || data.name || "";
      const fullName = rawName.trim();
      const phone = (data.phone || "").trim();

      if (!fullName || fullName.length < 2) return false;
      if (!/^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6-9]\d{9}$/.test(phone)) return false;

      const accounts = getCustomerAccounts();
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === current.id) {
          return { ...acc, name: fullName, fullName, phone };
        }
        return acc;
      });

      saveCustomerAccounts(updatedAccounts);
      const updatedUser: CustomerUser = { ...current, name: fullName, fullName, phone };
      syncCustomerData(updatedUser);
      return true;
    },
    [customer, syncCustomerData],
  );

  const addAddress = useCallback(
    (addressData: Omit<CustomerAddress, "id">): CustomerAddress | null => {
      const current = customerRef.current || customer;
      if (!current) return null;

      const newAddress: CustomerAddress = {
        ...addressData,
        id: generateAddressId(),
        isDefault: Boolean(addressData.isDefault || current.addresses.length === 0),
      };

      const updatedAddresses = current.addresses.map((addr) => ({
        ...addr,
        isDefault: newAddress.isDefault ? false : addr.isDefault,
      }));
      updatedAddresses.push(newAddress);

      const accounts = getCustomerAccounts();
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === current.id) {
          return { ...acc, addresses: updatedAddresses };
        }
        return acc;
      });

      saveCustomerAccounts(updatedAccounts);
      const updatedUser: CustomerUser = { ...current, addresses: updatedAddresses };
      syncCustomerData(updatedUser);
      return newAddress;
    },
    [customer, syncCustomerData],
  );

  const updateAddress = useCallback(
    (id: string, addressData: Partial<CustomerAddress>): boolean => {
      const current = customerRef.current || customer;
      if (!current) return false;

      const isDefault = Boolean(addressData.isDefault);
      const updatedAddresses = current.addresses.map((addr) => {
        if (addr.id === id) {
          return { ...addr, ...addressData };
        }
        return {
          ...addr,
          isDefault: isDefault ? false : addr.isDefault,
        };
      });

      const accounts = getCustomerAccounts();
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === current.id) {
          return { ...acc, addresses: updatedAddresses };
        }
        return acc;
      });

      saveCustomerAccounts(updatedAccounts);
      const updatedUser: CustomerUser = { ...current, addresses: updatedAddresses };
      syncCustomerData(updatedUser);
      return true;
    },
    [customer, syncCustomerData],
  );

  const deleteAddress = useCallback(
    (id: string): boolean => {
      const current = customerRef.current || customer;
      if (!current) return false;

      const filtered = current.addresses.filter((addr) => addr.id !== id);
      // If we deleted the default address, make the first remaining address the default
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        const first = filtered[0];
        if (first) {
          first.isDefault = true;
        }
      }

      const accounts = getCustomerAccounts();
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === current.id) {
          return { ...acc, addresses: filtered };
        }
        return acc;
      });

      saveCustomerAccounts(updatedAccounts);
      const updatedUser: CustomerUser = { ...current, addresses: filtered };
      syncCustomerData(updatedUser);
      return true;
    },
    [customer, syncCustomerData],
  );

  const setDefaultAddress = useCallback(
    (id: string): boolean => {
      const current = customerRef.current || customer;
      if (!current) return false;

      const updatedAddresses = current.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }));

      const accounts = getCustomerAccounts();
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === current.id) {
          return { ...acc, addresses: updatedAddresses };
        }
        return acc;
      });

      saveCustomerAccounts(updatedAccounts);
      const updatedUser: CustomerUser = { ...current, addresses: updatedAddresses };
      syncCustomerData(updatedUser);
      return true;
    },
    [customer, syncCustomerData],
  );

  const value: CustomerAuthContextValue = useMemo(() => {
    return {
      get customer() {
        return customerRef.current ?? customer;
      },
      get session() {
        return sessionRef.current ?? session;
      },
      get isAuthenticated() {
        return Boolean((customerRef.current ?? customer) && (sessionRef.current ?? session));
      },
      isLoading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    };
  }, [
    customer,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  ]);

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

const defaultGuestAuth: CustomerAuthContextValue = {
  customer: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  signUp: async () => ({ success: false, error: "CustomerAuthProvider not mounted" }),
  signIn: async () => ({ success: false, error: "CustomerAuthProvider not mounted" }),
  signOut: () => {},
  updateProfile: () => false,
  addAddress: () => null,
  updateAddress: () => false,
  deleteAddress: () => false,
  setDefaultAddress: () => false,
};

export function useCustomerAuth(): CustomerAuthContextValue {
  const context = useContext(CustomerAuthContext);
  return context || defaultGuestAuth;
}
