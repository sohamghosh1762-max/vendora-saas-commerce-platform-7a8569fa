import { describe, expect, it, beforeEach } from "vitest";
import {
  checkEmailAvailability,
  checkSlugAvailability,
  generateSlug,
  loginVendor,
  registerVendor,
  getVendorStore,
  getVendorProducts,
  addVendorProduct,
  deleteVendorProduct,
} from "@/lib/vendor-api";
import { hashPassword, verifyPassword } from "@/lib/vendor-crypto";
import type { OnboardingData } from "@/lib/vendor-types";

describe("Vendor Onboarding & Auth", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  it("hashes passwords securely and verifies them with salt", async () => {
    const salt = "test_salt_123";
    const password = "mySecretPassword";
    const hash = await hashPassword(password, salt);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(16);

    const isValid = await verifyPassword(password, hash, salt);
    expect(isValid).toBe(true);

    const isWrong = await verifyPassword("wrongPass", hash, salt);
    expect(isWrong).toBe(false);
  });

  it("generates clean URL-friendly store slugs", () => {
    expect(generateSlug("Aura Artisan Goods")).toBe("aura-artisan-goods");
    expect(generateSlug("Tech & Gadgets 2026!")).toBe("tech-gadgets-2026");
    expect(generateSlug("   Multiple   Spaces   ")).toBe("multiple-spaces");
  });

  it("rejects registration with missing required fields", async () => {
    const invalidData: OnboardingData = {
      fullName: "",
      email: "invalid-email",
      phone: "",
      password: "123",
      confirmPassword: "456",
      agreeTerms: false,
      storeName: "",
      storeSlug: "",
      category: "",
      description: "",
      storePhone: "",
      storeEmail: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      businessType: "",
      returnPolicy: "",
      shippingMethod: "",
      processingTime: "",
      supportEmail: "",
    };

    const res = await registerVendor(invalidData);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("successfully registers a new vendor and creates their store", async () => {
    const validData: OnboardingData = {
      fullName: "Maya Sen",
      email: "maya@auragoods.in",
      phone: "+91 99887 76655",
      password: "strongPassword123",
      confirmPassword: "strongPassword123",
      agreeTerms: true,
      storeName: "Aura Goods",
      storeSlug: "aura-goods",
      category: "home-living",
      description: "Handmade ceramic homeware and pottery for conscious living.",
      storePhone: "+91 99887 76655",
      storeEmail: "contact@auragoods.in",
      address: "42 Indiranagar 100ft Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      businessType: "Sole Proprietorship",
      returnPolicy: "14-Day Returns",
      shippingMethod: "Vendora Logistics",
      processingTime: "1-2 Business Days",
      supportEmail: "support@auragoods.in",
    };

    const res = await registerVendor(validData);
    expect(res.success).toBe(true);
    expect(res.session).toBeDefined();
    expect(res.session?.vendor.email).toBe("maya@auragoods.in");
    expect(res.session?.vendor.role).toBe("vendor");
    expect(res.session?.store.slug).toBe("aura-goods");
    expect(res.session?.store.status).toBe("ACTIVE");

    // Check slug is no longer available
    const slugAvail = await checkSlugAvailability("aura-goods");
    expect(slugAvail).toBe(false);

    // Check duplicate email registration is rejected
    const dupRes = await registerVendor(validData);
    expect(dupRes.success).toBe(false);
    expect(dupRes.error).toContain("already exists");
  });

  it("allows newly registered vendor to log in", async () => {
    const validData: OnboardingData = {
      fullName: "Rajesh Kumar",
      email: "rajesh@crafts.in",
      phone: "+91 91234 56789",
      password: "secretPassword123",
      confirmPassword: "secretPassword123",
      agreeTerms: true,
      storeName: "Rajesh Crafts",
      storeSlug: "rajesh-crafts",
      category: "fashion",
      description: "Traditional hand-woven textiles and sustainable clothing.",
      storePhone: "+91 91234 56789",
      storeEmail: "rajesh@crafts.in",
      address: "12 Gandhi Bazaar",
      city: "Mysuru",
      state: "Karnataka",
      postalCode: "570001",
      businessType: "Independent Artisan",
      returnPolicy: "7-Day Easy Returns",
      shippingMethod: "Vendora Logistics",
      processingTime: "Same Day Dispatch",
      supportEmail: "support@crafts.in",
    };

    await registerVendor(validData);

    // Try with wrong password
    const failLogin = await loginVendor("rajesh@crafts.in", "wrongPassword");
    expect(failLogin.success).toBe(false);
    expect(failLogin.error).toContain("Incorrect password");

    // Try with correct password
    const successLogin = await loginVendor("rajesh@crafts.in", "secretPassword123");
    expect(successLogin.success).toBe(true);
    expect(successLogin.session?.vendor.fullName).toBe("Rajesh Kumar");
    expect(successLogin.session?.store.name).toBe("Rajesh Crafts");
  });

  it("manages products for vendor store", () => {
    const storeId = "test-store-123";
    const initialProds = getVendorProducts(storeId);
    expect(initialProds.length).toBe(0);

    const added = addVendorProduct({
      name: "Handcrafted Wooden Lamp",
      storeId,
      storeName: "Test Store",
      category: "home-living",
      price: 1899,
      originalPrice: 2499,
      rating: 5.0,
      reviews: 1,
      image: "https://example.com/lamp.jpg",
      description: "Solid oak lamp with soft warm illumination.",
    });

    expect(added.id).toBeDefined();

    const currentProds = getVendorProducts(storeId);
    expect(currentProds.length).toBe(1);
    expect(currentProds[0]?.name).toBe("Handcrafted Wooden Lamp");

    const deleted = deleteVendorProduct(added.id);
    expect(deleted).toBe(true);

    const afterDelete = getVendorProducts(storeId);
    expect(afterDelete.length).toBe(0);
  });
});
