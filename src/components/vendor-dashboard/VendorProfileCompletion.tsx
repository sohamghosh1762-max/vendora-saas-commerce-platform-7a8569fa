import { CheckCircle2, ChevronRight, Circle } from "lucide-react";
import { REFERENCE_CHECKLIST, type DashboardChecklistItem } from "@/lib/vendor-dashboard-data";
import { cn } from "@/lib/utils";

interface VendorProfileCompletionProps {
  percentage?: number;
  items?: DashboardChecklistItem[];
  onSelectAction?: (actionKey: string) => void;
}

export function VendorProfileCompletion({
  percentage = 80,
  items = REFERENCE_CHECKLIST,
  onSelectAction,
}: VendorProfileCompletionProps) {
  return (
    <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Title & Percentage Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#110D27]">Store Profile Completion</h4>
        <span className="text-sm font-extrabold text-[#6538F5]">{percentage}%</span>
      </div>

      {/* Purple Progress Bar */}
      <div className="mt-2.5 mb-4 h-1.5 w-full overflow-hidden rounded-full bg-[#F0EBFE]">
        <div
          className="h-full rounded-full bg-[#6538F5] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist Rows */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectAction?.(item.actionKey)}
            className="flex w-full items-center justify-between rounded-xl p-1 text-left transition hover:bg-[#F9F8FD] active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              {item.completed ? (
                <CheckCircle2 className="size-4 shrink-0 text-[#10B981] fill-[#10B981] text-white" />
              ) : (
                <Circle className="size-4 shrink-0 text-[#CBD5E1]" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  item.completed ? "text-[#374151]" : "text-[#6B7280]",
                )}
              >
                {item.label}
              </span>
            </div>

            <ChevronRight className="size-3.5 text-[#9AA0B2] shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
