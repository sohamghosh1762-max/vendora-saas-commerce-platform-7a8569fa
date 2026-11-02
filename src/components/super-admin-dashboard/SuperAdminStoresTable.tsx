import {
  Eye,
  Edit2,
  CheckCircle2,
  Ban,
  Trash2,
  ExternalLink,
  Store,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";
import type { SuperAdminManagedStore, StoreStatus } from "@/lib/super-admin-types";

// Category badges mapping
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  fashion: { bg: "bg-[#F3E8FF]", text: "text-[#7C3AED]" },
  electronics: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]" },
  "home-living": { bg: "bg-[#ECFDF5]", text: "text-[#059669]" },
  beauty: { bg: "bg-[#FDF2F8]", text: "text-[#DB2777]" },
  sports: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]" },
  books: { bg: "bg-[#FEFCE8]", text: "text-[#CA8A04]" },
};

import { formatINR } from "@/lib/format";

interface SuperAdminStoresTableProps {
  stores: SuperAdminManagedStore[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onViewDetails: (store: SuperAdminManagedStore) => void;
  onEditStore: (store: SuperAdminManagedStore) => void;
  onChangeStatus: (store: SuperAdminManagedStore, newStatus: StoreStatus) => void;
  onArchiveStore: (store: SuperAdminManagedStore) => void;
}

export function SuperAdminStoresTable({
  stores,
  totalCount,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onViewDetails,
  onEditStore,
  onChangeStatus,
  onArchiveStore,
}: SuperAdminStoresTableProps) {
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalCount);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8EAF5] bg-white shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E8EAF5] bg-[#F8F8FF] text-[11px] font-bold uppercase tracking-wider text-[#626E9D]">
              <th className="py-3.5 pl-6 pr-4">Store & ID</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Merchant / Owner</th>
              <th className="py-3.5 px-4 text-center">Catalog</th>
              <th className="py-3.5 px-4 text-right">Revenue (INR)</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E8EAF5] text-xs">
            {stores.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#626E9D]">
                  <div className="flex flex-col items-center justify-center">
                    <Store className="size-10 text-[#626E9D]/40 mb-2" />
                    <p className="text-sm font-bold text-[#101438]">No stores found</p>
                    <p className="mt-1 text-xs text-[#626E9D]">
                      Try adjusting your search criteria or filter options.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              stores.map((store) => {
                const catStyle = CATEGORY_COLORS[store.category] || {
                  bg: "bg-[#F0EBFF]",
                  text: "text-[#6538F5]",
                };

                return (
                  <tr key={store.id} className="group transition-colors hover:bg-[#F8F8FF]/80">
                    {/* Store Name, Slug & URL */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EBFF] text-[#6538F5] font-black text-sm shadow-xs">
                          {store.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onViewDetails(store)}
                              className="font-bold text-[#101438] hover:text-[#6538F5] transition text-left"
                            >
                              {store.name}
                            </button>
                            <a
                              href={store.storefrontUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="View Public Storefront"
                              className="text-[#626E9D] hover:text-[#6538F5]"
                            >
                              <ExternalLink className="size-3" />
                            </a>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#626E9D]">
                            ID: <code className="font-mono text-[#101438]">{store.id}</code>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${catStyle.bg} ${catStyle.text}`}
                      >
                        {store.category.replace("-", " ")}
                      </span>
                    </td>

                    {/* Merchant / Owner */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#101438]">{store.ownerName}</p>
                      <p className="mt-0.5 text-[11px] text-[#626E9D]">{store.ownerEmail}</p>
                    </td>

                    {/* Catalog: Products & Orders */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-[#101438]">{store.productsCount}</span>
                      <span className="text-[11px] text-[#626E9D]"> prods • </span>
                      <span className="font-bold text-[#101438]">{store.ordersCount}</span>
                      <span className="text-[11px] text-[#626E9D]"> orders</span>
                    </td>

                    {/* Revenue */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-bold text-[#101438]">
                      {formatINR(store.revenueINR)}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {store.status === "Active" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#08C784]/20 bg-[#EBFBF5] px-2.5 py-0.5 text-[10px] font-bold text-[#08C784]">
                          <span className="size-1.5 rounded-full bg-[#08C784]" />
                          Active
                        </span>
                      )}
                      {store.status === "Pending" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF8A00]/20 bg-[#FFF8E6] px-2.5 py-0.5 text-[10px] font-bold text-[#FF8A00]">
                          <span className="size-1.5 rounded-full bg-[#FF8A00]" />
                          Pending
                        </span>
                      )}
                      {store.status === "Suspended" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF4D5A]/20 bg-[#FEECEE] px-2.5 py-0.5 text-[10px] font-bold text-[#FF4D5A]">
                          <span className="size-1.5 rounded-full bg-[#FF4D5A]" />
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                      <div className="relative inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetails(store)}
                          className="rounded-lg p-1.5 text-[#626E9D] hover:bg-[#F0EBFF] hover:text-[#6538F5] transition"
                          title="View Store Details"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditStore(store)}
                          className="rounded-lg p-1.5 text-[#626E9D] hover:bg-[#F0EBFF] hover:text-[#6538F5] transition"
                          title="Edit Store Information"
                        >
                          <Edit2 className="size-4" />
                        </button>

                        {/* Status Toggle Quick Buttons */}
                        {store.status === "Pending" && (
                          <button
                            type="button"
                            onClick={() => onChangeStatus(store, "Active")}
                            className="rounded-lg p-1.5 text-[#08C784] hover:bg-[#EBFBF5] transition"
                            title="Approve and Activate Store"
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                        )}
                        {store.status === "Active" && (
                          <button
                            type="button"
                            onClick={() => onChangeStatus(store, "Suspended")}
                            className="rounded-lg p-1.5 text-[#FF8A00] hover:bg-[#FFF8E6] transition"
                            title="Suspend Store"
                          >
                            <Ban className="size-4" />
                          </button>
                        )}
                        {store.status === "Suspended" && (
                          <button
                            type="button"
                            onClick={() => onChangeStatus(store, "Active")}
                            className="rounded-lg p-1.5 text-[#08C784] hover:bg-[#EBFBF5] transition"
                            title="Reactivate Store"
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onArchiveStore(store)}
                          className="rounded-lg p-1.5 text-[#626E9D] hover:bg-[#FEECEE] hover:text-[#FF4D5A] transition"
                          title="Archive Store"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8EAF5] px-6 py-4 bg-[#F8F8FF]/50 text-xs text-[#626E9D]">
          <div>
            Showing <strong className="text-[#101438]">{startRecord}</strong> to{" "}
            <strong className="text-[#101438]">{endRecord}</strong> of{" "}
            <strong className="text-[#101438]">{totalCount}</strong> stores
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E8EAF5] bg-white px-3 py-1.5 font-semibold text-[#101438] transition hover:bg-[#F8F8FF] disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
              <span>Previous</span>
            </button>

            <span className="px-2 font-bold text-[#101438]">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#E8EAF5] bg-white px-3 py-1.5 font-semibold text-[#101438] transition hover:bg-[#F8F8FF] disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
