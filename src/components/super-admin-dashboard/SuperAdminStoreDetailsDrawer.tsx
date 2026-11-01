import {
  X,
  ExternalLink,
  Store,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  Star,
  MapPin,
  ShieldCheck,
  Ban,
  Clock,
  Edit2,
} from "lucide-react";
import type { SuperAdminManagedStore, StoreStatus } from "@/lib/super-admin-types";
import { formatINR } from "@/lib/format";

interface SuperAdminStoreDetailsDrawerProps {
  store: SuperAdminManagedStore | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (store: SuperAdminManagedStore) => void;
  onChangeStatus: (store: SuperAdminManagedStore, newStatus: StoreStatus) => void;
}

export function SuperAdminStoreDetailsDrawer({
  store,
  isOpen,
  onClose,
  onEdit,
  onChangeStatus,
}: SuperAdminStoreDetailsDrawerProps) {
  if (!isOpen || !store) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-[#E8EAF5] px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#F0EBFF] text-[#6538F5]">
                <Store className="size-4" />
              </span>
              <h3 className="text-sm font-extrabold text-[#101438]">Store Details</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#626E9D] hover:bg-[#F8F8FF] hover:text-[#101438]"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Store Identification Hero */}
            <div className="rounded-2xl border border-[#E8EAF5] bg-[#F8F8FF] p-4 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#6538F5] text-white font-black text-xl shadow-xs">
                {store.name.substring(0, 2).toUpperCase()}
              </div>
              <h2 className="mt-3 text-lg font-extrabold text-[#101438]">{store.name}</h2>
              <p className="mt-0.5 text-xs text-[#626E9D]">{store.tagline}</p>

              {/* Status and Category Badges */}
              <div className="mt-3 flex items-center justify-center gap-2">
                {store.status === "Active" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#08C784]/20 bg-[#EBFBF5] px-2.5 py-0.5 text-[10px] font-bold text-[#08C784]">
                    <span className="size-1.5 rounded-full bg-[#08C784]" />
                    Active Storefront
                  </span>
                )}
                {store.status === "Pending" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF8A00]/20 bg-[#FFF8E6] px-2.5 py-0.5 text-[10px] font-bold text-[#FF8A00]">
                    <span className="size-1.5 rounded-full bg-[#FF8A00]" />
                    Pending Approval
                  </span>
                )}
                {store.status === "Suspended" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF4D5A]/20 bg-[#FEECEE] px-2.5 py-0.5 text-[10px] font-bold text-[#FF4D5A]">
                    <span className="size-1.5 rounded-full bg-[#FF4D5A]" />
                    Suspended
                  </span>
                )}
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#626E9D] border border-[#E8EAF5] capitalize">
                  {store.category.replace("-", " ")}
                </span>
              </div>

              {store.suspensionReason && (
                <div className="mt-3 rounded-xl border border-[#FF4D5A]/20 bg-[#FEECEE] p-2.5 text-left text-[11px] text-[#FF4D5A]">
                  <strong>Suspension Reason:</strong> {store.suspensionReason}
                </div>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#E8EAF5] p-3 text-left">
                <span className="text-[10px] font-bold text-[#626E9D] uppercase">
                  Gross Revenue
                </span>
                <p className="mt-1 text-base font-black text-[#101438]">
                  {formatINR(store.revenueINR)}
                </p>
              </div>

              <div className="rounded-xl border border-[#E8EAF5] p-3 text-left">
                <span className="text-[10px] font-bold text-[#626E9D] uppercase">Catalog Size</span>
                <p className="mt-1 text-base font-black text-[#101438]">
                  {store.productsCount} Products
                </p>
              </div>

              <div className="rounded-xl border border-[#E8EAF5] p-3 text-left">
                <span className="text-[10px] font-bold text-[#626E9D] uppercase">
                  Orders Fulfilled
                </span>
                <p className="mt-1 text-base font-black text-[#101438]">
                  {store.ordersCount} Orders
                </p>
              </div>

              <div className="rounded-xl border border-[#E8EAF5] p-3 text-left">
                <span className="text-[10px] font-bold text-[#626E9D] uppercase">Rating</span>
                <p className="mt-1 flex items-center gap-1 text-base font-black text-[#101438]">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span>{store.rating.toFixed(1)}</span>
                  <span className="text-xs font-normal text-[#626E9D]">({store.reviewsCount})</span>
                </p>
              </div>
            </div>

            {/* Merchant Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#101438] uppercase tracking-wider">
                Merchant Information
              </h4>
              <div className="rounded-xl border border-[#E8EAF5] p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#626E9D]">
                    <User className="size-3.5" />
                    <span>Owner Name</span>
                  </span>
                  <strong className="text-[#101438]">{store.ownerName}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#626E9D]">
                    <Mail className="size-3.5" />
                    <span>Contact Email</span>
                  </span>
                  <strong className="text-[#101438]">{store.ownerEmail}</strong>
                </div>

                {store.ownerPhone && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#626E9D]">
                      <Phone className="size-3.5" />
                      <span>Phone</span>
                    </span>
                    <strong className="text-[#101438]">{store.ownerPhone}</strong>
                  </div>
                )}

                {store.city && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#626E9D]">
                      <MapPin className="size-3.5" />
                      <span>Location</span>
                    </span>
                    <strong className="text-[#101438]">
                      {store.city}, {store.state}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Store Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#101438] uppercase tracking-wider">
                Store Description
              </h4>
              <p className="rounded-xl border border-[#E8EAF5] p-3 text-xs leading-relaxed text-[#626E9D]">
                {store.description}
              </p>
            </div>

            {/* Audit & Timestamps */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#101438] uppercase tracking-wider">
                Platform Timestamps
              </h4>
              <div className="rounded-xl border border-[#E8EAF5] p-3 text-[11px] text-[#626E9D] space-y-1">
                <p>
                  <strong>Created:</strong> {new Date(store.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Last Modified:</strong> {new Date(store.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Actions Footer */}
          <div className="border-t border-[#E8EAF5] p-4 bg-[#F8F8FF] flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(store);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E8EAF5] bg-white py-2.5 text-xs font-bold text-[#101438] hover:bg-[#F0EBFF] hover:text-[#6538F5] transition"
              >
                <Edit2 className="size-3.5" />
                <span>Edit Store</span>
              </button>

              <a
                href={store.storefrontUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E8EAF5] bg-white py-2.5 text-xs font-bold text-[#101438] hover:bg-[#F0EBFF] hover:text-[#6538F5] transition"
              >
                <span>Storefront</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>

            {/* Status change actions */}
            {store.status === "Pending" && (
              <button
                type="button"
                onClick={() => {
                  onChangeStatus(store, "Active");
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#08C784] py-2.5 text-xs font-bold text-white hover:bg-[#07B075] transition shadow-xs"
              >
                <ShieldCheck className="size-4" />
                <span>Approve & Activate Store</span>
              </button>
            )}

            {store.status === "Active" && (
              <button
                type="button"
                onClick={() => {
                  onChangeStatus(store, "Suspended");
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF4D5A] py-2.5 text-xs font-bold text-white hover:bg-[#E53E4B] transition shadow-xs"
              >
                <Ban className="size-4" />
                <span>Suspend Store</span>
              </button>
            )}

            {store.status === "Suspended" && (
              <button
                type="button"
                onClick={() => {
                  onChangeStatus(store, "Active");
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#08C784] py-2.5 text-xs font-bold text-white hover:bg-[#07B075] transition shadow-xs"
              >
                <ShieldCheck className="size-4" />
                <span>Reactivate Store</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
