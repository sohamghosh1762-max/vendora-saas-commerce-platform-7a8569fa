import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  Circle,
  Clock,
  Mail,
  MessageSquare,
  Package,
  RotateCcw,
  Search,
  Send,
  User,
  Users,
  X,
} from "lucide-react";
import type { VendorChatMessage, VendorConversation } from "@/lib/vendor-types";
import {
  getVendorConversations,
  markConversationAsRead,
  sendVendorMessage,
} from "@/lib/vendor-api";
import { cn } from "@/lib/utils";

export interface VendorMessagesViewProps {
  storeId?: string | undefined;
  storeName?: string | undefined;
}

export type ConversationFilter = "all" | "unread";

/** Format timestamp into human-readable label */
function formatMessageTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const timeStr = `${formattedHours}:${minutes} ${ampm}`;

    if (isToday) {
      return timeStr;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${timeStr}`;
  } catch {
    return timestamp;
  }
}

export function VendorMessagesView({
  storeId = "the-urban-nest",
  storeName = "The Urban Nest",
}: VendorMessagesViewProps) {
  const [conversations, setConversations] = useState<VendorConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const reloadConversations = () => {
    try {
      const items = getVendorConversations(storeId);
      setConversations(items);
      setError(null);
      // Auto-select first conversation if none selected
      if (!activeConversationId && items.length > 0) {
        setActiveConversationId(items[0]?.id || null);
      }
    } catch {
      setError("Conversations could not be loaded. Please check storage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    reloadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // Scroll to bottom when active conversation or messages change
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  useEffect(() => {
    if (activeConversation && typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages.length, activeConversationId]);

  // Mark as read when selecting conversation
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setMobileThreadOpen(true);

    const conv = conversations.find((c) => c.id === conversationId);
    if (conv && conv.unreadCount > 0) {
      const res = markConversationAsRead(conversationId, storeId);
      if (res.success && res.conversation) {
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? res.conversation! : c)),
        );
      }
    }
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversationId) return;

    const res = sendVendorMessage(activeConversationId, replyText, storeId);
    if (res.success && res.conversation) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? res.conversation! : c)),
      );
      setReplyText("");
    }
  };

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter((c) => {
      const matchesSearch =
        !query ||
        c.customerName.toLowerCase().includes(query) ||
        c.customerEmail.toLowerCase().includes(query) ||
        (c.orderNumber && c.orderNumber.toLowerCase().includes(query));

      const matchesFilter = filter === "all" || (filter === "unread" && c.unreadCount > 0);

      return matchesSearch && matchesFilter;
    });
  }, [conversations, search, filter]);

  // Total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CU";

  return (
    <div className="space-y-4">
      {/* Top Header Summary */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#ECEAF5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#110D27]">Messages & Customer Inquiries</h2>
            {totalUnreadCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                {totalUnreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#7A7F93] mt-0.5">
            Direct communication with buyers of {storeName}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
              filter === "all"
                ? "bg-[#6538F5] text-white"
                : "bg-[#F4F2FC] text-[#554F6D] hover:bg-[#EBE7FA]",
            )}
          >
            <span>All</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                filter === "all" ? "bg-white/20 text-white" : "bg-white text-[#6538F5]",
              )}
            >
              {conversations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition",
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100",
            )}
          >
            <span>Unread</span>
            {totalUnreadCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px]",
                  filter === "unread" ? "bg-white/20 text-white" : "bg-white text-blue-700",
                )}
              >
                {totalUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="rounded-2xl border border-[#ECEAF5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {loading ? (
          <div role="status" className="py-24 text-center text-sm text-[#7A7F93]">
            Loading customer conversations...
          </div>
        ) : error ? (
          <div role="alert" className="p-12 text-center space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle className="size-6" />
            </div>
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button
              type="button"
              onClick={reloadConversations}
              className="rounded-xl bg-[#6538F5] px-4 py-2 text-xs font-bold text-white hover:bg-[#5228D9]"
            >
              Try Again
            </button>
          </div>
        ) : conversations.length === 0 ? (
          /* Empty Store State */
          <div
            data-testid="messages-empty-state"
            className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center"
          >
            <div className="grid size-14 place-items-center rounded-2xl bg-[#F0EBFE] text-[#6538F5]">
              <MessageSquare className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#110D27]">No customer messages yet</h3>
            <p className="mt-1 max-w-sm text-xs text-[#7A7F93]">
              When shoppers or buyers have questions about your products or orders at {storeName},
              their inquiries will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
            {/* Left Panel: Conversations List */}
            <div
              className={cn(
                "md:col-span-5 lg:col-span-4 border-r border-[#ECEAF5] flex flex-col",
                mobileThreadOpen ? "hidden md:flex" : "flex",
              )}
            >
              {/* Search Box */}
              <div className="p-3 border-b border-[#ECEAF5]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#7A7F93]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by customer name..."
                    aria-label="Search conversations"
                    className="w-full rounded-xl border border-[#ECEAF5] bg-[#FDFCFE] py-2 pl-9 pr-8 text-xs text-[#110D27] outline-none transition placeholder:text-[#908DA3] focus:border-[#6538F5] focus:bg-white"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear conversation search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A7F93] hover:text-[#110D27]"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Conversations Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#ECEAF5] max-h-[520px]">
                {filteredConversations.length === 0 ? (
                  <div
                    data-testid="conversations-no-results"
                    className="p-8 text-center space-y-2"
                  >
                    <p className="text-xs font-semibold text-[#110D27]">
                      No conversations found
                    </p>
                    <p className="text-[11px] text-[#7A7F93]">
                      No messages match "{search}".
                    </p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="text-xs font-bold text-[#6538F5] hover:underline"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = conv.id === activeConversationId;
                    const isUnread = conv.unreadCount > 0;

                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => handleSelectConversation(conv.id)}
                        data-testid={`conversation-item-${conv.id}`}
                        className={cn(
                          "w-full text-left p-3.5 transition-colors flex items-start gap-3",
                          isSelected
                            ? "bg-[#F4F2FC] border-l-4 border-l-[#6538F5]"
                            : "hover:bg-[#FAF9FE] border-l-4 border-l-transparent",
                        )}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-[#6538F5] to-[#8C62FF] text-xs font-extrabold text-white shadow-2xs">
                            {initials(conv.customerName)}
                          </div>
                          {isUnread && (
                            <span
                              data-testid="unread-dot"
                              className="absolute -top-1 -right-1 size-3 rounded-full bg-blue-600 border-2 border-white"
                            />
                          )}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={cn(
                                "text-xs truncate block",
                                isUnread
                                  ? "font-extrabold text-[#110D27]"
                                  : "font-semibold text-[#110D27]",
                              )}
                            >
                              {conv.customerName}
                            </span>
                            <span className="text-[10px] text-[#7A7F93] shrink-0 whitespace-nowrap">
                              {formatMessageTime(conv.lastMessageTimestamp)}
                            </span>
                          </div>

                          {conv.orderNumber && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6538F5] mt-0.5">
                              <Package className="size-2.5" />
                              <span>{conv.orderNumber}</span>
                            </span>
                          )}

                          <p
                            className={cn(
                              "text-[11px] truncate mt-0.5",
                              isUnread
                                ? "font-bold text-[#110D27]"
                                : "text-[#7A7F93]",
                            )}
                          >
                            {conv.lastMessage}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Active Conversation Thread */}
            <div
              className={cn(
                "md:col-span-7 lg:col-span-8 flex flex-col bg-[#FDFCFE]",
                !mobileThreadOpen ? "hidden md:flex" : "flex",
              )}
            >
              {activeConversation ? (
                <>
                  {/* Thread Header */}
                  <div className="p-3.5 border-b border-[#ECEAF5] bg-white flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Mobile Back Button */}
                      <button
                        type="button"
                        onClick={() => setMobileThreadOpen(false)}
                        aria-label="Back to conversations list"
                        className="rounded-lg p-1.5 text-[#7A7F93] hover:bg-[#F4F2FC] md:hidden"
                      >
                        <ArrowLeft className="size-4" />
                      </button>

                      <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-[#6538F5] to-[#8C62FF] text-xs font-bold text-white">
                        {initials(activeConversation.customerName)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-[#110D27]">
                            {activeConversation.customerName}
                          </h3>
                          {activeConversation.orderNumber && (
                            <span className="rounded-md bg-[#F0EBFE] px-2 py-0.5 text-[10px] font-bold text-[#6538F5]">
                              Order {activeConversation.orderNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7A7F93]">
                          {activeConversation.customerEmail}{" "}
                          {activeConversation.customerPhone && (
                            <span>• {activeConversation.customerPhone}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Circle className="size-1.5 fill-emerald-500 text-emerald-500" />
                        <span>Active Buyer</span>
                      </span>
                    </div>
                  </div>

                  {/* Messages Thread Stream */}
                  <div
                    data-testid="message-thread-stream"
                    className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[440px]"
                  >
                    {activeConversation.messages.map((msg) => {
                      const isVendor = msg.senderRole === "vendor";

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex flex-col max-w-[80%]",
                            isVendor ? "ml-auto items-end" : "mr-auto items-start",
                          )}
                          data-testid={`message-item-${msg.id}`}
                        >
                          <span className="text-[10px] font-semibold text-[#7A7F93] mb-1 px-1">
                            {isVendor ? "You (Vendor Support)" : msg.senderName}
                          </span>

                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed",
                              isVendor
                                ? "bg-[#6538F5] text-white rounded-br-xs"
                                : "bg-white text-[#110D27] border border-[#ECEAF5] rounded-bl-xs",
                            )}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>

                          <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-[#908DA3]">
                            <span>{formatMessageTime(msg.timestamp)}</span>
                            {isVendor && <CheckCheck className="size-3 text-[#6538F5]" />}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input Box */}
                  <div className="p-3.5 border-t border-[#ECEAF5] bg-white">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${activeConversation.customerName}...`}
                        aria-label="Type your message"
                        className="flex-1 rounded-xl border border-[#ECEAF5] bg-[#FDFCFE] px-3.5 py-2 text-xs text-[#110D27] outline-none transition focus:border-[#6538F5] focus:bg-white placeholder:text-[#908DA3]"
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim()}
                        aria-label="Send message"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs",
                          replyText.trim()
                            ? "bg-[#6538F5] text-white hover:bg-[#5228D9]"
                            : "bg-[#ECEAF5] text-[#908DA3] cursor-not-allowed",
                        )}
                      >
                        <Send className="size-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[#7A7F93]">
                  <MessageSquare className="size-8 text-[#908DA3]" />
                  <p className="mt-2 text-xs font-semibold">
                    Select a conversation to view and reply
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

