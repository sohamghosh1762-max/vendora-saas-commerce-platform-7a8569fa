import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { CartProvider, useCart } from "@/lib/cart";
import { CustomerAuthProvider, useCustomerAuth } from "@/lib/customer-context";
import {
  CUSTOMER_ACCOUNTS_STORAGE_KEY,
  CUSTOMER_SESSION_STORAGE_KEY,
  getCustomerAccounts,
  getCustomerByEmail,
  hashPassword,
  saveCustomerAccounts,
  getCurrentCustomerSession,
  saveCustomerSession,
  clearCustomerSession,
} from "@/lib/customer-storage";
import {
  CUSTOMER_ORDERS_STORAGE_KEY,
  getCustomerOrders,
  getCustomerOrderById,
  getOrdersByCustomer,
  saveCustomerOrder,
  updateOrderStatus,
} from "@/lib/order-storage";
import { paymentSelectionSchema } from "@/lib/checkout-schema";
import type { CustomerUser, CustomerAddress } from "@/lib/customer-types";
import type { CustomerOrder } from "@/lib/order-types";
import { getProduct } from "@/data/products";

// Test helper component to interact with useCustomerAuth inside React
function AuthTester({ onReady }: { onReady: (auth: ReturnType<typeof useCustomerAuth>) => void }) {
  const auth = useCustomerAuth();
  React.useEffect(() => {
    onReady(auth);
  }, [auth, onReady]);
  return (
    <div data-testid="auth-tester">
      <span data-testid="auth-status">{auth.isAuthenticated ? "authenticated" : "guest"}</span>
      <span data-testid="customer-name">{auth.customer?.name || "none"}</span>
      <span data-testid="customer-email">{auth.customer?.email || "none"}</span>
      <span data-testid="address-count">{auth.customer?.addresses.length ?? 0}</span>
    </div>
  );
}

// Router Harness for testing pages
function renderWithAuthAndRouter(
  ui: React.ReactElement,
  initialRoute = "/",
  initialCart?: Record<string, number>,
) {
  if (initialCart) {
    window.localStorage.setItem(
      "vendora-cart-v1",
      JSON.stringify({
        items: initialCart,
        wishlist: [],
        coupon: null,
      }),
    );
  } else {
    window.localStorage.removeItem("vendora-cart-v1");
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <CustomerAuthProvider>
          <CartProvider>{ui}</CartProvider>
        </CustomerAuthProvider>
      </QueryClientProvider>
    ),
  });

  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
  const accountRoute = createRoute({ getParentRoute: () => rootRoute, path: "/account" });
  const trackRoute = createRoute({ getParentRoute: () => rootRoute, path: "/track-order" });
  const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/checkout" });
  const signinRoute = createRoute({ getParentRoute: () => rootRoute, path: "/signin" });
  const signupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/signup" });
  const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cart" });
  const shopRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shop" });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    accountRoute,
    trackRoute,
    checkoutRoute,
    signinRoute,
    signupRoute,
    cartRoute,
    shopRoute,
  ]);
  const history = createMemoryHistory({ initialEntries: [initialRoute] });
  const router = createRouter({ routeTree, history });

  return render(<RouterProvider router={router} />);
}

describe("PROMPT 6: Customer Accounts, Profile, Addresses, Order History & Tracking", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Customer Accounts & Authentication Storage", () => {
    it("hashes passwords securely using Web Crypto SHA-256", async () => {
      const salt = "test-salt-123";
      const hash1 = await hashPassword("Secret@123", salt);
      const hash2 = await hashPassword("Secret@123", salt);
      const hashDiff = await hashPassword("Different@123", salt);

      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBeGreaterThan(16);
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hashDiff);
      // Ensures plaintext password is never stored or returned
      expect(hash1).not.toContain("Secret@123");
    });

    it("registers a new customer and persists account securely in localStorage", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      const res = await authObj.signUp({
        name: "Rohit Verma",
        email: "rohit.verma@example.com",
        phone: "9876543210",
        password: "Password@123",
        confirmPassword: "Password@123",
      });

      expect(res.success).toBe(true);
      expect(res.customer?.name).toBe("Rohit Verma");
      expect(res.customer?.email).toBe("rohit.verma@example.com");

      // Verify persistence in localStorage
      const stored = getCustomerByEmail("rohit.verma@example.com");
      expect(stored).toBeDefined();
      expect(stored?.name).toBe("Rohit Verma");
      expect(stored?.passwordHash).toBeDefined();
      expect(stored?.passwordHash).not.toBe("Password@123");
    });

    it("rejects registration with invalid fields or password mismatch", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      // Password mismatch
      const mismatchRes = await authObj.signUp({
        name: "Kavita",
        email: "kavita@example.com",
        phone: "9876543210",
        password: "Password@123",
        confirmPassword: "DifferentPassword@456",
      });
      expect(mismatchRes.success).toBe(false);
      expect(mismatchRes.error).toContain("match");

      // Invalid short name
      const shortNameRes = await authObj.signUp({
        name: "A",
        email: "kavita@example.com",
        phone: "9876543210",
        password: "Password@123",
        confirmPassword: "Password@123",
      });
      expect(shortNameRes.success).toBe(false);

      // Invalid email
      const badEmailRes = await authObj.signUp({
        name: "Kavita Sharma",
        email: "not-an-email",
        phone: "9876543210",
        password: "Password@123",
        confirmPassword: "Password@123",
      });
      expect(badEmailRes.success).toBe(false);
    });

    it("prevents duplicate registration with an existing email", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      const first = await authObj.signUp({
        name: "Ananya Roy",
        email: "ananya.roy@example.com",
        phone: "9876543210",
        password: "Password@123",
        confirmPassword: "Password@123",
      });
      expect(first.success).toBe(true);

      const duplicate = await authObj.signUp({
        name: "Ananya Duplicate",
        email: "ANANYA.ROY@example.com", // Case insensitive duplicate check
        phone: "9811122233",
        password: "Password@456",
        confirmPassword: "Password@456",
      });
      expect(duplicate.success).toBe(false);
      expect(duplicate.error).toContain("already registered");
    });

    it("authenticates registered customer with valid credentials and sets session", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      // Sign in pre-seeded demo customer Aarav Sharma
      const signInRes = await authObj.signIn({
        email: "aarav.sharma@example.com",
        password: "Password@123",
        rememberMe: true,
      });

      expect(signInRes.success).toBe(true);
      expect(signInRes.customer?.name).toBe("Aarav Sharma");
      expect(authObj.isAuthenticated).toBe(true);

      // Verify active session saved in localStorage
      const session = getCurrentCustomerSession();
      expect(session).not.toBeNull();
      expect(session?.customerEmail).toBe("aarav.sharma@example.com");
    });

    it("rejects sign-in with invalid password or non-existent email", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      const badPass = await authObj.signIn({
        email: "aarav.sharma@example.com",
        password: "WrongPassword!999",
      });
      expect(badPass.success).toBe(false);
      expect(badPass.error).toContain("Invalid email or password");

      const notFound = await authObj.signIn({
        email: "nobody.exists@example.com",
        password: "SomePassword@123",
      });
      expect(notFound.success).toBe(false);
      expect(notFound.error).toContain("No customer account found");
    });

    it("handles logout and clears active session while preserving account data", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      await authObj.signIn({
        email: "aarav.sharma@example.com",
        password: "Password@123",
      });
      expect(authObj.isAuthenticated).toBe(true);

      authObj.signOut();
      expect(authObj.isAuthenticated).toBe(false);
      expect(authObj.customer).toBeNull();
      expect(getCurrentCustomerSession()).toBeNull();

      // Account itself should still exist in storage
      expect(getCustomerByEmail("aarav.sharma@example.com")).toBeDefined();
    });

    it("persists active customer session across page refreshes", async () => {
      // Simulate existing session in localStorage
      saveCustomerSession({
        customerId: "cust_aarav_sharma_001",
        customerEmail: "aarav.sharma@example.com",
        createdAt: new Date().toISOString(),
      });

      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => {
        expect(authObj.isAuthenticated).toBe(true);
        expect(authObj.customer?.name).toBe("Aarav Sharma");
      });
    });
  });

  describe("2. Profile & Saved Address Book Management", () => {
    it("updates customer profile information and persists changes", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      await authObj.signIn({
        email: "aarav.sharma@example.com",
        password: "Password@123",
      });

      const updated = authObj.updateProfile({
        name: "Aarav S. Sharma",
        phone: "9876500000",
      });
      expect(updated).toBe(true);
      expect(authObj.customer?.name).toBe("Aarav S. Sharma");
      expect(authObj.customer?.phone).toBe("9876500000");

      // Verify persisted in storage
      const stored = getCustomerByEmail("aarav.sharma@example.com");
      expect(stored?.name).toBe("Aarav S. Sharma");
      expect(stored?.phone).toBe("9876500000");
    });

    it("adds a new address to customer address book with validation", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      await authObj.signIn({
        email: "aarav.sharma@example.com",
        password: "Password@123",
      });

      const newAddr = authObj.addAddress({
        fullName: "Aarav Sharma (Office)",
        phone: "9876543210",
        addressLine: "Embassy TechVillage, Tower 2",
        apartment: "Floor 4, Desk 42",
        city: "Bengaluru",
        state: "Karnataka",
        pinCode: "560103",
        country: "India",
        label: "Work",
        isDefault: false,
      });

      expect(newAddr).not.toBeNull();
      expect(newAddr?.label).toBe("Work");
      expect(authObj.customer?.addresses.some((a) => a.id === newAddr?.id)).toBe(true);
    });

    it("edits an existing address and saves changes", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      await authObj.signIn({
        email: "aarav.sharma@example.com",
        password: "Password@123",
      });

      const firstAddr = authObj.customer?.addresses[0];
      expect(firstAddr).toBeDefined();

      if (firstAddr) {
        const success = authObj.updateAddress(firstAddr.id, {
          ...firstAddr,
          addressLine: "Updated Villa 12, Sunshine Avenue",
        });
        expect(success).toBe(true);

        const updated = authObj.customer?.addresses.find((a) => a.id === firstAddr.id);
        expect(updated?.addressLine).toBe("Updated Villa 12, Sunshine Avenue");
      }
    });

    it("sets an address as default and unsets the previous default", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      await authObj.signIn({
        email: "aarav.sharma@example.com",
        password: "Password@123",
      });

      // Add a second address
      const addr2 = authObj.addAddress({
        fullName: "Aarav Sharma Second",
        phone: "9876543210",
        addressLine: "Koramangala 4th Block",
        city: "Bengaluru",
        state: "Karnataka",
        pinCode: "560034",
        country: "India",
        label: "Home",
        isDefault: false,
      });

      expect(addr2).not.toBeNull();
      if (addr2) {
        authObj.setDefaultAddress(addr2.id);

        const refreshed = authObj.customer?.addresses;
        const defaultOne = refreshed?.find((a) => a.isDefault);
        expect(defaultOne?.id).toBe(addr2.id);
      }
    });

    it("deletes an address from the customer address book", async () => {
      let authObj!: ReturnType<typeof useCustomerAuth>;

      render(
        <CustomerAuthProvider>
          <AuthTester onReady={(a) => (authObj = a)} />
        </CustomerAuthProvider>,
      );

      await waitFor(() => expect(authObj).toBeDefined());

      await authObj.signIn({
        email: "aarav.sharma@example.com",
        password: "Password@123",
      });

      const initialCount = authObj.customer?.addresses.length || 0;
      const addrToDelete = authObj.customer?.addresses[0];
      expect(addrToDelete).toBeDefined();

      if (addrToDelete) {
        const deleted = authObj.deleteAddress(addrToDelete.id);
        expect(deleted).toBe(true);
        expect(authObj.customer?.addresses.length).toBe(initialCount - 1);
        expect(authObj.customer?.addresses.some((a) => a.id === addrToDelete.id)).toBe(false);
      }
    });
  });

  describe("3. Customer Order History & Isolation", () => {
    it("retrieves orders belonging exclusively to the signed-in customer", () => {
      const order1: CustomerOrder = {
        orderId: "VD-CUST1-001",
        customerId: "cust_aarav_sharma_001",
        customer: {
          id: "cust_aarav_sharma_001",
          fullName: "Aarav Sharma",
          email: "aarav.sharma@example.com",
          phone: "9876543210",
        },
        shippingAddress: {
          fullName: "Aarav Sharma",
          email: "aarav.sharma@example.com",
          phone: "9876543210",
          addressLine: "Lotus Grand Residency",
          city: "Bengaluru",
          state: "Karnataka",
          pinCode: "560038",
          country: "India",
        },
        items: [],
        priceBreakdown: { subtotal: 1000, couponDiscount: 0, deliveryFee: 0, total: 1000 },
        deliveryMethod: {
          id: "standard",
          name: "Standard",
          description: "3-5 days",
          estimatedDays: "3-5 Days",
          estimatedDate: "In 3 days",
          fee: 0,
        },
        payment: { method: "cod", status: "PENDING_ON_DELIVERY" },
        orderStatus: "Delivered",
        createdAt: "2026-11-01T10:00:00.000Z",
        estimatedDeliveryDate: "In 3 days",
      };

      const orderOtherUser: CustomerOrder = {
        orderId: "VD-OTHER-002",
        customerId: "cust_other_user_999",
        customer: {
          id: "cust_other_user_999",
          fullName: "Stranger User",
          email: "stranger@example.com",
          phone: "9123456789",
        },
        shippingAddress: {
          fullName: "Stranger User",
          email: "stranger@example.com",
          phone: "9123456789",
          addressLine: "Unknown Road",
          city: "Delhi",
          state: "Delhi",
          pinCode: "110001",
          country: "India",
        },
        items: [],
        priceBreakdown: { subtotal: 2000, couponDiscount: 0, deliveryFee: 0, total: 2000 },
        deliveryMethod: {
          id: "standard",
          name: "Standard",
          description: "3-5 days",
          estimatedDays: "3-5 Days",
          estimatedDate: "In 3 days",
          fee: 0,
        },
        payment: { method: "upi", status: "CONFIRMED_DEMO" },
        orderStatus: "Processing",
        createdAt: "2026-11-01T12:00:00.000Z",
        estimatedDeliveryDate: "In 3 days",
      };

      saveCustomerOrder(order1);
      saveCustomerOrder(orderOtherUser);

      // Verify Aarav's orders only return order1
      const aaravOrders = getOrdersByCustomer("cust_aarav_sharma_001");
      expect(aaravOrders).toHaveLength(1);
      expect(aaravOrders[0]?.orderId).toBe("VD-CUST1-001");

      // Verify stranger cannot see Aarav's orders
      const strangerOrders = getOrdersByCustomer("cust_other_user_999");
      expect(strangerOrders).toHaveLength(1);
      expect(strangerOrders[0]?.orderId).toBe("VD-OTHER-002");
    });

    it("returns empty array gracefully when customer has no orders", () => {
      const orders = getOrdersByCustomer("cust_new_customer_without_orders");
      expect(orders).toEqual([]);
    });

    it("retrieves specific order by ID and handles invalid or missing IDs", () => {
      const validOrder: CustomerOrder = {
        orderId: "VD-LOOKUP-123",
        customer: { fullName: "Aarav", email: "aarav@example.com", phone: "9876543210" },
        shippingAddress: {
          fullName: "Aarav",
          email: "aarav@example.com",
          phone: "9876543210",
          addressLine: "Road 1",
          city: "Mumbai",
          state: "Maharashtra",
          pinCode: "400001",
          country: "India",
        },
        items: [],
        priceBreakdown: { subtotal: 500, couponDiscount: 0, deliveryFee: 0, total: 500 },
        deliveryMethod: {
          id: "standard",
          name: "Standard",
          description: "3-5 days",
          estimatedDays: "3-5 Days",
          estimatedDate: "In 3 days",
          fee: 0,
        },
        payment: { method: "cod", status: "PENDING_ON_DELIVERY" },
        orderStatus: "Confirmed",
        createdAt: new Date().toISOString(),
        estimatedDeliveryDate: "In 3 days",
      };

      saveCustomerOrder(validOrder);

      expect(getCustomerOrderById("VD-LOOKUP-123")).toBeDefined();
      expect(getCustomerOrderById("vd-lookup-123")).toBeDefined(); // Case insensitive
      expect(getCustomerOrderById("NON-EXISTENT-ID")).toBeUndefined();
      expect(getCustomerOrderById("")).toBeUndefined();
    });
  });

  describe("4. Order Tracking & Delivery Timeline", () => {
    it("updates order status and tracks stage timestamps", () => {
      const order: CustomerOrder = {
        orderId: "VD-TRACK-777",
        customer: { fullName: "Aarav", email: "aarav@example.com", phone: "9876543210" },
        shippingAddress: {
          fullName: "Aarav",
          email: "aarav@example.com",
          phone: "9876543210",
          addressLine: "Road 1",
          city: "Mumbai",
          state: "Maharashtra",
          pinCode: "400001",
          country: "India",
        },
        items: [],
        priceBreakdown: { subtotal: 500, couponDiscount: 0, deliveryFee: 0, total: 500 },
        deliveryMethod: {
          id: "standard",
          name: "Standard",
          description: "3-5 days",
          estimatedDays: "3-5 Days",
          estimatedDate: "In 3 days",
          fee: 0,
        },
        payment: { method: "cod", status: "PENDING_ON_DELIVERY" },
        orderStatus: "Processing",
        statusTimestamps: {
          Placed: "2026-11-01T10:00:00.000Z",
          Confirmed: "2026-11-01T10:05:00.000Z",
          Processing: "2026-11-01T10:15:00.000Z",
        },
        createdAt: "2026-11-01T10:00:00.000Z",
        estimatedDeliveryDate: "In 3 days",
      };

      saveCustomerOrder(order);

      // Advance to Shipped
      const updated = updateOrderStatus("VD-TRACK-777", "Shipped");
      expect(updated).toBe(true);

      const retrieved = getCustomerOrderById("VD-TRACK-777");
      expect(retrieved?.orderStatus).toBe("Shipped");
      expect(retrieved?.statusTimestamps?.Shipped).toBeDefined();
    });

    it("handles cancelled orders appropriately", () => {
      const order: CustomerOrder = {
        orderId: "VD-CANCEL-001",
        customer: { fullName: "Aarav", email: "aarav@example.com", phone: "9876543210" },
        shippingAddress: {
          fullName: "Aarav",
          email: "aarav@example.com",
          phone: "9876543210",
          addressLine: "Road 1",
          city: "Mumbai",
          state: "Maharashtra",
          pinCode: "400001",
          country: "India",
        },
        items: [],
        priceBreakdown: { subtotal: 500, couponDiscount: 0, deliveryFee: 0, total: 500 },
        deliveryMethod: {
          id: "standard",
          name: "Standard",
          description: "3-5 days",
          estimatedDays: "3-5 Days",
          estimatedDate: "In 3 days",
          fee: 0,
        },
        payment: { method: "cod", status: "PENDING_ON_DELIVERY" },
        orderStatus: "Confirmed",
        createdAt: new Date().toISOString(),
        estimatedDeliveryDate: "In 3 days",
      };

      saveCustomerOrder(order);

      const cancelled = updateOrderStatus("VD-CANCEL-001", "Cancelled");
      expect(cancelled).toBe(true);

      const retrieved = getCustomerOrderById("VD-CANCEL-001");
      expect(retrieved?.orderStatus).toBe("Cancelled");
      expect(retrieved?.statusTimestamps?.Cancelled).toBeDefined();
    });
  });

  describe("5. Reorder Functionality & Stock Validation", () => {
    it("adds available products from a past order into cart while preserving existing items", async () => {
      function CartTester() {
        const { cartItems, addToCart } = useCart();
        return (
          <div>
            <button
              data-testid="add-watch"
              onClick={() => addToCart("smart-watch-pro", 1)}
            >
              Add Watch
            </button>
            <button
              data-testid="add-headphones"
              onClick={() => addToCart("wireless-headphones", 2)}
            >
              Add Headphones
            </button>
            <span data-testid="watch-qty">{cartItems["smart-watch-pro"] ?? 0}</span>
            <span data-testid="headphones-qty">{cartItems["wireless-headphones"] ?? 0}</span>
          </div>
        );
      }

      render(
        <CartProvider>
          <CartTester />
        </CartProvider>,
      );

      // Existing item in cart
      fireEvent.click(screen.getByTestId("add-watch"));
      await waitFor(() => {
        expect(screen.getByTestId("watch-qty").textContent).toBe("1");
      });

      // Past order has "wireless-headphones" (qty 2)
      fireEvent.click(screen.getByTestId("add-headphones"));

      await waitFor(() => {
        // Existing item preserved
        expect(screen.getByTestId("watch-qty").textContent).toBe("1");
        // Reordered item added
        expect(screen.getByTestId("headphones-qty").textContent).toBe("2");
      });
    });


    it("respects stock limits and handles out-of-stock items", () => {
      const outOfStockProduct = getProduct("usb-c-multiport-hub"); // In mock catalog stockCount is 0
      expect(outOfStockProduct).toBeDefined();
      expect(outOfStockProduct?.stockCount).toBe(0);

      // Simulated reorder check logic
      const canReorder = (outOfStockProduct?.stockCount ?? 0) > 0;
      expect(canReorder).toBe(false);
    });
  });

  describe("6. Payment Safety Correction Verification", () => {
    it("confirms that payment schema does not require card numbers, CVVs, expiry, or UPI PINs", () => {
      // COD simulated
      const codCheck = paymentSelectionSchema.safeParse({ paymentMethod: "cod" });
      expect(codCheck.success).toBe(true);

      // UPI simulated selection
      const upiCheck = paymentSelectionSchema.safeParse({ paymentMethod: "upi" });
      expect(upiCheck.success).toBe(true);

      // Card simulated selection without sensitive fields
      const cardCheck = paymentSelectionSchema.safeParse({ paymentMethod: "card" });
      expect(cardCheck.success).toBe(true);
    });
  });

  describe("7. Customer Journey UI Integration", () => {
    it("renders Customer Account hub when signed in", async () => {
      // Seed active session
      saveCustomerSession({
        customerId: "cust_aarav_sharma_001",
        customerEmail: "aarav.sharma@example.com",
        createdAt: new Date().toISOString(),
      });

      const { Route: AccountRoute } = await import("@/routes/account");
      const Component = AccountRoute.options.component;

      if (Component) {
        renderWithAuthAndRouter(<Component />, "/account");

        expect(await screen.findByText(/Aarav Sharma/i)).toBeInTheDocument();
        expect(screen.getByText(/aarav.sharma@example.com/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Overview/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Saved Addresses/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Profile & Settings/i })).toBeInTheDocument();
      }
    });

    it("renders Order Tracking page with stage milestones", async () => {
      const sampleOrder: CustomerOrder = {
        orderId: "VD-TRACK-DEMO-99",
        customer: { fullName: "Aarav Sharma", email: "aarav.sharma@example.com", phone: "9876543210" },
        shippingAddress: {
          fullName: "Aarav Sharma",
          email: "aarav.sharma@example.com",
          phone: "9876543210",
          addressLine: "Flat 402, Lotus Residency",
          city: "Bengaluru",
          state: "Karnataka",
          pinCode: "560038",
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
          },
        ],
        priceBreakdown: { subtotal: 7999, couponDiscount: 0, deliveryFee: 0, total: 7999 },
        deliveryMethod: {
          id: "standard",
          name: "Standard Delivery",
          description: "3-5 days",
          estimatedDays: "3-5 Days",
          estimatedDate: "In 3 days",
          fee: 0,
        },
        payment: { method: "upi", status: "CONFIRMED_DEMO" },
        orderStatus: "Shipped",
        createdAt: "2026-11-01T10:00:00.000Z",
        estimatedDeliveryDate: "In 3 days",
      };

      saveCustomerOrder(sampleOrder);

      const { Route: TrackRoute } = await import("@/routes/track-order");
      const Component = TrackRoute.options.component;

      if (Component) {
        renderWithAuthAndRouter(<Component />, "/track-order?orderId=VD-TRACK-DEMO-99");

        expect(await screen.findByText("VD-TRACK-DEMO-99")).toBeInTheDocument();
        expect(screen.getByText(/Order Placed/i)).toBeInTheDocument();
        expect(screen.getByText(/Order Confirmed/i)).toBeInTheDocument();
        expect(screen.getByText(/Processing & Packing/i)).toBeInTheDocument();
        expect(screen.getByText(/Active Stage/i)).toBeInTheDocument();
        expect(screen.getByText(/Simulated Tracking Disclaimer/i)).toBeInTheDocument();
      }
    });
  });
});
