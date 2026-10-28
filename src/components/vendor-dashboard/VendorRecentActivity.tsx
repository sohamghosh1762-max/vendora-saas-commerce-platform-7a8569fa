import { REFERENCE_ACTIVITY, type DashboardActivity } from "@/lib/vendor-dashboard-data";
import { cn } from "@/lib/utils";

interface VendorRecentActivityProps {
  activities?: DashboardActivity[];
  onViewAll?: () => void;
  onSelectActivity?: (activity: DashboardActivity) => void;
}

export function VendorRecentActivity({
  activities = REFERENCE_ACTIVITY,
  onViewAll,
  onSelectActivity,
}: VendorRecentActivityProps) {
  const dotColorMap = {
    green: "bg-[#10B981]",
    blue: "bg-[#3B82F6]",
    purple: "bg-[#8B5CF6]",
    orange: "bg-[#F97316]",
  };

  return (
    <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h4 className="text-sm font-bold text-[#110D27]">Recent Activity</h4>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-[#6538F5] transition hover:underline"
        >
          View All
        </button>
      </div>

      {/* Activity Items */}
      <div className="mt-2 space-y-3">
        {activities.map((act) => (
          <div
            key={act.id}
            onClick={() => onSelectActivity?.(act)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectActivity?.(act);
              }
            }}
            className="flex items-start justify-between gap-2.5 rounded-xl p-1 text-left transition hover:bg-[#F9F8FD] cursor-pointer"
          >
            {/* Dot + Text */}
            <div className="flex items-start gap-2.5 min-w-0">
              <span
                className={cn(
                  "size-2 rounded-full mt-1.5 shrink-0",
                  dotColorMap[act.color] || dotColorMap.purple,
                )}
              />
              <div className="min-w-0">
                <span className="block text-xs font-bold text-[#110D27] leading-tight truncate">
                  {act.title}
                </span>
                <span className="block text-[11px] text-[#7A7F93] leading-tight mt-0.5 truncate">
                  {act.description}
                </span>
              </div>
            </div>

            {/* Time Ago on Right */}
            <span className="shrink-0 text-[10px] text-[#9AA0B2] font-medium pt-0.5">
              {act.timeAgo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
