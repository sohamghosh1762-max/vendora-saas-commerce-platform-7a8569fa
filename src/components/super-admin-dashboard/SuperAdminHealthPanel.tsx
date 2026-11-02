import { CheckCircle2 } from "lucide-react";
import { PLATFORM_HEALTH } from "@/lib/super-admin-dashboard-data";

export function SuperAdminHealthPanel() {
  const { score, label, items } = PLATFORM_HEALTH;

  // SVG Circular progress constants
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E8EAF5] bg-[#FFFFFF] p-5 shadow-2xs">
      {/* Panel Header */}
      <div className="pb-2">
        <h2 className="text-base font-extrabold text-[#101438]">Platform Health</h2>
      </div>

      {/* Health Score Circular Gauge & Status */}
      <div className="flex items-center gap-3.5 rounded-xl bg-[#F8F8FF] p-3 my-2 border border-[#E8EAF5]">
        {/* SVG Circular Progress Meter */}
        <div className="relative size-14 shrink-0">
          <svg className="size-full -rotate-90" viewBox="0 0 60 60">
            {/* Background Circle */}
            <circle
              cx="30"
              cy="30"
              r={radius}
              className="text-[#E8EAF5]"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="30"
              cy="30"
              r={radius}
              className="text-[#08C784] transition-all duration-1000 ease-out"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-extrabold text-xs text-[#101438]">
            {score}%
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#101438]">
            <CheckCircle2 className="size-3.5 text-[#08C784]" />
            <span>{label}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-[#626E9D]">All core microservices nominal</p>
        </div>
      </div>

      {/* 5 Health Check Rows */}
      <div className="mt-2 space-y-2.5 text-xs">
        {items.map((item) => (
          <div key={item.service} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#08C784]" />
              <span className="text-[#626E9D] font-medium">{item.service}</span>
            </div>
            <span className="font-bold text-[#101438]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
