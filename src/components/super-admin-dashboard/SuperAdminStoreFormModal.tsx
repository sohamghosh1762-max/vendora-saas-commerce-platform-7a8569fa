import { useState, useEffect } from "react";
import { X, Store, Loader2, AlertCircle } from "lucide-react";
import type {
  SuperAdminManagedStore,
  SuperAdminStoreCreateInput,
  SuperAdminStoreUpdateInput,
  StoreStatus,
} from "@/lib/super-admin-types";

interface SuperAdminStoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeToEdit?: SuperAdminManagedStore | null;
  onSubmitCreate: (input: SuperAdminStoreCreateInput) => Promise<boolean>;
  onSubmitUpdate: (id: string, input: SuperAdminStoreUpdateInput) => Promise<boolean>;
}

const CATEGORIES = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "home-living", label: "Home & Living" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "books", label: "Books & Stationery" },
];

export function SuperAdminStoreFormModal({
  isOpen,
  onClose,
  storeToEdit,
  onSubmitCreate,
  onSubmitUpdate,
}: SuperAdminStoreFormModalProps) {
  const isEditing = Boolean(storeToEdit);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("fashion");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [status, setStatus] = useState<StoreStatus>("Active");
  const [productsCount, setProductsCount] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeToEdit) {
      setName(storeToEdit.name);
      setSlug(storeToEdit.slug);
      setCategory(storeToEdit.category);
      setTagline(storeToEdit.tagline);
      setDescription(storeToEdit.description);
      setOwnerName(storeToEdit.ownerName);
      setOwnerEmail(storeToEdit.ownerEmail);
      setOwnerPhone(storeToEdit.ownerPhone || "");
      setStatus(storeToEdit.status);
      setProductsCount(storeToEdit.productsCount);
    } else {
      setName("");
      setSlug("");
      setCategory("fashion");
      setTagline("");
      setDescription("");
      setOwnerName("");
      setOwnerEmail("");
      setOwnerPhone("");
      setStatus("Active");
      setProductsCount(0);
    }
    setError(null);
  }, [storeToEdit, isOpen]);

  // Automatically update slug if not manually edited during store creation
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-"))) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Store name is required.");
      return;
    }
    if (!ownerName.trim()) {
      setError("Merchant owner name is required.");
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes("@")) {
      setError("A valid merchant contact email is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && storeToEdit) {
        const success = await onSubmitUpdate(storeToEdit.id, {
          name: name.trim(),
          category,
          tagline: tagline.trim(),
          description: description.trim(),
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim(),
          ownerPhone: ownerPhone.trim() || undefined,
          status,
        });
        if (success) onClose();
        else setError("Failed to update store. Please check the details.");
      } else {
        const success = await onSubmitCreate({
          name: name.trim(),
          slug: slug.trim() || undefined,
          category,
          tagline: tagline.trim() || undefined,
          description: description.trim() || undefined,
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim(),
          ownerPhone: ownerPhone.trim() || undefined,
          status,
          initialProductsCount: productsCount,
        });
        if (success) onClose();
        else setError("Failed to create store. Slug may already exist.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl border border-[#E8EAF5] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-[#E8EAF5] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#F0EBFF] text-[#6538F5]">
              <Store className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#101438]">
                {isEditing ? `Edit Store: ${storeToEdit?.name}` : "Add New Platform Store"}
              </h2>
              <p className="text-xs text-[#626E9D]">
                {isEditing
                  ? "Update store details, merchant contact, and status."
                  : "Provision a new verified storefront in the Vendora ecosystem."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#626E9D] hover:bg-[#F8F8FF] hover:text-[#101438]"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#FF4D5A]/20 bg-[#FEECEE] p-3 text-xs font-semibold text-[#FF4D5A]">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Store Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#101438] uppercase">Store Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Modern Craft Co."
                className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#101438] uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5] focus:bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slug & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#101438] uppercase">
                Store Slug (URL Key)
              </label>
              <input
                type="text"
                disabled={isEditing}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="modern-craft-co"
                className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5] focus:bg-white disabled:opacity-60"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#101438] uppercase">
                Operational Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StoreStatus)}
                className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5] focus:bg-white"
              >
                <option value="Active">Active (Live Transacting)</option>
                <option value="Pending">Pending (Under Verification)</option>
                <option value="Suspended">Suspended (Restricted)</option>
              </select>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="text-[11px] font-bold text-[#101438] uppercase">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Handmade ceramics & artisanal home goods"
              className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5] focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-[#101438] uppercase">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of store offerings and specialty."
              className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5] focus:bg-white"
            />
          </div>

          {/* Merchant Contact Section */}
          <div className="rounded-2xl border border-[#E8EAF5] bg-[#F8F8FF]/50 p-4 space-y-3">
            <h4 className="text-[11px] font-black text-[#101438] uppercase tracking-wider">
              Merchant Information
            </h4>

            <div>
              <label className="text-[11px] font-bold text-[#101438] uppercase">
                Owner Full Name *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Vikram Singhania"
                className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-white px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#101438] uppercase">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="vikram@store.com"
                  className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-white px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#101438] uppercase">Phone</label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-white px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5]"
                />
              </div>
            </div>
          </div>

          {/* Initial Product Count if Creating */}
          {!isEditing && (
            <div>
              <label className="text-[11px] font-bold text-[#101438] uppercase">
                Initial Products Count
              </label>
              <input
                type="number"
                min={0}
                value={productsCount}
                onChange={(e) => setProductsCount(parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] px-3 py-2 text-xs font-medium text-[#101438] outline-none transition focus:border-[#6538F5] focus:bg-white"
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8EAF5]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#E8EAF5] bg-white px-4 py-2.5 text-xs font-bold text-[#101438] hover:bg-[#F8F8FF] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[#6538F5] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#4B20D8] transition disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                "Update Store"
              ) : (
                "Create Store"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
