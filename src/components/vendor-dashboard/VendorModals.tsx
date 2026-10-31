import { useState, useEffect } from "react";
import { AlertCircle, Check, Loader2, Package, Pencil, Store, Trash2, X } from "lucide-react";
import type { DashboardOrder } from "@/lib/vendor-dashboard-data";
import type { Product, ProductStatus } from "@/data/products";
import { cn } from "@/lib/utils";

// --- Categories List ---
export const PRODUCT_CATEGORIES = [
  { id: "home-living", label: "Home & Living" },
  { id: "fashion", label: "Fashion & Apparel" },
  { id: "beauty", label: "Beauty & Personal Care" },
  { id: "electronics", label: "Electronics" },
  { id: "sports", label: "Sports & Fitness" },
  { id: "books", label: "Books & Stationery" },
  { id: "toys", label: "Toys & Kids" },
  { id: "food", label: "Food & Beverages" },
  { id: "health", label: "Health & Wellness" },
  { id: "automotive", label: "Automotive" },
] as const;

// --- Add Product Modal ---
export function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: {
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    stock?: number;
    status?: ProductStatus;
    image?: string;
    description?: string;
    badge?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("home-living");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("25");
  const [status, setStatus] = useState<ProductStatus>("active");
  const [image, setImage] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setCategory("home-living");
      setPrice("");
      setOriginalPrice("");
      setStock("25");
      setStatus("active");
      setImage("");
      setBadge("");
      setDescription("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    // Product Name validation
    if (!name.trim()) {
      errs.name = "Product name is required.";
    }

    // Category validation
    if (!category.trim()) {
      errs.category = "Please select a category.";
    }

    // Price validation
    const parsedPrice = parseFloat(price);
    if (!price.trim()) {
      errs.price = "Price is required.";
    } else if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errs.price = "Price must be a valid number greater than 0.";
    }

    // Original Price validation (if provided)
    if (originalPrice.trim()) {
      const parsedOriginal = parseFloat(originalPrice);
      if (isNaN(parsedOriginal) || parsedOriginal <= 0) {
        errs.originalPrice = "Original price must be a valid number greater than 0.";
      } else if (!isNaN(parsedPrice) && parsedOriginal < parsedPrice) {
        errs.originalPrice = "Original price should be greater than or equal to selling price.";
      }
    }

    // Stock Quantity validation
    if (!stock.toString().trim()) {
      errs.stock = "Stock quantity is required.";
    } else {
      const parsedStock = Number(stock);
      if (isNaN(parsedStock) || !Number.isInteger(parsedStock) || parsedStock < 0) {
        errs.stock = "Stock quantity must be a whole number (0 or greater).";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const parsedPrice = parseFloat(price);
    const parsedOriginal = originalPrice.trim()
      ? parseFloat(originalPrice)
      : parsedPrice * 1.25;
    const parsedStock = parseInt(stock, 10);

    setTimeout(() => {
      onSubmit({
        name: name.trim(),
        category,
        price: parsedPrice,
        originalPrice: parsedOriginal,
        stock: parsedStock,
        status: parsedStock === 0 && status === "active" ? "out_of_stock" : status,
        image:
          image.trim() ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        description: description.trim() || "Handcrafted artisan product with premium materials.",
        badge: badge.trim() || undefined,
      });
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50 overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-3xl border border-[#ECEAF5] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-[#F0EBFE] text-[#6538F5]">
              <Package className="size-4" />
            </span>
            <h3 className="text-base font-bold text-[#110D27]">Add New Product</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7A7F93] hover:bg-[#F4F2FC] hover:text-[#110D27]"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 font-medium">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
            <span>Please correct the highlighted fields below.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs" noValidate>
          <div>
            <label className="font-bold text-[#110D27] flex items-center justify-between">
              <span>
                Product Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Handcrafted Ceramic Planter"
              className={cn(
                "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                errors.name
                  ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white"
                  : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
              )}
            />
            {errors.name && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#110D27]">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                }}
                className={cn(
                  "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                  errors.category
                    ? "border-red-400 focus:border-red-500"
                    : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
                )}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="font-bold text-[#110D27]">Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Best Seller, New"
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#110D27]">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                }}
                placeholder="1499"
                className={cn(
                  "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                  errors.price
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white"
                    : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
                )}
              />
              {errors.price && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label className="font-bold text-[#110D27]">Original Price (₹)</label>
              <input
                type="number"
                min="1"
                step="any"
                value={originalPrice}
                onChange={(e) => {
                  setOriginalPrice(e.target.value);
                  if (errors.originalPrice) setErrors((prev) => ({ ...prev, originalPrice: "" }));
                }}
                placeholder="2199"
                className={cn(
                  "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                  errors.originalPrice
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white"
                    : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
                )}
              />
              {errors.originalPrice && (
                <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.originalPrice}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#110D27]">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
                }}
                placeholder="25"
                className={cn(
                  "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                  errors.stock
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white"
                    : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
                )}
              />
              {errors.stock && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.stock}</p>}
            </div>

            <div>
              <label className="font-bold text-[#110D27]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
              >
                <option value="active">Active (Listed in catalog)</option>
                <option value="draft">Draft (Hidden from store)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#110D27]">Image URL (Optional)</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="font-bold text-[#110D27]">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your artisan product, craftsmanship, and materials..."
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ECEAF5]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ECEAF5] px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F4F2FC] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6538F5] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] disabled:opacity-50 transition active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                "Publish Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Edit Product Modal ---
export function EditProductModal({
  isOpen,
  product,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (productId: string, updates: Partial<Product>) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("home-living");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("25");
  const [status, setStatus] = useState<ProductStatus>("active");
  const [image, setImage] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "home-living");
      setPrice(product.price !== undefined ? String(product.price) : "");
      setOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
      setStock(product.stock !== undefined ? String(product.stock) : "25");
      setStatus((product.status as ProductStatus) || "active");
      setImage(product.image || "");
      setBadge(product.badge || "");
      setDescription(product.description || "");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = "Product name is required.";
    }

    if (!category.trim()) {
      errs.category = "Please select a category.";
    }

    const parsedPrice = parseFloat(price);
    if (!price.trim()) {
      errs.price = "Price is required.";
    } else if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errs.price = "Price must be a valid number greater than 0.";
    }

    if (originalPrice.trim()) {
      const parsedOriginal = parseFloat(originalPrice);
      if (isNaN(parsedOriginal) || parsedOriginal <= 0) {
        errs.originalPrice = "Original price must be a valid number greater than 0.";
      } else if (!isNaN(parsedPrice) && parsedOriginal < parsedPrice) {
        errs.originalPrice = "Original price should be greater than or equal to selling price.";
      }
    }

    if (!stock.toString().trim()) {
      errs.stock = "Stock quantity is required.";
    } else {
      const parsedStock = Number(stock);
      if (isNaN(parsedStock) || !Number.isInteger(parsedStock) || parsedStock < 0) {
        errs.stock = "Stock quantity must be a whole number (0 or greater).";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const parsedPrice = parseFloat(price);
    const parsedOriginal = originalPrice.trim()
      ? parseFloat(originalPrice)
      : parsedPrice * 1.25;
    const parsedStock = parseInt(stock, 10);

    setTimeout(() => {
      onSubmit(product.id, {
        name: name.trim(),
        category,
        price: parsedPrice,
        originalPrice: parsedOriginal,
        stock: parsedStock,
        status: parsedStock === 0 && status === "active" ? "out_of_stock" : status,
        image: image.trim() || product.image,
        description: description.trim() || product.description,
        badge: badge.trim() || undefined,
      });
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50 overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-3xl border border-[#ECEAF5] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-[#F0EBFE] text-[#6538F5]">
              <Pencil className="size-4" />
            </span>
            <h3 className="text-base font-bold text-[#110D27]">Edit Product</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7A7F93] hover:bg-[#F4F2FC] hover:text-[#110D27]"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 font-medium">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
            <span>Please correct the highlighted fields below.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs" noValidate>
          <div>
            <label className="font-bold text-[#110D27]">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Handcrafted Ceramic Planter"
              className={cn(
                "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                errors.name
                  ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white"
                  : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
              )}
            />
            {errors.name && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#110D27]">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                }}
                className={cn(
                  "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                  errors.category
                    ? "border-red-400 focus:border-red-500"
                    : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
                )}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="font-bold text-[#110D27]">Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Best Seller, New"
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#110D27]">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                }}
                placeholder="1499"
                className={cn(
                  "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                  errors.price
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white"
                    : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
                )}
              />
              {errors.price && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label className="font-bold text-[#110D27]">Original Price (₹)</label>
              <input
                type="number"
                min="1"
                step="any"
                value={originalPrice}
                onChange={(e) => {
                  setOriginalPrice(e.target.value);
                  if (errors.originalPrice) setErrors((prev) => ({ ...prev, originalPrice: "" }));
                }}
                placeholder="2199"
                className={cn(
                  "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                  errors.originalPrice
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white"
                    : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
                )}
              />
              {errors.originalPrice && (
                <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.originalPrice}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#110D27]">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
                }}
                placeholder="25"
                className={cn(
                  "mt-1 w-full rounded-xl border bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none transition",
                  errors.stock
                    ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:bg-white"
                    : "border-[#ECEAF5] focus:border-[#6538F5] focus:bg-white",
                )}
              />
              {errors.stock && <p className="mt-1 text-[11px] font-semibold text-red-500">{errors.stock}</p>}
            </div>

            <div>
              <label className="font-bold text-[#110D27]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
              >
                <option value="active">Active (Listed in catalog)</option>
                <option value="draft">Draft (Hidden from store)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#110D27]">Image URL (Optional)</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="font-bold text-[#110D27]">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your artisan product, craftsmanship, and materials..."
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ECEAF5]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ECEAF5] px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F4F2FC] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6538F5] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] disabled:opacity-50 transition active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Delete Product Modal ---
export function DeleteProductModal({
  isOpen,
  product,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (productId: string) => void;
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-md rounded-3xl border border-[#ECEAF5] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-red-100 text-red-600">
              <Trash2 className="size-4" />
            </span>
            <h3 className="text-base font-bold text-[#110D27]">Delete Product</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7A7F93] hover:bg-[#F4F2FC] hover:text-[#110D27]"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 text-xs text-[#4B5264] space-y-2 leading-relaxed">
          <p>
            Are you sure you want to delete <strong className="text-[#110D27]">"{product.name}"</strong>?
          </p>
          <p className="text-[11px] text-[#7A7F93]">
            This action cannot be undone and will permanently remove this item from your vendor catalog.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-[#ECEAF5]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#ECEAF5] px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F4F2FC] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product.id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition active:scale-98"
          >
            <Trash2 className="size-3.5" />
            <span>Delete Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Store Settings Modal ---
export function StoreSettingsModal({
  isOpen,
  onClose,
  storeName,
  tagline,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  tagline: string;
  onSave: (data: { storeName: string; tagline: string; returnPolicy: string }) => void;
}) {
  const [name, setName] = useState(storeName);
  const [storeTagline, setStoreTagline] = useState(tagline);
  const [returnPolicy, setReturnPolicy] = useState("14-Day Easy Returns");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setName(storeName);
    setStoreTagline(tagline);
  }, [storeName, tagline, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    onSave({ storeName: name, tagline: storeTagline, returnPolicy });
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-lg rounded-3xl border border-[#ECEAF5] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-[#F0EBFE] text-[#6538F5]">
              <Store className="size-4" />
            </span>
            <h3 className="text-base font-bold text-[#110D27]">Store Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7A7F93] hover:bg-[#F4F2FC] hover:text-[#110D27]"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-[#110D27]">Store Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="font-bold text-[#110D27]">Tagline / Subtitle</label>
            <input
              type="text"
              value={storeTagline}
              onChange={(e) => setStoreTagline(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="font-bold text-[#110D27]">Return & Refund Policy</label>
            <select
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3.5 py-2.5 text-xs text-[#110D27] outline-none focus:border-[#6538F5] focus:bg-white transition"
            >
              <option value="14-Day Easy Returns">14-Day Easy Returns</option>
              <option value="7-Day Hassle-Free Returns">7-Day Hassle-Free Returns</option>
              <option value="30-Day Guarantee">30-Day Guarantee</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#ECEAF5]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ECEAF5] px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-[#F4F2FC] transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#6538F5] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] transition"
            >
              {isSaved ? (
                <>
                  <Check className="size-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Order Detail Modal ---
export function OrderDetailModal({
  order,
  onClose,
}: {
  order: DashboardOrder | null;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in-50">
      <div className="w-full max-w-md rounded-3xl border border-[#ECEAF5] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#110D27]">
              Order Details — {order.orderNumber}
            </h3>
            <span className="text-[11px] text-[#7A7F93] font-medium">{order.date}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7A7F93] hover:bg-[#F4F2FC] hover:text-[#110D27]"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs">
          <div className="flex items-center gap-3 rounded-2xl bg-[#F9F8FD] p-3 border border-[#ECEAF5]">
            <img
              src={order.image}
              alt="Item thumbnail"
              className="size-12 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="font-bold text-[#110D27] block">Customer: {order.customerName}</span>
              <span className="text-[11px] text-[#7A7F93] block mt-0.5">
                Payment Verified • Pre-paid
              </span>
              <span className="text-sm font-extrabold text-[#6538F5] block mt-1">
                {order.formattedAmount}
              </span>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-[#ECEAF5] p-3.5">
            <div className="flex justify-between">
              <span className="text-[#7A7F93]">Fulfillment Status:</span>
              <span className="font-bold text-[#110D27]">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A7F93]">Delivery Partner:</span>
              <span className="font-bold text-[#110D27]">Vendora Express Logistics</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7A7F93]">Tracking ID:</span>
              <span className="font-mono font-bold text-[#6538F5]">VND-98432-IN</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#6538F5] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
