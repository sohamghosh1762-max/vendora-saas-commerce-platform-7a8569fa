import { Store, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import type { SuperAdminStoresSummary, StoreStatus } from "@/lib/super-admin-types";

interface SuperAdminStoresSummaryCardsProps {
  summary: SuperAdminStoresSummary;
  selectedStatus: "All" | StoreStatus;
  onSelectStatus: (status: "All" | StoreStatus) => void;
}

export function SuperAdminStoresSummaryCards({
  summary,
  selectedStatus,
  onSelectStatus,
}: SuperAdminStoresSummaryCardsProps) {
  const cards = [
    {
      id: "All" as const,
      label: "Total Stores",
      count: summary.total,
      sublabel: "Platform storefronts",
      icon: Store,
      bgIcon: "bg-[#F0EBFF] text-[#6538F5]",
      borderActive: "border-[#6538F5] ring-2 ring-[#6538F5]/20",
      indicator: "bg-[#6538F5]",
    },
    {
      id: "Active" as const,
      label: "Active Stores",
      count: summary.active,
      sublabel: "Transacting normally",
      icon: ShieldCheck,
      bgIcon: "bg-[#EBFBF5] text-[#08C784]",
      borderActive: "border-[#08C784] ring-2 ring-[#08C784]/20",
      indicator: "bg-[#08C784]",
    },
    {
      id: "Pending" as const,
      label: "Pending Verification",
      count: summary.pending,
      sublabel: "Awaiting approval",
      icon: Clock,
      bgIcon: "bg-[#FFF8E6] text-[#FF8A00]",
      borderActive: "border-[#FF8A00] ring-2 ring-[#FF8A00]/20",
      indicator: "bg-[#FF8A00]",
    },
    {
      id: "Suspended" as const,
      label: "Suspended Stores",
      count: summary.suspended,
      sublabel: "Compliance review",
      icon: AlertTriangle,
      bgIcon: "bg-[#FEECEE] text-[#FF4D5A]",
      borderActive: "border-[#FF4D5A] ring-2 ring-[#FF4D5A]/20",
      indicator: "bg-[#FF4D5A]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = selectedStatus === c.id;

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectStatus(c.id)}
            className={`group flex items-center justify-between rounded-2xl border bg-white p-5 text-left transition-all duration-200 hover:shadow-soft active:scale-[0.99] ${
              isSelected ? c.borderActive : "border-[#E8EAF5] hover:border-[#6538F5]/30"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${c.indicator}`} />
                <span className="text-xs font-semibold text-[#626E9D]">{c.label}</span>
              </div>
              <p className="mt-2 text-2xl font-black tracking-tight text-[#101438] sm:text-3xl">
                {c.count}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#626E9D]">{c.sublabel}</p>
            </div>

            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-transform group-hover:scale-105 ${c.bgIcon}`}
            >
              <Icon className="size-6" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
