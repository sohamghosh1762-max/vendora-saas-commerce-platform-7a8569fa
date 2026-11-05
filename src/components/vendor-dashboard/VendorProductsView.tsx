import { useState, useMemo, useEffect } from "react";
import {
  AlertCircle,
  Check,
  Filter,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import type { Product, ProductStatus } from "@/data/products";
import {
  addVendorProduct,
  deleteVendorProduct,
  getVendorProducts,
  updateVendorProduct,
} from "@/lib/vendor-api";
import { formatINR } from "@/lib/format";
import {
  AddProductModal,
  EditProductModal,
  DeleteProductModal,
  PRODUCT_CATEGORIES,
} from "./VendorModals";

interface VendorProductsViewProps {
  storeId?: string | undefined;
  storeName?: string | undefined;
  onAddProductClick?: (() => void) | undefined;
  onProductsChange?: (() => void) | undefined;
}

export function VendorProductsView({
  storeId = "the-urban-nest",
  storeName = "The Urban Nest",
  onAddProductClick,
  onProductsChange,
}: VendorProductsViewProps) {
  // Load products for the current store
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Reload when storeId changes
  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setProducts(getVendorProducts(storeId));
    } catch {
      setLoadError("Products could not be loaded. Check browser storage and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  const reloadProducts = () => {
    try {
      setProducts(getVendorProducts(storeId));
      setLoadError(null);
      return true;
    } catch {
      setLoadError("Products could not be saved or loaded. Check browser storage and try again.");
      return false;
    }
  };

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Feedback banner state
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(
    null,
  );

  const showFeedback = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  // Add product handler
  const handleAddProduct = (data: {
    name: string;
    category: string;
    price: number;
    originalPrice?: number | undefined;
    stock?: number | undefined;
    status?: ProductStatus | undefined;
    image?: string | undefined;
    description?: string | undefined;
    badge?: string | undefined;
  }) => {
    try {
      const created = addVendorProduct({
        name: data.name,
        storeId,
        storeName,
        category: data.category,
        price: data.price,
        originalPrice: data.originalPrice ?? data.price,
        stock: data.stock ?? 25,
        status: data.status || "active",
        rating: 5.0,
        reviews: 0,
        ...(data.badge ? { badge: data.badge } : {}),
        image:
          data.image ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        description: data.description || "Handcrafted artisan product.",
        featured: true,
      });

      if (!reloadProducts()) return false;
      onProductsChange?.();
      showFeedback(`Product "${created.name}" created successfully.`);
      return true;
    } catch {
      setLoadError("Product could not be saved. Check browser storage and try again.");
      showFeedback("Product could not be saved.", "error");
      return false;
    }
  };

  // Edit product handler
  const handleEditProduct = (productId: string, updates: Partial<Product>) => {
    try {
      const updated = updateVendorProduct(productId, updates);
      if (updated) {
        if (!reloadProducts()) return false;
        onProductsChange?.();
        showFeedback(`Product "${updated.name}" updated successfully.`);
        return true;
      } else {
        showFeedback("Failed to update product.", "error");
        return false;
      }
    } catch {
      setLoadError("Product could not be saved. Check browser storage and try again.");
      showFeedback("Product could not be saved.", "error");
      return false;
    }
  };

  // Delete product handler
  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    let success = false;
    try {
      success = deleteVendorProduct(productId);
    } catch {
      setLoadError("Product could not be deleted. Check browser storage and try again.");
    }
    if (success) {
      if (!reloadProducts()) return;
      onProductsChange?.();
      showFeedback(`Product "${target?.name || "Item"}" deleted from catalog.`);
    } else {
      showFeedback("Failed to delete product.", "error");
    }
    setDeletingProduct(null);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search query filter (matches name, description, category, or badge)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = (p.description || "").toLowerCase().includes(query);
        const matchesCat = (p.category || "").toLowerCase().includes(query);
        const matchesBadge = (p.badge || "").toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesBadge) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const itemStatus = p.status || "active";
        if (itemStatus !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || categoryFilter !== "all" || statusFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  // Map category ID to label
  const getCategoryLabel = (catId: string) => {
    const found = PRODUCT_CATEGORIES.find((c) => c.id === catId);
    return found ? found.label : catId;
  };

  return (
    <div className="space-y-5">
      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-2xl p-3.5 text-xs font-semibold shadow-xs transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check className="size-4 text-emerald-600" />
            ) : (
              <AlertCircle className="size-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="rounded-md p-1 hover:bg-black/5"
            aria-label="Dismiss feedback"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => {
              setLoadError(null);
              reloadProducts();
            }}
            className="underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Top Controls Bar: Search, Filters, and Add Product */}
        <div className="flex flex-col gap-3.5 border-b border-[#ECEAF5] pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#110D27]">Products Catalog</span>
                <span className="rounded-full bg-[#F0EBFE] px-2.5 py-0.5 text-xs font-bold text-[#6538F5]">
                  {products.length} {products.length === 1 ? "product" : "products"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#7A7F93]">
                Manage inventory, update prices, and organize merchandise for {storeName}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onAddProductClick) {
                  onAddProductClick();
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#5228D9] active:scale-95 shrink-0"
              aria-label="Add Product"
            >
              <Plus className="size-4" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Search & Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2">
            {/* Search Input */}
            <div className="relative sm:col-span-5 lg:col-span-6">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A7F93]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, category, or badge..."
                className="w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] py-2 pl-9 pr-9 text-xs text-[#110D27] placeholder-[#7A7F93] outline-none transition focus:border-[#6538F5] focus:bg-white"
                aria-label="Search products"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#7A7F93] hover:text-[#110D27]"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category Select Filter */}
            <div className="sm:col-span-4 lg:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3 py-2 text-xs font-medium text-[#110D27] outline-none transition focus:border-[#6538F5] focus:bg-white cursor-pointer"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select Filter */}
            <div className="sm:col-span-3 lg:col-span-3 flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3 py-2 text-xs font-medium text-[#110D27] outline-none transition focus:border-[#6538F5] focus:bg-white cursor-pointer"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-[#ECEAF5] bg-white text-[#7A7F93] hover:bg-[#F9F8FD] hover:text-[#6538F5] transition"
                  title="Reset filters"
                  aria-label="Reset filters"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Indicator Line */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between text-[11px] text-[#7A7F93] pt-1">
              <span>
                Showing <strong className="text-[#110D27]">{filteredProducts.length}</strong> of{" "}
                <strong className="text-[#110D27]">{products.length}</strong> products matching
                filters
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="font-bold text-[#6538F5] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Products Table / Cards */}
        {isLoading ? (
          <div
            role="status"
            className="my-8 flex items-center justify-center gap-2 p-10 text-sm text-[#7A7F93]"
          >
            Loading products…
          </div>
        ) : loadError && products.length === 0 ? null : products.length === 0 ? (
          /* Empty Catalog State */
          <div className="my-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ECEAF5] bg-[#FBFBFE] p-10 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-[#F0EBFE] text-[#6538F5] mb-3 shadow-xs">
              <Package className="size-7" />
            </div>
            <h3 className="text-base font-bold text-[#110D27]">No products in your catalog</h3>
            <p className="mt-1 max-w-sm text-xs text-[#7A7F93] leading-relaxed">
              You haven't added any products to your store catalog yet. Add your first product to
              start selling to customers on Vendora.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] transition active:scale-95"
            >
              <Plus className="size-4" />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty Filtered Results State */
          <div className="my-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ECEAF5] bg-[#FBFBFE] p-10 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#F0EBFE] text-[#6538F5] mb-3">
              <Search className="size-6" />
            </div>
            <h3 className="text-base font-bold text-[#110D27]">No matching products found</h3>
            <p className="mt-1 max-w-sm text-xs text-[#7A7F93] leading-relaxed">
              {searchQuery
                ? `No products match "${searchQuery}". `
                : "No products match the selected filters. "}
              Try adjusting your search terms or reset your filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#ECEAF5] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#6538F5] shadow-xs hover:bg-[#F9F8FD] transition"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          /* Product Items Table */
          <div className="mt-2 divide-y divide-[#F1EFF7] overflow-x-auto">
            {/* Desktop Table Header */}
            <div className="hidden sm:grid sm:grid-cols-12 py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-[#908DA3] border-b border-[#ECEAF5]">
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-1">Stock</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Product Rows */}
            {filteredProducts.map((p) => {
              const stockCount = p.stock !== undefined ? p.stock : 25;
              const productStatus = p.status || (stockCount === 0 ? "out_of_stock" : "active");

              return (
                <div
                  key={p.id}
                  className="group flex flex-col sm:grid sm:grid-cols-12 py-3.5 px-3 rounded-xl hover:bg-[#F9F8FD] transition items-center gap-3 sm:gap-0"
                >
                  {/* Column 1: Image, Name, Badge, Description */}
                  <div className="flex items-center gap-3 col-span-5 w-full min-w-0 pr-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-[#ECEAF5] bg-[#F4F2FC]">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="size-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-[#110D27] truncate leading-tight">
                          {p.name}
                        </h4>
                        {p.badge && (
                          <span className="rounded-md bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 text-[9.5px] font-extrabold text-amber-700 uppercase">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#7A7F93] line-clamp-1 leading-snug">
                        {p.description || "Handcrafted artisan product."}
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Category */}
                  <div className="col-span-2 w-full sm:w-auto">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#F0EBFE] px-2 py-0.5 text-[11px] font-semibold text-[#6538F5]">
                      <Tag className="size-2.5" />
                      <span>{getCategoryLabel(p.category)}</span>
                    </span>
                  </div>

                  {/* Column 3: Price */}
                  <div className="col-span-2 w-full sm:w-auto">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-extrabold text-[#110D27]">
                        {formatINR(p.price)}
                      </span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[10.5px] text-[#908DA3] line-through font-medium">
                          {formatINR(p.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Column 4: Stock Quantity */}
                  <div className="col-span-1 w-full sm:w-auto">
                    {stockCount > 10 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>{stockCount} in stock</span>
                      </span>
                    ) : stockCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        <span>Low: {stockCount}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <span className="size-1.5 rounded-full bg-rose-500" />
                        <span>Out of stock</span>
                      </span>
                    )}
                  </div>

                  {/* Column 5: Status */}
                  <div className="col-span-1 w-full sm:w-auto">
                    {productStatus === "active" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold px-2 py-0.5 whitespace-nowrap">
                        <span className="size-1.5 rounded-full bg-emerald-600" />
                        <span>Active</span>
                      </span>
                    ) : productStatus === "draft" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 text-[10.5px] font-bold px-2 py-0.5 whitespace-nowrap">
                        <span className="size-1.5 rounded-full bg-slate-500" />
                        <span>Draft</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 text-[10.5px] font-bold px-2 py-0.5 whitespace-nowrap">
                        <span className="size-1.5 rounded-full bg-rose-600" />
                        <span>Out of Stock</span>
                      </span>
                    )}
                  </div>

                  {/* Column 6: Actions (Edit & Delete) */}
                  <div className="col-span-1 flex items-center justify-end gap-1.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#ECEAF5] bg-white px-2 py-1 text-xs font-semibold text-[#4B5264] shadow-xs hover:border-[#6538F5]/30 hover:bg-[#F9F8FD] hover:text-[#6538F5] transition"
                      title="Edit product"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sm:hidden lg:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProduct(p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#ECEAF5] bg-white px-2 py-1 text-xs font-semibold text-red-500 shadow-xs hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete product"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sm:hidden lg:inline">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={Boolean(editingProduct)}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleEditProduct}
      />

      {/* Delete Product Confirmation Modal */}
      <DeleteProductModal
        isOpen={Boolean(deletingProduct)}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
      />
    </div>
  );
}
