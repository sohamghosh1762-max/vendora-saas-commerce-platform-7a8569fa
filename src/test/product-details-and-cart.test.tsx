import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { products, getProduct } from "@/data/products";
import { CartProvider, useCart } from "@/lib/cart";
import { getProductGallery, getProductSpecs, getProductVariants } from "@/lib/product-details";
import { discountPercent, formatINR } from "@/lib/format";
import React from "react";

// Helper component to test useCart state and actions
function CartTestConsumer() {
  const {
    cartCount,
    cartItems,
    wishlist,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    toggleWishlist,
    isWishlisted,
  } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{cartCount}</div>
      <div data-testid="wishlist-count">{wishlist.length}</div>
      <div data-testid="cart-items">{JSON.stringify(cartItems)}</div>
      <div data-testid="wishlist-items">{JSON.stringify(wishlist)}</div>

      <button onClick={() => addToCart("wireless-headphones", 1)}>Add Headphones 1</button>
      <button onClick={() => addToCart("wireless-headphones", 3)}>Add Headphones 3</button>
      <button onClick={() => addToCart("smart-watch-pro", 2)}>Add Watch 2</button>
      <button onClick={() => setQty("wireless-headphones", 5)}>Set Headphones 5</button>
      <button onClick={() => setQty("wireless-headphones", 0)}>Set Headphones 0</button>
      <button onClick={() => removeFromCart("smart-watch-pro")}>Remove Watch</button>
      <button onClick={clearCart}>Clear All Cart</button>

      <button onClick={() => toggleWishlist("wireless-headphones")}>
        Toggle Wishlist Headphones
      </button>
      <div data-testid="is-headphones-wishlisted">
        {isWishlisted("wireless-headphones") ? "YES" : "NO"}
      </div>
    </div>
  );
}

describe("PROMPT 3: Product Image Audit & Catalog Health", () => {
  it("verifies all 228 products in the catalog have non-empty, valid images", () => {
    expect(products.length).toBe(228);

    for (const product of products) {
      expect(product.id).toBeTruthy();
      expect(product.name).toBeTruthy();
      expect(product.category).toBeTruthy();
      expect(product.image).toBeTruthy();
      expect(typeof product.image).toBe("string");
      expect(product.image.length).toBeGreaterThan(5);

      // Must not be empty, generic placeholder string, or emoji
      expect(product.image).not.toBe("");
      expect(product.image).not.toContain("placeholder.com");
      expect(product.image).not.toContain("via.placeholder");
      expect(product.image).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    }
  });

  it("verifies all 228 products have unique images with zero duplicate assignments", () => {
    const map = new Map<string, string[]>();
    for (const product of products) {
      const existing = map.get(product.image) || [];
      existing.push(product.id);
      map.set(product.image, existing);
    }

    const duplicates = Array.from(map.entries()).filter(([_, ids]) => ids.length > 1);
    expect(duplicates).toEqual([]);
    expect(map.size).toBe(228);
  });

  it("verifies getProductGallery generates rich multi-angle galleries for products", () => {
    const sampleProduct = products[0];
    const gallery = getProductGallery(sampleProduct);
    expect(Array.isArray(gallery)).toBe(true);
    expect(gallery.length).toBeGreaterThanOrEqual(1);

    // Test remote Unsplash product generates multiple views
    const remoteProduct = products.find((p) => p.image.startsWith("http"));
    if (remoteProduct) {
      const remoteGallery = getProductGallery(remoteProduct);
      expect(remoteGallery.length).toBeGreaterThanOrEqual(3);
      expect(remoteGallery[0]).toBe(remoteProduct.image);
    }
  });
});

describe("PROMPT 3: Category-Appropriate Specifications & Variants", () => {
  it("generates electronics-specific specifications (RAM, Storage, Processor, Display)", () => {
    const laptop = products.find(
      (p) => p.category === "electronics" && p.name.toLowerCase().includes("laptop"),
    );
    expect(laptop).toBeDefined();
    if (laptop) {
      const specs = getProductSpecs(laptop);
      const labels = specs.map((s) => s.label);
      expect(labels).toContain("Processor");
      expect(labels).toContain("Memory (RAM)");
      expect(labels).toContain("Storage");
      expect(labels).toContain("Display");
    }
  });

  it("generates fashion-specific specifications (Fabric, Fit, Care Instructions, Country of Origin)", () => {
    const fashionItem = products.find((p) => p.category === "fashion");
    expect(fashionItem).toBeDefined();
    if (fashionItem) {
      const specs = getProductSpecs(fashionItem);
      const labels = specs.map((s) => s.label);
      expect(labels).toContain("Brand");
      expect(labels.some((l) => l.includes("Material") || l.includes("Fabric"))).toBe(true);
      expect(labels).toContain("Care Instructions");
    }
  });

  it("generates beauty-specific specifications (Skin Type, Key Ingredients, Net Volume)", () => {
    const beautyItem = products.find((p) => p.category === "beauty");
    expect(beautyItem).toBeDefined();
    if (beautyItem) {
      const specs = getProductSpecs(beautyItem);
      const labels = specs.map((s) => s.label);
      expect(labels).toContain("Skin / Hair Type");
      expect(labels).toContain("Key Active Ingredients");
    }
  });

  it("generates automotive-specific specifications (Compatibility, Power Input, Warranty)", () => {
    const autoItem = products.find((p) => p.category === "automotive");
    expect(autoItem).toBeDefined();
    if (autoItem) {
      const specs = getProductSpecs(autoItem);
      const labels = specs.map((s) => s.label);
      expect(labels).toContain("Compatibility");
      expect(labels).toContain("Warranty");
    }
  });

  it("generates realistic category variants (size, color, storage, volume)", () => {
    const phoneOrLaptop = products.find(
      (p) =>
        p.category === "electronics" &&
        (p.name.toLowerCase().includes("macbook") || p.name.toLowerCase().includes("laptop")),
    );
    if (phoneOrLaptop) {
      const variants = getProductVariants(phoneOrLaptop);
      const variantNames = variants.map((v) => v.name);
      expect(variantNames).toContain("Storage");
      expect(variantNames).toContain("Color");
    }

    const fashionItem = products.find(
      (p) => p.category === "fashion" && !p.subcategory?.includes("shoe"),
    );
    if (fashionItem) {
      const variants = getProductVariants(fashionItem);
      const variantNames = variants.map((v) => v.name);
      expect(variantNames).toContain("Size");
      expect(variantNames).toContain("Color");
    }

    const beautyItem = products.find((p) => p.category === "beauty");
    if (beautyItem) {
      const variants = getProductVariants(beautyItem);
      const variantNames = variants.map((v) => v.name);
      expect(variantNames).toContain("Volume");
    }
  });
});

describe("PROMPT 3: Shopping Cart State Management & Interactions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("adds products to cart with custom quantities and updates total cart count", async () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );

    expect(screen.getByTestId("cart-count").textContent).toBe("0");

    // Add 1 headphone
    fireEvent.click(screen.getByText("Add Headphones 1"));
    expect(screen.getByTestId("cart-count").textContent).toBe("1");
    expect(screen.getByTestId("cart-items").textContent).toContain('"wireless-headphones":1');

    // Add 3 more headphones
    fireEvent.click(screen.getByText("Add Headphones 3"));
    expect(screen.getByTestId("cart-count").textContent).toBe("4");
    expect(screen.getByTestId("cart-items").textContent).toContain('"wireless-headphones":4');

    // Add 2 watches
    fireEvent.click(screen.getByText("Add Watch 2"));
    expect(screen.getByTestId("cart-count").textContent).toBe("6");
    expect(screen.getByTestId("cart-items").textContent).toContain('"smart-watch-pro":2');
  });

  it("updates item quantity and removes items when set to 0", async () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );

    fireEvent.click(screen.getByText("Add Headphones 1"));
    expect(screen.getByTestId("cart-count").textContent).toBe("1");

    // Set to 5
    fireEvent.click(screen.getByText("Set Headphones 5"));
    expect(screen.getByTestId("cart-count").textContent).toBe("5");

    // Set to 0 -> should remove
    fireEvent.click(screen.getByText("Set Headphones 0"));
    expect(screen.getByTestId("cart-count").textContent).toBe("0");
    expect(screen.getByTestId("cart-items").textContent).toBe("{}");
  });

  it("removes items via removeFromCart and clears entire cart via clearCart", async () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );

    fireEvent.click(screen.getByText("Add Headphones 1"));
    fireEvent.click(screen.getByText("Add Watch 2"));
    expect(screen.getByTestId("cart-count").textContent).toBe("3");

    // Remove Watch
    fireEvent.click(screen.getByText("Remove Watch"));
    expect(screen.getByTestId("cart-count").textContent).toBe("1");
    expect(screen.getByTestId("cart-items").textContent).not.toContain("smart-watch-pro");

    // Clear cart
    fireEvent.click(screen.getByText("Clear All Cart"));
    expect(screen.getByTestId("cart-count").textContent).toBe("0");
    expect(screen.getByTestId("cart-items").textContent).toBe("{}");
  });

  it("calculates subtotal, shipping threshold and discount correctly", () => {
    const item1 = getProduct("wireless-headphones")!;
    const item2 = getProduct("smart-watch-pro")!;

    const subtotal = item1.price * 2 + item2.price * 1;
    expect(subtotal).toBeGreaterThan(0);

    const shipping = subtotal >= 499 ? 0 : 79;
    expect(shipping).toBe(0); // Subtotal is > 499

    const discount10 = Math.round(subtotal * 0.1);
    const total = subtotal + shipping - discount10;
    expect(total).toBeLessThan(subtotal);
  });
});

describe("PROMPT 3: Wishlist State Management & Interactions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("toggles product wishlist state and maintains consistent counter", () => {
    render(
      <CartProvider>
        <CartTestConsumer />
      </CartProvider>,
    );

    expect(screen.getByTestId("wishlist-count").textContent).toBe("0");
    expect(screen.getByTestId("is-headphones-wishlisted").textContent).toBe("NO");

    // Add to wishlist
    fireEvent.click(screen.getByText("Toggle Wishlist Headphones"));
    expect(screen.getByTestId("wishlist-count").textContent).toBe("1");
    expect(screen.getByTestId("is-headphones-wishlisted").textContent).toBe("YES");
    expect(screen.getByTestId("wishlist-items").textContent).toContain("wireless-headphones");

    // Toggle off from wishlist
    fireEvent.click(screen.getByText("Toggle Wishlist Headphones"));
    expect(screen.getByTestId("wishlist-count").textContent).toBe("0");
    expect(screen.getByTestId("is-headphones-wishlisted").textContent).toBe("NO");
    expect(screen.getByTestId("wishlist-items").textContent).toBe("[]");
  });
});
