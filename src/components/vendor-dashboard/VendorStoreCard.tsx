import { useState } from "react";
import { Check, Copy, ExternalLink, Home, PenLine } from "lucide-react";
import storeUrbanNestCover from "@/assets/store-urban-nest.jpg";
import { Link } from "@tanstack/react-router";

interface VendorStoreCardProps {
  storeName?: string;
  storeSlug?: string;
  storeUrl?: string;
  storeStatus?: "Active" | "Pending" | "Inactive";
  coverImage?: string;
  logoImage?: string;
  tagline?: string;
  onEditStore?: () => void;
}

export function VendorStoreCard({
  storeName = "The Urban Nest",
  storeSlug = "the-urban-nest",
  storeUrl = "vendora.com/stores/the-urban-nest",
  storeStatus = "Active",
  coverImage = storeUrbanNestCover,
  logoImage,
  tagline = "Your Storefront",
  onEditStore,
}: VendorStoreCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`https://${storeUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ECEAF5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Cover Banner with Floating Edit Store button */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-[#F4F2FC]">
        <img src={coverImage} alt={`${storeName} Cover`} className="size-full object-cover" />
        {/* Soft overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

        {/* Floating Edit Store Button */}
        <button
          type="button"
          onClick={onEditStore}
          className="absolute right-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#110D27] shadow-sm backdrop-blur-xs transition hover:bg-white active:scale-95"
        >
          <span>Edit Store</span>
        </button>

        {/* Overlapping Circular Store Logo Badge */}
        <div className="absolute -bottom-6 left-5 z-10 flex size-13 items-center justify-center rounded-full border-2 border-white bg-white shadow-md">
          <div className="flex flex-col items-center justify-center text-center p-1">
            <Home className="size-4 text-[#110D27] stroke-[2]" />
            {logoImage ? (
              <img src={logoImage} alt="" className="size-full rounded-full object-cover" />
            ) : (
              <span className="text-[6.5px] font-black uppercase tracking-tighter text-[#110D27] leading-tight">
                {storeName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-5 pt-8 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-[#110D27] leading-tight">{storeName}</h3>
            <p className="mt-0.5 text-xs text-[#7A7F93] font-medium leading-tight">{tagline}</p>
          </div>

          <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[10px] font-bold text-[#15803D]">
            {storeStatus}
          </span>
        </div>

        {/* Public Store URL Pill */}
        <div className="mt-3.5 flex items-center justify-between rounded-xl border border-[#ECEAF5] bg-[#F7F6FD] px-3 py-2 text-xs">
          <Link
            to="/store/$id"
            params={{ id: storeSlug }}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-medium text-[#5B6275] hover:text-[#6538F5] hover:underline"
            title={`Visit ${storeUrl}`}
          >
            {storeUrl}
          </Link>

          <button
            type="button"
            onClick={handleCopyUrl}
            className="ml-2 flex items-center gap-1 rounded-md p-1 text-[#7A7F93] transition hover:bg-white hover:text-[#110D27]"
            title="Copy public store URL"
            aria-label="Copy public store URL"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981]">
                <Check className="size-3.5" />
                Copied
              </span>
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
