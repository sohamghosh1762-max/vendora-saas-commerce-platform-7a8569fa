import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Download, Check } from "lucide-react";
import { REFERENCE_ADMIN, generateDashboardCsvReport } from "@/lib/super-admin-dashboard-data";
import { cn } from "@/lib/utils";

interface SuperAdminWelcomeProps {
  dateRange: string;
  onChangeDateRange: (range: string) => void;
  onExportSuccess?: () => void;
}

const DATE_RANGE_OPTIONS = [
  "Oct 1, 2024 - Oct 26, 2024",
  "Last 7 Days (Oct 19 - Oct 26)",
  "Last 30 Days (Sep 26 - Oct 26)",
  "This Quarter (Q4 2024)",
  "Year to Date (2024)",
];

export function SuperAdminWelcome({
  dateRange,
  onChangeDateRange,
  onExportSuccess,
}: SuperAdminWelcomeProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadCsv = () => {
    const csvContent = generateDashboardCsvReport();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `vendora-super-admin-report-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onExportSuccess) {
      onExportSuccess();
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Welcome Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#101438] sm:text-3xl">
          Welcome back, {REFERENCE_ADMIN.name.split(" ")[0]}! 👋
        </h1>
        <p className="mt-1 text-xs text-[#626E9D] sm:text-sm">
          Here's what's happening across your Vendora platform today.
        </p>
      </div>

      {/* Right: Date-Range Selector & Export Report Button */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date-Range Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl border border-[#E8EAF5] bg-[#FFFFFF] px-3.5 py-2 text-xs font-semibold text-[#101438] shadow-2xs transition-colors hover:border-[#6538F5]/40 hover:bg-[#F8F8FF]"
            aria-label="Select date range"
            aria-expanded={isDropdownOpen}
          >
            <Calendar className="size-3.5 text-[#626E9D]" />
            <span>{dateRange}</span>
            <ChevronDown
              className={cn(
                "size-3.5 text-[#626E9D] transition-transform duration-200",
                isDropdownOpen ? "rotate-180" : "",
              )}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-[#E8EAF5] bg-[#FFFFFF] p-1.5 shadow-card z-40 animate-in fade-in duration-100">
              {DATE_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChangeDateRange(opt);
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors",
                    dateRange === opt
                      ? "bg-[#F0EBFF] text-[#6538F5]"
                      : "text-[#101438] hover:bg-[#F8F8FF]",
                  )}
                >
                  <span>{opt}</span>
                  {dateRange === opt && <Check className="size-3.5 text-[#6538F5]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Violet Export Report Button */}
        <button
          type="button"
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#4B20D8] active:scale-98"
          aria-label="Export Report"
        >
          <Download className="size-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
}
