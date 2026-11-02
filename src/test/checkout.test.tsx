import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
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
import { CustomerAuthProvider } from "@/lib/customer-context";
import {
  CUSTOMER_ORDERS_STORAGE_KEY,
  CHECKOUT_DRAFT_STORAGE_KEY,
  generateOrderId,
  getDeliveryMethods,
  getCustomerOrders,
  getCustomerOrderById,
  saveCustomerOrder,
  saveCheckoutDraft,
  getCheckoutDraft,
  clearCheckoutDraft,
} from "@/lib/order-storage";
import {
  shippingAddressSchema,
  paymentSelectionSchema,
  INDIAN_STATES,
} from "@/lib/checkout-schema";
import type { CustomerOrder } from "@/lib/order-types";
import { products, getProduct } from "@/data/products";

// Helper test harness for TanStack Router with CartProvider
function renderWithCartAndRouter(
  ui: React.ReactElement,
  initialCart?: Record<string, number>,
  initialCoupon?: string | null,
) {
  if (initialCart) {
    window.localStorage.setItem(
      "vendora-cart-v1",
      JSON.stringify({
        items: initialCart,
        wishlist: [],
        coupon: initialCoupon ?? null,
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
  const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/checkout" });
  const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: "/cart" });
  const shopRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shop" });
  const confirmRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/order-confirmation/$id",
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    checkoutRoute,
    cartRoute,
    shopRoute,
    confirmRoute,
  ]);
  const history = createMemoryHistory({ initialEntries: ["/checkout"] });
  const router = createRouter({ routeTree, history });

  return render(<RouterProvider router={router} />);
}

describe("PROMPT 5: Complete Checkout & Order Placement", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("1. Order ID Generation & Storage Helpers", () => {
    it("generates unique demo order IDs with 'VD-' prefix", () => {
      const id1 = generateOrderId();
      const id2 = generateOrderId();

      expect(id1).toMatch(/^VD-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(id2).toMatch(/^VD-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it("provides standard (free) and express (₹149) delivery options", () => {
      const methods = getDeliveryMethods();
      expect(methods).toHaveLength(2);

      const standard = methods.find((m) => m.id === "standard");
      expect(standard).toBeDefined();
      expect(standard?.fee).toBe(0);
      expect(standard?.estimatedDays).toBe("3–5 Days");

      const express = methods.find((m) => m.id === "express");
      expect(express).toBeDefined();
      expect(express?.fee).toBe(149);
      expect(express?.estimatedDays).toBe("1–2 Days");
    });

    it("saves and retrieves customer orders from localStorage safely", () => {
      const sampleOrder: CustomerOrder = {
        orderId: "VD-TEST-001",
        customer: {
          fullName: "Aarav Mehta",
          email: "aarav@example.com",
          phone: "9876543210",
        },
        shippingAddress: {
          fullName: "Aarav Mehta",
          email: "aarav@example.com",
          phone: "9876543210",
          addressLine: "Flat 101, Lakeview Apartments",
          city: "Bengaluru",
          state: "Karnataka",
          pinCode: "560001",
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
        priceBreakdown: {
          subtotal: 7999,
          couponCode: null,
          couponDiscount: 0,
          deliveryFee: 0,
          total: 7999,
        },
        deliveryMethod: {
          id: "standard",
          name: "Standard Delivery",
          description: "Reliable doorstep delivery in 3–5 business days",
          estimatedDays: "3–5 Days",
          estimatedDate: "In 4 business days",
          fee: 0,
        },
        payment: {
          method: "cod",
          status: "PENDING_ON_DELIVERY",
        },
        orderStatus: "Confirmed",
        createdAt: new Date().toISOString(),
        estimatedDeliveryDate: "In 4 business days",
      };

      const saveSuccess = saveCustomerOrder(sampleOrder);
      expect(saveSuccess).toBe(true);

      const storedOrders = getCustomerOrders();
      expect(storedOrders).toHaveLength(1);
      expect(storedOrders[0]?.orderId).toBe("VD-TEST-001");

      const found = getCustomerOrderById("VD-TEST-001");
      expect(found).toBeDefined();
      expect(found?.customer.fullName).toBe("Aarav Mehta");
      expect(found?.priceBreakdown.total).toBe(7999);
    });

    it("handles corrupted or empty localStorage gracefully without throwing", () => {
      window.localStorage.setItem(CUSTOMER_ORDERS_STORAGE_KEY, "invalid-json{{");
      expect(getCustomerOrders()).toEqual([]);
      expect(getCustomerOrderById("VD-NON-EXISTENT")).toBeUndefined();
    });

    it("saves, loads, and clears checkout draft in localStorage", () => {
      saveCheckoutDraft({
        step: 2,
        shippingAddress: {
          fullName: "Rohan Patel",
          city: "Ahmedabad",
        },
        deliveryMethodId: "express",
        paymentMethod: "upi",
        paymentForm: { paymentMethod: "upi" },
        updatedAt: new Date().toISOString(),
      });

      const draft = getCheckoutDraft();
      expect(draft).not.toBeNull();
      expect(draft?.step).toBe(2);
      expect(draft?.shippingAddress.fullName).toBe("Rohan Patel");
      expect(draft?.deliveryMethodId).toBe("express");
      expect(draft?.paymentForm?.paymentMethod).toBe("upi");


      clearCheckoutDraft();
      expect(getCheckoutDraft()).toBeNull();
    });
  });

  describe("2. Schema Validation (Address & Payment)", () => {
    it("validates valid shipping address values successfully", () => {
      const validAddress = {
        fullName: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "9876543210",
        addressLine: "402 Sunshine Heights, MG Road",
        apartment: "Tower B, 4th Floor",
        city: "Mumbai",
        state: "Maharashtra",
        pinCode: "400001",
        country: "India",
      };

      const result = shippingAddressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it("rejects invalid emails, phones, and Indian PIN codes with clear messages", () => {
      // Invalid email
      const badEmail = shippingAddressSchema.safeParse({
        fullName: "Priya",
        email: "not-an-email",
        phone: "9876543210",
        addressLine: "402 Sunshine Heights",
        city: "Mumbai",
        state: "Maharashtra",
        pinCode: "400001",
        country: "India",
      });
      expect(badEmail.success).toBe(false);
      if (!badEmail.success) {
        expect(badEmail.error.issues[0]?.message).toContain("valid email");
      }

      // Invalid 10-digit Indian phone (e.g. 5 digits or starting with 1)
      const badPhone = shippingAddressSchema.safeParse({
        fullName: "Priya",
        email: "priya@example.com",
        phone: "12345",
        addressLine: "402 Sunshine Heights",
        city: "Mumbai",
        state: "Maharashtra",
        pinCode: "400001",
        country: "India",
      });
      expect(badPhone.success).toBe(false);
      if (!badPhone.success) {
        expect(badPhone.error.issues[0]?.message).toContain("10-digit mobile number");
      }

      // Invalid Indian PIN code (e.g. starts with 0 or has 4 digits)
      const badPin = shippingAddressSchema.safeParse({
        fullName: "Priya",
        email: "priya@example.com",
        phone: "9876543210",
        addressLine: "402 Sunshine Heights",
        city: "Mumbai",
        state: "Maharashtra",
        pinCode: "012345",
        country: "India",
      });
      expect(badPin.success).toBe(false);
      if (!badPin.success) {
        expect(badPin.error.issues[0]?.message).toContain("6-digit Indian PIN code");
      }
    });

    it("validates COD payment without requiring sensitive fields", () => {
      const codResult = paymentSelectionSchema.safeParse({
        paymentMethod: "cod",
      });
      expect(codResult.success).toBe(true);
    });

    it("validates UPI payment as simulated demo selection without requiring sensitive credentials", () => {
      const upiResult = paymentSelectionSchema.safeParse({
        paymentMethod: "upi",
      });
      expect(upiResult.success).toBe(true);
    });

    it("validates Card payment as simulated demo selection without collecting card numbers, CVV, or expiry", () => {
      const cardResult = paymentSelectionSchema.safeParse({
        paymentMethod: "card",
      });
      expect(cardResult.success).toBe(true);
    });
  });

  describe("3. Price & Discount Calculations Consistency", () => {
    it("accurately calculates subtotal, coupon discount, delivery fee, and final total", () => {
      const p1 = getProduct("wireless-headphones");
      const p2 = getProduct("smart-watch-pro");
      expect(p1).toBeDefined();
      expect(p2).toBeDefined();

      if (p1 && p2) {
        const subtotal = p1.price * 1 + p2.price * 2;
        expect(subtotal).toBe(11279);

        // VENDORA10 gives 10% off
        const discount = Math.round(subtotal * 0.1);
        expect(discount).toBe(1128);

        // Express shipping fee
        const expressFee = 149;
        const total = subtotal + expressFee - discount;
        expect(total).toBe(10300);
      }
    });
  });

  describe("4. Cart Page Checkout Navigation & Empty State", () => {
    it("renders empty cart state with back-to-shopping link when cart is empty", async () => {
      const { Route: CartRoute } = await import("@/routes/cart");
      const Component = CartRoute.options.component;

      if (Component) {
        renderWithCartAndRouter(<Component />, {});
        const emptyHeading = await screen.findByText(/Your cart is empty/i);
        expect(emptyHeading).toBeInTheDocument();

        const shoppingLink = screen.getByRole("link", { name: /Start Shopping/i });
        expect(shoppingLink).toBeInTheDocument();
        expect(shoppingLink.getAttribute("href")).toBe("/shop");
      }
    });

    it("renders checkout button linking to /checkout when items are present in cart", async () => {
      const { Route: CartRoute } = await import("@/routes/cart");
      const Component = CartRoute.options.component;

      if (Component) {
        renderWithCartAndRouter(<Component />, { "wireless-headphones": 1 });

        const checkoutBtn = await screen.findByRole("link", { name: /Proceed to Checkout/i });
        expect(checkoutBtn).toBeInTheDocument();
        expect(checkoutBtn.getAttribute("href")).toBe("/checkout");
      }
    });
  });

  describe("5. Checkout Route Multi-Step Flow & Order Placement", () => {
    it("renders empty cart message on /checkout when no items are in cart", async () => {
      const { Route: CheckoutRoute } = await import("@/routes/checkout");
      const Component = CheckoutRoute.options.component;

      if (Component) {
        renderWithCartAndRouter(<Component />, {});

        const emptyMessage = await screen.findByText(/Your Cart is Empty/i);
        expect(emptyMessage).toBeInTheDocument();

        const exploreLink = screen.getByRole("link", { name: /Explore Marketplace/i });
        expect(exploreLink).toBeInTheDocument();
        expect(exploreLink.getAttribute("href")).toBe("/shop");
      }
    });

    it("renders multi-step progress bar and initial Delivery Info form with cart items", async () => {
      const { Route: CheckoutRoute } = await import("@/routes/checkout");
      const Component = CheckoutRoute.options.component;

      if (Component) {
        renderWithCartAndRouter(<Component />, { "wireless-headphones": 1 });

        // Check step heading
        expect(
          await screen.findByRole("heading", { name: /1\. Delivery Information/i }),
        ).toBeInTheDocument();

        // Check progress bar steps exist
        const progressNav = screen.getByRole("navigation", { name: /Checkout Progress/i });
        expect(progressNav).toBeInTheDocument();
        expect(screen.getAllByText(/Payment/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/Review Order/i)).toBeInTheDocument();

        // Check address fields
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/PIN Code/i)).toBeInTheDocument();

        // Check order summary sidebar
        expect(screen.getByText(/Order Summary/i)).toBeInTheDocument();
        expect(screen.getByText(/Wireless Over-Ear ANC Headphones/i)).toBeInTheDocument();
      }
    });

    it("validates required address fields before advancing to delivery method", async () => {
      const { Route: CheckoutRoute } = await import("@/routes/checkout");
      const Component = CheckoutRoute.options.component;

      if (Component) {
        renderWithCartAndRouter(<Component />, { "wireless-headphones": 1 });

        const submitBtn = await screen.findByRole("button", {
          name: /Continue to Delivery Method/i,
        });
        fireEvent.click(submitBtn);

        // Validation messages should appear
        await waitFor(() => {
          expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument();
          expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
          expect(
            screen.getByText(/Please enter a valid 10-digit mobile number/i),
          ).toBeInTheDocument();
          expect(
            screen.getByText(/Street address must be at least 5 characters/i),
          ).toBeInTheDocument();
        });
      }
    });

    it("displays out-of-stock warning banner when cart contains unavailable products", async () => {
      const { Route: CheckoutRoute } = await import("@/routes/checkout");
      const Component = CheckoutRoute.options.component;

      if (Component) {
        // "usb-c-multiport-hub" has stockCount: 0 in the catalog
        renderWithCartAndRouter(<Component />, { "usb-c-multiport-hub": 1 });

        const warningBanner = await screen.findByText(/Items Unavailable or Out of Stock/i);
        expect(warningBanner).toBeInTheDocument();
        expect(
          screen.getAllByText(/7-in-1 Aluminum Dual-Display USB-C Hub/i).length,
        ).toBeGreaterThanOrEqual(1);
      }
    });

    it("restores checkout draft from localStorage on refresh", async () => {
      // Pre-populate draft at step 2 with saved address
      saveCheckoutDraft({
        step: 2,
        shippingAddress: {
          fullName: "Ananya Deshmukh",
          email: "ananya@example.com",
          phone: "9876543210",
          addressLine: "12 Marine Lines",
          city: "Mumbai",
          state: "Maharashtra",
          pinCode: "400020",
          country: "India",
        },
        deliveryMethodId: "express",
        paymentMethod: "cod",
        paymentForm: { upiId: "", cardholderName: "", cardNumber: "", cardExpiry: "", cardCvv: "" },
        updatedAt: new Date().toISOString(),
      });

      const { Route: CheckoutRoute } = await import("@/routes/checkout");
      const Component = CheckoutRoute.options.component;

      if (Component) {
        renderWithCartAndRouter(<Component />, { "wireless-headphones": 1 });

        // Step 2 heading should be immediately displayed
        expect(
          await screen.findByRole("heading", { name: /2\. Select Delivery Method/i }),
        ).toBeInTheDocument();
        expect(screen.getByText(/Express Priority Delivery/i)).toBeInTheDocument();
      }
    });
  });

  describe("6. Order Confirmation Page View", () => {
    it("renders Order Not Found when order ID does not exist in persistence", async () => {
      const { Route: ConfirmationRoute } = await import("@/routes/order-confirmation.$id");
      const Component = ConfirmationRoute.options.component;

      if (Component) {
        // Mock loader data for non-existent order
        vi.spyOn(ConfirmationRoute, "useLoaderData").mockReturnValue({
          order: undefined,
          orderId: "VD-MISSING-123",
        });

        renderWithCartAndRouter(<Component />);

        expect(await screen.findByText(/Order Not Found/i)).toBeInTheDocument();
        expect(screen.getByText(/VD-MISSING-123/i)).toBeInTheDocument();
      }
    });

    it("renders complete receipt when order exists in persistence", async () => {
      const { Route: ConfirmationRoute } = await import("@/routes/order-confirmation.$id");
      const Component = ConfirmationRoute.options.component;

      const mockOrder: CustomerOrder = {
        orderId: "VD-CONFIRM-999",
        customer: {
          fullName: "Sneha Rao",
          email: "sneha@example.com",
          phone: "9876543210",
        },
        shippingAddress: {
          fullName: "Sneha Rao",
          email: "sneha@example.com",
          phone: "9876543210",
          addressLine: "Flat 204, Palm Grove",
          city: "Pune",
          state: "Maharashtra",
          pinCode: "411001",
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
        priceBreakdown: {
          subtotal: 7999,
          couponCode: "VENDORA10",
          couponDiscount: 800,
          deliveryFee: 149,
          total: 7348,
        },
        deliveryMethod: {
          id: "express",
          name: "Express Priority Delivery",
          description: "Guaranteed express dispatch in 1–2 business days",
          estimatedDays: "1–2 Days",
          estimatedDate: "In 2 business days",
          fee: 149,
        },
        payment: {
          method: "upi",
          status: "CONFIRMED_DEMO",
          upiId: "sneha@okhdfcbank",
        },
        orderStatus: "Confirmed",
        createdAt: "2026-11-02T10:00:00.000Z",
        estimatedDeliveryDate: "In 2 business days",
      };

      if (Component) {
        vi.spyOn(ConfirmationRoute, "useLoaderData").mockReturnValue({
          order: mockOrder,
          orderId: mockOrder.orderId,
        });

        renderWithCartAndRouter(<Component />);

        expect(await screen.findByText(/Thank you, Sneha!/i)).toBeInTheDocument();
        expect(screen.getByText("VD-CONFIRM-999")).toBeInTheDocument();
        expect(screen.getByText(/Demo Order Placed Successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/Express Priority Delivery/i)).toBeInTheDocument();
        expect(screen.getByText(/UPI Payment \(Demo\)/i)).toBeInTheDocument();
        expect(screen.getByText("sneha@okhdfcbank")).toBeInTheDocument();
        expect(screen.getByText("Flat 204, Palm Grove")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Continue Shopping/i })).toBeInTheDocument();
      }
    });
  });
});
