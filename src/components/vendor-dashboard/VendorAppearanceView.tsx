import { useState, useEffect } from "react";
import {
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Paintbrush,
  Sparkles,
  Store,
  Upload,
} from "lucide-react";
import type { VendorStore } from "@/lib/vendor-types";
import { getVendorStore, updateVendorStore } from "@/lib/vendor-api";

export interface VendorAppearanceViewProps {
  storeId?: string | undefined;
  storeName?: string | undefined;
  store?: VendorStore | null;
  onStoreUpdated?: () => void;
}

const THEME_PRESETS = [
  { id: "purple", label: "Royal Indigo", primary: "#6538F5", tint: "bg-[#F0EBFE] text-[#6538F5]" },
  { id: "blue", label: "Ocean Cobalt", primary: "#2563EB", tint: "bg-blue-50 text-blue-700" },
  { id: "emerald", label: "Artisan Mint", primary: "#059669", tint: "bg-emerald-50 text-emerald-700" },
  { id: "rose", label: "Blush Berry", primary: "#E11D48", tint: "bg-rose-50 text-rose-700" },
  { id: "amber", label: "Warm Amber", primary: "#D97706", tint: "bg-amber-50 text-amber-700" },
];

export function VendorAppearanceView({
  storeId = "the-urban-nest",
  storeName = "The Urban Nest",
  store: initialStore,
  onStoreUpdated,
}: VendorAppearanceViewProps) {
  const [store, setStore] = useState<VendorStore | null>(initialStore || null);
  const [tagline, setTagline] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("purple");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    const s = getVendorStore(storeId);
    if (s) {
      setStore(s);
      setTagline(s.tagline || "");
      setCoverUrl(s.cover || "");
    }
  }, [storeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const theme = THEME_PRESETS.find((t) => t.id === selectedTheme);
    const updated = await updateVendorStore(storeId, {
      tagline,
      cover: coverUrl || undefined,
      tint: theme?.tint || "bg-cat-home text-cat-home-fg",
    });

    if (updated) {
      setStore(updated);
      setSavedFeedback(true);
      onStoreUpdated?.();
      setTimeout(() => setSavedFeedback(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {savedFeedback && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Storefront appearance updated successfully!</span>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="rounded-2xl border border-[#D6CEFC] bg-[#FAF9FF] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#6538F5] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            <Paintbrush className="size-3" />
            Storefront Customization
          </span>
          <h3 className="mt-2 text-base font-black text-[#110D27]">
            Branding & Visual Theme
          </h3>
          <p className="mt-0.5 text-xs text-[#7A7F93]">
            Customize banner, colors, and layout elements visible to customers on your public storefront.
          </p>
        </div>

        <a
          href={`/store/${store?.slug || storeId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECEAF5] bg-white px-3.5 py-2 text-xs font-bold text-[#110D27] shadow-xs hover:bg-[#F9F8FD] hover:text-[#6538F5] shrink-0"
        >
          <Eye className="size-3.5 text-[#6538F5]" />
          <span>View Public Storefront</span>
          <ExternalLink className="size-3 text-gray-400" />
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Form */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label htmlFor="store-tagline" className="block text-xs font-bold text-[#110D27]">
                Storefront Subtitle / Tagline
              </label>
              <input
                id="store-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Curated artisan decor & handcrafted lifestyle essentials"
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 text-xs font-medium text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Accent Theme Presets */}
            <div>
              <span className="block text-xs font-bold text-[#110D27]">
                Brand Accent Color
              </span>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {THEME_PRESETS.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-bold transition ${
                        isSelected
                          ? "border-[#6538F5] bg-[#F0EBFE] text-[#6538F5]"
                          : "border-[#ECEAF5] bg-white text-[#7A7F93] hover:border-gray-300"
                      }`}
                    >
                      <span
                        className="size-4 shrink-0 rounded-full border border-black/10"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <span className="truncate">{theme.label}</span>
                      {isSelected && <Check className="ml-auto size-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner Cover URL */}
            <div>
              <label htmlFor="banner-cover" className="block text-xs font-bold text-[#110D27]">
                Cover Banner Image URL
              </label>
              <input
                id="banner-cover"
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="mt-1 w-full rounded-xl border border-[#ECEAF5] bg-[#F9F8FD] p-2.5 text-xs font-medium text-[#110D27] focus:border-[#6538F5] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end border-t border-[#ECEAF5] pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6538F5] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#5228D9] disabled:opacity-50"
              >
                <span>{saving ? "Saving..." : "Save Appearance Settings"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="rounded-2xl border border-[#ECEAF5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F93]">
            Live Storefront Card Preview
          </span>

          <div className="overflow-hidden rounded-xl border border-[#ECEAF5] shadow-xs">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="Store cover preview"
                className="h-28 w-full object-cover"
              />
            ) : (
              <div className="h-28 w-full bg-gradient-to-r from-[#6538F5] to-[#8C62FF] grid place-items-center text-white/50">
                <ImageIcon className="size-8" />
              </div>
            )}

            <div className="p-4 space-y-2 bg-white">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#F0EBFE] font-bold text-[#6538F5]">
                  {store?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#110D27]">{store?.name || storeName}</h4>
                  <p className="text-[11px] text-[#7A7F93]">{tagline || store?.tagline || "Artisan Store"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[10px] text-[#7A7F93] border-t border-[#ECEAF5]">
                <span>⭐ {store?.rating || "4.9"} rating</span>
                <span>•</span>
                <span>{store?.productCount || "48"} products</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

