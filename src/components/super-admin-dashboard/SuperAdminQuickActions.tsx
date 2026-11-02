import { Store, UserCheck, Package, BarChart3 } from "lucide-react";
import { QUICK_ACTIONS, type QuickActionItem } from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

interface SuperAdminQuickActionsProps {
  onTriggerAction: (actionId: QuickActionItem["id"]) => void;
}

const ICON_MAP = {
  Store: Store,
  UserCheck: UserCheck,
  Package: Package,
  BarChart3: BarChart3,
};

export function SuperAdminQuickActions({ onTriggerAction }: SuperAdminQuickActionsProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-5 shadow-2xs">
      {/* Panel Header */}
      <div className="pb-3">
        <h2 className="text-base font-extrabold text-[#101438]">Quick Actions</h2>
      </div>

      {/* 2x2 Grid of Actions */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {QUICK_ACTIONS.map((action) => {
          const Icon = ICON_MAP[action.iconName];

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onTriggerAction(action.id)}
              className={cn(
                "group flex flex-col items-center justify-center rounded-2xl border border-transparent p-4 text-center transition-all duration-200 hover:shadow-soft active:scale-98",
                action.bgColor,
                action.hoverBorder,
              )}
            >
              <div
                className={cn(
                  "grid size-11 place-items-center rounded-xl bg-white/80 shadow-2xs transition-transform group-hover:scale-110",
                  action.iconColor,
                )}
              >
                <Icon className="size-5.5" />
              </div>
              <span className="mt-2.5 text-xs font-bold text-[#101438]">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
