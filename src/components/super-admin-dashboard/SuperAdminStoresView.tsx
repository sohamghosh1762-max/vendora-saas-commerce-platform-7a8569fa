import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Store, RefreshCw } from "lucide-react";
import type {
  SuperAdminManagedStore,
  SuperAdminStoresSummary,
  StoreStatus,
  SuperAdminStoreCreateInput,
  SuperAdminStoreUpdateInput,
  SuperAdminStoreFilters,
} from "@/lib/super-admin-types";
import {
  getSuperAdminStores,
  createSuperAdminStore,
  updateSuperAdminStore,
  updateSuperAdminStoreStatus,
  deleteSuperAdminStore,
} from "@/lib/super-admin-api";
import { SuperAdminStoresSummaryCards } from "./SuperAdminStoresSummaryCards";
import { SuperAdminStoresToolbar } from "./SuperAdminStoresToolbar";
import { SuperAdminStoresTable } from "./SuperAdminStoresTable";
import { SuperAdminStoreDetailsDrawer } from "./SuperAdminStoreDetailsDrawer";
import { SuperAdminStoreFormModal } from "./SuperAdminStoreFormModal";
import { SuperAdminStoreStatusModal } from "./SuperAdminStoreStatusModal";

interface SuperAdminStoresViewProps {
  onReturnToDashboard: () => void;
  onStoreMutated?: () => void;
}

export function SuperAdminStoresView({
  onReturnToDashboard,
  onStoreMutated,
}: SuperAdminStoresViewProps) {
  // Store list and summary state
  const [stores, setStores] = useState<SuperAdminManagedStore[]>([]);
  const [summary, setSummary] = useState<SuperAdminStoresSummary>({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });

  // Filter & Pagination state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | StoreStatus>("All");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals & Drawers state
  const [selectedDrawerStore, setSelectedDrawerStore] = useState<SuperAdminManagedStore | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<SuperAdminManagedStore | null>(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetStore, setStatusTargetStore] = useState<SuperAdminManagedStore | null>(null);
  const [statusTargetAction, setStatusTargetAction] = useState<
    "Activate" | "Suspend" | "Archive" | null
  >(null);

  // Load stores from API
  const fetchStores = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await getSuperAdminStores({
        data: {
          search,
          status,
          category,
          sortBy: sortBy as SuperAdminStoreFilters["sortBy"],
          page,
          pageSize,
        },
      });

      if (res) {
        setStores(res.stores);
        setSummary(res.summary);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch managed stores:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, status, category, sortBy, page, pageSize]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Actions
  const handleOpenAdd = () => {
    setStoreToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (store: SuperAdminManagedStore) => {
    setStoreToEdit(store);
    setFormModalOpen(true);
  };

  const handleViewDetails = (store: SuperAdminManagedStore) => {
    setSelectedDrawerStore(store);
    setIsDrawerOpen(true);
  };

  const handleOpenStatusAction = (
    store: SuperAdminManagedStore,
    action: "Activate" | "Suspend" | StoreStatus,
  ) => {
    setStatusTargetStore(store);
    setStatusTargetAction(
      action === "Active" || action === "Activate"
        ? "Activate"
        : action === "Suspended" || action === "Suspend"
          ? "Suspend"
          : null,
    );
    setStatusModalOpen(true);
  };

  const handleOpenArchiveAction = (store: SuperAdminManagedStore) => {
    setStatusTargetStore(store);
    setStatusTargetAction("Archive");
    setStatusModalOpen(true);
  };

  const handleSubmitCreate = async (input: SuperAdminStoreCreateInput): Promise<boolean> => {
    const res = await createSuperAdminStore({ data: input });
    if (res.success && res.store) {
      showNotification(`Store '${res.store.name}' successfully created.`);
      await fetchStores();
      onStoreMutated?.();
      return true;
    }
    return false;
  };

  const handleSubmitUpdate = async (
    id: string,
    input: SuperAdminStoreUpdateInput,
  ): Promise<boolean> => {
    const res = await updateSuperAdminStore({ data: { id, input } });
    if (res.success && res.store) {
      showNotification(`Store '${res.store.name}' successfully updated.`);
      await fetchStores();
      onStoreMutated?.();
      return true;
    }
    return false;
  };

  const handleConfirmStatusChange = async (
    store: SuperAdminManagedStore,
    newStatus: StoreStatus,
    reason?: string,
  ): Promise<boolean> => {
    const res = await updateSuperAdminStoreStatus({
      data: { id: store.id, status: newStatus, reason },
    });
    if (res.success) {
      showNotification(`Store '${store.name}' status updated to ${newStatus}.`);
      await fetchStores();
      onStoreMutated?.();
      return true;
    }
    return false;
  };

  const handleConfirmArchive = async (store: SuperAdminManagedStore): Promise<boolean> => {
    const res = await deleteSuperAdminStore({ data: store.id });
    if (res.success) {
      showNotification(`Store '${store.name}' has been archived.`);
      await fetchStores();
      onStoreMutated?.();
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Page Heading & Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#E8EAF5] bg-white p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6538F5] hover:text-[#4B20D8] transition"
          >
            <ArrowLeft className="size-4" />
            <span>Return to Overview</span>
          </button>
          <span className="text-[#E8EAF5]">/</span>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#F0EBFF] text-[#6538F5]">
              <Store className="size-4" />
            </span>
            <h1 className="text-lg font-black text-[#101438]">Stores Management</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="rounded-xl border border-[#E8EAF5] bg-white px-3.5 py-2 text-xs font-bold text-[#101438] hover:bg-[#F8F8FF] transition shadow-xs"
          >
            Dashboard View
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#4B20D8] transition active:scale-95"
          >
            <Plus className="size-4" />
            <span>Add New Store</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-[#08C784]/30 bg-[#EBFBF5] p-3 text-xs font-bold text-[#08C784] shadow-xs"
        >
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[#08C784] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <SuperAdminStoresSummaryCards
        summary={summary}
        selectedStatus={status}
        onSelectStatus={(s) => {
          setStatus(s);
          setPage(1);
        }}
      />

      {/* Filter and Search Toolbar */}
      <SuperAdminStoresToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(s) => {
          setStatus(s);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(c) => {
          setCategory(c);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(sb) => {
          setSortBy(sb);
          setPage(1);
        }}
        summary={summary}
        onRefresh={fetchStores}
        isRefreshing={isRefreshing}
        onOpenAddModal={handleOpenAdd}
      />

      {/* Stores Table */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#E8EAF5] bg-white p-12">
          <div className="text-center">
            <RefreshCw className="mx-auto size-7 animate-spin text-[#6538F5]" />
            <p className="mt-3 text-xs font-semibold text-[#626E9D]">
              Loading platform storefronts...
            </p>
          </div>
        </div>
      ) : (
        <SuperAdminStoresTable
          stores={stores}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewDetails={handleViewDetails}
          onEditStore={handleOpenEdit}
          onChangeStatus={(store, newStatus) => handleOpenStatusAction(store, newStatus)}
          onArchiveStore={handleOpenArchiveAction}
        />
      )}

      {/* Details Slide-Over Drawer */}
      <SuperAdminStoreDetailsDrawer
        store={selectedDrawerStore}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(store) => {
          handleOpenEdit(store);
        }}
        onChangeStatus={(store, newStatus) => handleOpenStatusAction(store, newStatus)}
      />

      {/* Add / Edit Store Modal */}
      <SuperAdminStoreFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        storeToEdit={storeToEdit}
        onSubmitCreate={handleSubmitCreate}
        onSubmitUpdate={handleSubmitUpdate}
      />

      {/* Status Change / Archive Modal */}
      <SuperAdminStoreStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        store={statusTargetStore}
        targetAction={statusTargetAction}
        onConfirmStatusChange={handleConfirmStatusChange}
        onConfirmArchive={handleConfirmArchive}
      />
    </div>
  );
}
