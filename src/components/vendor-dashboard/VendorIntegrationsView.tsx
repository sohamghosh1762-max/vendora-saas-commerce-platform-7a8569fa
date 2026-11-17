import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Boxes,
  Check,
  CheckCircle2,
  ExternalLink,
  Key,
  Plug,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import type {
  IntegrationCategory,
  IntegrationStatus,
  VendorIntegration,
} from "@/lib/vendor-types";
import {
  getVendorIntegrations,
  toggleVendorIntegration,
} from "@/lib/vendor-api";

export interface VendorIntegrationsViewProps {
  storeId?: string | undefined;
  storeName?: string | undefined;
}

const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  payments: "Payment Gateways",
  shipping: "Logistics & Shipping",
  accounting: "Accounting & ERP",
  marketing: "Analytics & Ads",
  communication: "Customer Messaging",
};

export function VendorIntegrationsView({
  storeId = "the-urban-nest",
  storeName = "The Urban Nest",
}: VendorIntegrationsViewProps) {
  const [integrations, setIntegrations] = useState<VendorIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | IntegrationCategory>("all");

  // Config modal
  const [editingIntegration, setEditingIntegration] = useState<VendorIntegration | null>(null);
  const [configKey, setConfigKey] = useState("");
  const [configSuccess, setConfigSuccess] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const loadData = () => {
    try {
      const items = getVendorIntegrations(storeId);
      setIntegrations(items);
      setError(null);
    } catch {
      setError("Failed to load integrations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const filteredIntegrations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return integrations.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [integrations, search, selectedCategory]);

  const handleToggleConnection = (integration: VendorIntegration) => {
    const isCurrentlyConnected = integration.status === "connected";
    const nextConnect = !isCurrentlyConnected;

    const res = toggleVendorIntegration(storeId, integration.id, nextConnect);
    if (res.success && res.integration) {
      setIntegrations(getVendorIntegrations(storeId));
      setFeedback({
        message: nextConnect
          ? `Successfully connected ${integration.name}.`
          : `Disconnected ${integration.name}.`,
        isError: false,
      });
      setTimeout(() => setFeedback(null), 3500);
    } else {
      setFeedback({
        message: res.error || "Failed to update integration.",
        isError: true,
      });
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIntegration) return;

    const res = toggleVendorIntegration(storeId, editingIntegration.id, true, {
      apiKey: configKey,
    });
    if (res.success) {
      setIntegrations(getVendorIntegrations(storeId));
      setConfigSuccess(true);
      setTimeout(() => {
        setConfigSuccess(false);
        setEditingIntegration(null);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[#ECEAF5] bg-white p-8 text-center shadow-xs"
      >
        <div className="size-8 animate-spin rounded-full border-3 border-[#6538F5] border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-[#7A7F93]">Loading external integrations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center">
        <AlertCircle className="size-10 text-rose-500" />
        <h3 className="mt-3 text-base font-bold text-rose-900">Integrations Unavailable</h3>
        <p className="mt-1 text-xs text-rose-700 max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            loadData();
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
        >
          <RefreshCw className="size-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold shadow-xs ${
            feedback.isError
              ? "border border-rose-200 bg-rose-50 text-rose-800"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.isError ? (
              <AlertCircle className="size-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="size-4 text-emerald-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Info Banner */}
      <div className="rounded-2xl border border-[#D6CEFC] bg-[#FAF9FF] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#6538F5] text-white">
            <Plug className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#110D27]">
              E-Commerce API Connections & Webhooks
            </h4>
            <p className="text-[11px] text-[#7A7F93]">
              Connect third-party logistics, payment processors, and analytics tools to automate {storeName}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#7A7F93]">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="size-3" />
            Functional
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-gray-600">
            UI Preview
          </span>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#7A7F93]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search integrations by service or category..."
              className="w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] py-2 pl-9 pr-8 text-xs font-medium text-[#110D27] placeholder:text-[#7A7F93] focus:border-[#6538F5] focus:bg-white focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-[#6538F5] text-white shadow-xs"
                  : "bg-[#F9F8FD] text-[#7A7F93] hover:bg-[#F0EBFE] hover:text-[#6538F5]"
              }`}
            >
              All Categories
            </button>
            {(["payments", "shipping", "communication", "accounting", "marketing"] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#6538F5] text-white shadow-xs"
                      : "bg-[#F9F8FD] text-[#7A7F93] hover:bg-[#F0EBFE] hover:text-[#6538F5]"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      {filteredIntegrations.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-[#ECEAF5] bg-white p-8 text-center shadow-xs">
          <Boxes className="size-8 text-[#7A7F93]" />
          <h4 className="mt-3 text-sm font-bold text-[#110D27]">No integrations found</h4>
          <p className="mt-1 text-xs text-[#7A7F93]">
            No services match your query. Try searching for "payments", "shipping", or clear filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="integrations-grid">
          {filteredIntegrations.map((item) => {
            const isConnected = item.status === "connected";
            const isActionRequired = item.status === "action_required";

            return (
              <div
                key={item.id}
                data-testid={`integration-card-${item.id}`}
                className="flex flex-col justify-between rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:border-[#D6CEFC]"
              >
                <div>
                  {/* Card Header: Icon, Status Badge & Functional Pill */}
                  <div className="flex items-start justify-between">
                    <div className="grid size-11 place-items-center rounded-2xl bg-[#F0EBFE] text-base font-black text-[#6538F5]">
                      {item.name.charAt(0)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* Connection Status Pill */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isConnected
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isActionRequired
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            isConnected
                              ? "bg-emerald-500"
                              : isActionRequired
                                ? "bg-amber-500"
                                : "bg-gray-400"
                          }`}
                        />
                        {isConnected
                          ? "Connected"
                          : isActionRequired
                            ? "Setup Required"
                            : "Disconnected"}
                      </span>

                      {/* Demonstration vs Functional Distinction */}
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                          item.isFunctional
                            ? "bg-purple-50 text-[#6538F5]"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.isFunctional ? "Functional Service" : "UI Demo"}
                      </span>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="mt-3">
                    <h4 className="text-sm font-bold text-[#110D27]">{item.name}</h4>
                    <span className="text-[10px] font-semibold text-[#7A7F93] uppercase tracking-wider">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    <p className="mt-1 text-xs text-[#4A4F68] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Masked API Key / Details if Connected */}
                  {isConnected && item.apiKeyMasked && (
                    <div className="mt-3 rounded-lg bg-[#FAF9FD] p-2 text-[11px] text-[#7A7F93] flex items-center justify-between">
                      <span className="font-mono">{item.apiKeyMasked}</span>
                      <Key className="size-3 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Footer Controls: Toggle & Settings */}
                <div className="mt-4 flex items-center justify-between border-t border-[#ECEAF5] pt-3">
                  {isConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIntegration(item);
                        setConfigKey(item.config?.apiKey || "");
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#7A7F93] hover:text-[#6538F5]"
                    >
                      <Settings2 className="size-3.5" />
                      <span>Configure</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleConnection(item)}
                    className={`ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                      isConnected
                        ? "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                        : "bg-[#6538F5] text-white hover:bg-[#5228D9]"
                    }`}
                  >
                    {isConnected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Integration Configuration Modal */}
      {editingIntegration && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ECEAF5] pb-3">
              <div>
                <h3 className="text-base font-black text-[#110D27]">
                  {editingIntegration.name} Settings
                </h3>
                <p className="text-xs text-[#7A7F93]">Manage API keys and sync parameters</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingIntegration(null)}
                className="grid size-8 place-items-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#110D27]">
                  Production API Key
                </label>
                <input
                  type="text"
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  placeholder="Enter token or API secret key..."
                  className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 text-xs font-medium text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-[#FAF9FF] p-3 text-xs text-[#7A7F93]">
                <p className="font-bold text-[#110D27]">Automated Sync</p>
                Status checks and webhook listeners are active for this endpoint.
              </div>

              {configSuccess && (
                <p className="text-xs font-semibold text-emerald-600">
                  Settings saved successfully.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingIntegration(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#7A7F93] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9]"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

