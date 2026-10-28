import { ExternalLink, Package, Plus, Settings } from "lucide-react";

interface VendorQuickActionsProps {
  onAddProduct?: () => void;
  onManageProducts?: () => void;
  onViewStore?: () => void;
  onStoreSettings?: () => void;
}

export function VendorQuickActions({
  onAddProduct,
  onManageProducts,
  onViewStore,
  onStoreSettings,
}: VendorQuickActionsProps) {
  const actions = [
    {
      id: "add-product",
      label: "Add Product",
      icon: Plus,
      bgCard: "bg-[#F4F0FD] hover:bg-[#ECE5FC] border-[#ECE5FC]",
      iconBg: "bg-[#6538F5] text-white",
      onClick: onAddProduct,
    },
    {
      id: "manage-products",
      label: "Manage Products",
      icon: Package,
      bgCard: "bg-[#EFF6FF] hover:bg-[#E1EFFF] border-[#E1EFFF]",
      iconBg: "bg-[#3B82F6] text-white",
      onClick: onManageProducts,
    },
    {
      id: "view-store",
      label: "View Store",
      icon: ExternalLink,
      bgCard: "bg-[#ECFDF5] hover:bg-[#D1FAE5] border-[#D1FAE5]",
      iconBg: "bg-[#10B981] text-white",
      onClick: onViewStore,
    },
    {
      id: "store-settings",
      label: "Store Settings",
      icon: Settings,
      bgCard: "bg-[#FFF7ED] hover:bg-[#FFEDD5] border-[#FFEDD5]",
      iconBg: "bg-[#F97316] text-white",
      onClick: onStoreSettings,
    },
  ];

  return (
    <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <h4 className="text-sm font-bold text-[#110D27] mb-3.5">Quick Actions</h4>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 transition-all active:scale-[0.98] ${act.bgCard}`}
            >
              <div
                className={`grid size-9 place-items-center rounded-full shadow-xs transition-transform group-hover:scale-105 ${act.iconBg}`}
              >
                <Icon className="size-4 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-[#110D27] text-center leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
