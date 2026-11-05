import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, Check, Package, RotateCcw, Search, Warehouse } from "lucide-react";
import type { Product } from "@/data/products";
import { getVendorProducts, updateVendorProduct } from "@/lib/vendor-api";
import { PRODUCT_CATEGORIES } from "./VendorModals";

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

function getStockStatus(stock: number): Exclude<StockFilter, "all"> {
  if (stock <= 0) return "out_of_stock";
  if (stock <= 10) return "low_stock";
  return "in_stock";
}

const stockStatusLabels: Record<Exclude<StockFilter, "all">, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export function VendorInventoryView({
  storeId = "the-urban-nest",
  onInventoryChange,
}: {
  storeId?: string | undefined;
  onInventoryChange?: (() => void) | undefined;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StockFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);

  const reload = () => {
    try {
      const items = getVendorProducts(storeId);
      setProducts(items);
      setStockInputs(Object.fromEntries(items.map((item) => [item.id, String(item.stock ?? 0)])));
      setError(null);
    } catch {
      setError("Inventory could not be loaded. Check browser storage and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    reload();
    // Reload inventory when the active vendor store changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.sku || "").toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      const matchesCategory = category === "all" || product.category === category;
      const matchesStatus = status === "all" || getStockStatus(product.stock ?? 0) === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  const updateInput = (productId: string, value: string) => {
    setStockInputs((current) => ({ ...current, [productId]: value }));
    setFieldErrors((current) => ({ ...current, [productId]: "" }));
    setFeedback(null);
  };

  const saveStock = (event: FormEvent<HTMLFormElement>, product: Product) => {
    event.preventDefault();
    const input = stockInputs[product.id] ?? "";
    const quantity = Number(input);
    if (!input.trim() || !Number.isInteger(quantity) || quantity < 0) {
      setFieldErrors((current) => ({
        ...current,
        [product.id]: "Enter a whole number of 0 or more.",
      }));
      return;
    }
    try {
      const nextStatus =
        product.status === "draft" ? "draft" : quantity === 0 ? "out_of_stock" : "active";
      const updated = updateVendorProduct(product.id, { stock: quantity, status: nextStatus });
      if (!updated) throw new Error("Product not found");
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)));
      setFeedback({ message: `${product.name} stock updated.`, error: false });
      setError(null);
      onInventoryChange?.();
    } catch {
      setError("Inventory could not be saved. Check browser storage and try again.");
      setFeedback({ message: "Stock update failed.", error: true });
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
  };

  return (
    <section className="space-y-4" aria-label="Inventory management">
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800"
        >
          <span>{error}</span>
          <button type="button" onClick={reload} className="underline">
            Retry
          </button>
        </div>
      )}
      {feedback && (
        <div
          role={feedback.error ? "alert" : "status"}
          className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${feedback.error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          {feedback.error ? <AlertCircle className="size-4" /> : <Check className="size-4" />}
          {feedback.message}
        </div>
      )}

      <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-3 border-b border-[#ECEAF5] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#110D27]">Inventory</h3>
              <span className="rounded-full bg-[#F0EBFE] px-2.5 py-0.5 text-xs font-bold text-[#6538F5]">
                {products.length} {products.length === 1 ? "item" : "items"}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#7A7F93]">
              Stock levels are saved to each product in this browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7A7F93]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search inventory"
                aria-label="Search inventory"
                className="w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#6538F5] sm:w-52"
              />
            </label>
            <select
              aria-label="Filter inventory by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3 py-2 text-xs"
            >
              <option value="all">All categories</option>
              {PRODUCT_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter inventory by stock status"
              value={status}
              onChange={(event) => setStatus(event.target.value as StockFilter)}
              className="rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] px-3 py-2 text-xs"
            >
              <option value="all">All stock statuses</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
            {(search || category !== "all" || status !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                aria-label="Clear inventory filters"
                className="grid size-9 place-items-center rounded-xl border border-[#ECEAF5] text-[#7A7F93]"
              >
                <RotateCcw className="size-4" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 p-12 text-sm text-[#7A7F93]"
          >
            <Warehouse className="size-4 animate-pulse" />
            Loading inventory…
          </div>
        ) : error ? null : products.length === 0 ? (
          <div className="my-8 flex flex-col items-center rounded-2xl border border-dashed border-[#ECEAF5] bg-[#FBFBFE] p-10 text-center">
            <Package className="size-8 text-[#6538F5]" />
            <h4 className="mt-3 text-sm font-bold text-[#110D27]">No inventory yet</h4>
            <p className="mt-1 text-xs text-[#7A7F93]">
              Products you add will appear here for stock tracking.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="my-8 flex flex-col items-center rounded-2xl border border-dashed border-[#ECEAF5] bg-[#FBFBFE] p-10 text-center">
            <Search className="size-7 text-[#6538F5]" />
            <h4 className="mt-3 text-sm font-bold text-[#110D27]">No matching inventory</h4>
            <p className="mt-1 text-xs text-[#7A7F93]">Try another search or filter.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 text-xs font-bold text-[#6538F5]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-[#ECEAF5] text-[10px] font-bold uppercase tracking-wide text-[#908DA3]">
                <tr>
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Available stock</th>
                  <th className="px-3 py-3">Stock status</th>
                  <th className="px-3 py-3 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFF7]">
                {filteredProducts.map((product) => {
                  const quantity = product.stock ?? 0;
                  const stockStatus = getStockStatus(quantity);
                  const categoryLabel =
                    PRODUCT_CATEGORIES.find((item) => item.id === product.category)?.label ??
                    product.category;
                  return (
                    <tr key={product.id} className="hover:bg-[#F9F8FD]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="size-10 rounded-lg border border-[#ECEAF5] object-cover"
                          />
                          <span className="font-bold text-[#110D27]">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#7A7F93]">{product.sku || "—"}</td>
                      <td className="px-3 py-3 text-[#4B5264]">{categoryLabel}</td>
                      <td className="px-3 py-3 font-semibold text-[#110D27]">{quantity}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${stockStatus === "out_of_stock" ? "bg-rose-100 text-rose-800" : stockStatus === "low_stock" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${stockStatus === "out_of_stock" ? "bg-rose-600" : stockStatus === "low_stock" ? "bg-amber-600" : "bg-emerald-600"}`}
                          />
                          {stockStatusLabels[stockStatus]}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <form
                          noValidate
                          onSubmit={(event) => saveStock(event, product)}
                          className="flex items-start justify-end gap-2"
                        >
                          <div>
                            <input
                              aria-label={`Stock quantity for ${product.name}`}
                              type="number"
                              min="0"
                              step="1"
                              value={stockInputs[product.id] ?? ""}
                              onChange={(event) => updateInput(product.id, event.target.value)}
                              className="w-24 rounded-lg border border-[#ECEAF5] bg-white px-2.5 py-2 text-xs outline-none focus:border-[#6538F5]"
                            />
                            {fieldErrors[product.id] && (
                              <p
                                role="alert"
                                className="mt-1 max-w-36 text-[10px] font-semibold text-red-600"
                              >
                                {fieldErrors[product.id]}
                              </p>
                            )}
                          </div>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#6538F5] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#5228D9]"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
