import { useState } from "react";
import { X, AlertTriangle, ShieldCheck, Ban, Trash2, Loader2 } from "lucide-react";
import type { SuperAdminManagedStore, StoreStatus } from "@/lib/super-admin-types";

interface SuperAdminStoreStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: SuperAdminManagedStore | null;
  targetAction: "Activate" | "Suspend" | "Archive" | null;
  onConfirmStatusChange: (
    store: SuperAdminManagedStore,
    newStatus: StoreStatus,
    reason?: string,
  ) => Promise<boolean>;
  onConfirmArchive: (store: SuperAdminManagedStore) => Promise<boolean>;
}

export function SuperAdminStoreStatusModal({
  isOpen,
  onClose,
  store,
  targetAction,
  onConfirmStatusChange,
  onConfirmArchive,
}: SuperAdminStoreStatusModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !store || !targetAction) return null;

  const isSuspend = targetAction === "Suspend" || (targetAction as string) === "Suspended";
  const isActivate = targetAction === "Activate" || (targetAction as string) === "Active";
  const isArchive = targetAction === "Archive" || (targetAction as string) === "Archived";

  const handleConfirm = async () => {
    setError(null);
    if (isSuspend && !reason.trim()) {
      setError("Please specify a reason for suspending this store.");
      return;
    }

    setIsSubmitting(true);
    try {
      let success = false;
      if (isArchive) {
        success = await onConfirmArchive(store);
      } else if (isSuspend) {
        success = await onConfirmStatusChange(store, "Suspended", reason.trim());
      } else if (isActivate) {
        success = await onConfirmStatusChange(store, "Active");
      }

      if (success) {
        onClose();
        setReason("");
      } else {
        setError("Operation failed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl border border-[#E8EAF5] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-11 items-center justify-center rounded-2xl ${
                isActivate
                  ? "bg-[#EBFBF5] text-[#08C784]"
                  : isSuspend
                    ? "bg-[#FFF8E6] text-[#FF8A00]"
                    : "bg-[#FEECEE] text-[#FF4D5A]"
              }`}
            >
              {isActivate && <ShieldCheck className="size-6" />}
              {isSuspend && <Ban className="size-6" />}
              {isArchive && <Trash2 className="size-6" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#101438]">
                {isActivate && "Activate Storefront"}
                {isSuspend && "Suspend Storefront"}
                {isArchive && "Archive Storefront"}
              </h3>
              <p className="text-xs text-[#626E9D]">
                Store: <strong className="text-[#101438]">{store.name}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#626E9D] hover:bg-[#F8F8FF] hover:text-[#101438]"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-[#FF4D5A]/20 bg-[#FEECEE] p-3 text-xs font-semibold text-[#FF4D5A]">
            {error}
          </div>
        )}

        <div className="mt-4 text-xs text-[#626E9D] leading-relaxed">
          {isActivate && (
            <p>
              Activating this store will approve its catalog and enable customers to browse and
              place orders. The merchant will receive an approval notification.
            </p>
          )}

          {isSuspend && (
            <div className="space-y-3">
              <p>
                Suspending this storefront will temporarily hide its catalog and prevent new
                customer orders until compliance review is completed.
              </p>

              <div>
                <label className="text-[11px] font-bold text-[#101438] uppercase">
                  Suspension Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. KYC documentation verification in progress, customer dispute review..."
                  className="mt-1 w-full rounded-xl border border-[#E8EAF5] bg-[#F8F8FF] p-2.5 text-xs font-medium text-[#101438] outline-none transition focus:border-[#FF8A00] focus:bg-white"
                />
              </div>
            </div>
          )}

          {isArchive && (
            <p className="text-[#FF4D5A]">
              Are you sure you want to archive <strong>{store.name}</strong>? The storefront will be
              de-listed from the marketplace directory.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E8EAF5]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-[#E8EAF5] bg-white px-4 py-2.5 text-xs font-bold text-[#101438] hover:bg-[#F8F8FF] transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-70 ${
              isActivate
                ? "bg-[#08C784] hover:bg-[#07B075]"
                : isSuspend
                  ? "bg-[#FF8A00] hover:bg-[#E07A00]"
                  : "bg-[#FF4D5A] hover:bg-[#E53E4B]"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isActivate ? (
              "Confirm Activation"
            ) : isSuspend ? (
              "Confirm Suspension"
            ) : (
              "Confirm Archive"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
