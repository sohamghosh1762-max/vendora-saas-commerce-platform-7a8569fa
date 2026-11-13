import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { VendorMessagesView } from "@/components/vendor-dashboard/VendorMessagesView";
import { VendorNonDashboardView } from "@/components/vendor-dashboard/VendorNonDashboardView";
import {
  getVendorConversations,
  getVendorConversationById,
  sendVendorMessage,
  markConversationAsRead,
  getVendorUnreadMessagesCount,
} from "@/lib/vendor-api";
import { saveStoredConversations } from "@/lib/vendor-storage";
import type { VendorConversation } from "@/lib/vendor-types";

const testStoreId = "test-msg-store";
const otherStoreId = "other-vendor-store";

const mockConversations: VendorConversation[] = [
  {
    id: "conv-test-001",
    storeId: testStoreId,
    customerName: "Aarav Sharma",
    customerEmail: "aarav@example.com",
    customerPhone: "+91 98765 43210",
    unreadCount: 0,
    lastMessage: "Thank you for the quick assistance!",
    lastMessageTimestamp: "2026-11-13T10:00:00.000Z",
    createdAt: "2026-11-12T10:00:00.000Z",
    orderNumber: "#1001",
    messages: [
      {
        id: "msg-t-1",
        senderRole: "customer",
        senderName: "Aarav Sharma",
        text: "Hi, is this item covered under warranty?",
        timestamp: "2026-11-12T10:00:00.000Z",
        isRead: true,
      },
      {
        id: "msg-t-2",
        senderRole: "vendor",
        senderName: "Store Support",
        text: "Hello Aarav! Yes, it includes a 1-year manufacturer warranty.",
        timestamp: "2026-11-12T10:05:00.000Z",
        isRead: true,
      },
      {
        id: "msg-t-3",
        senderRole: "customer",
        senderName: "Aarav Sharma",
        text: "Thank you for the quick assistance!",
        timestamp: "2026-11-13T10:00:00.000Z",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-test-002",
    storeId: testStoreId,
    customerName: "Diya Patel",
    customerEmail: "diya@example.com",
    customerPhone: "+91 98111 22334",
    unreadCount: 2,
    lastMessage: "Can you change the delivery address to my office?",
    lastMessageTimestamp: "2026-11-13T11:30:00.000Z",
    createdAt: "2026-11-13T11:00:00.000Z",
    orderNumber: "#1002",
    messages: [
      {
        id: "msg-t-4",
        senderRole: "customer",
        senderName: "Diya Patel",
        text: "Hi, I just placed order #1002.",
        timestamp: "2026-11-13T11:00:00.000Z",
        isRead: false,
      },
      {
        id: "msg-t-5",
        senderRole: "customer",
        senderName: "Diya Patel",
        text: "Can you change the delivery address to my office?",
        timestamp: "2026-11-13T11:30:00.000Z",
        isRead: false,
      },
    ],
  },
  // Other store conversation
  {
    id: "conv-other-001",
    storeId: otherStoreId,
    customerName: "Foreign Buyer",
    customerEmail: "foreign@other.com",
    unreadCount: 1,
    lastMessage: "Inquiry about other store",
    lastMessageTimestamp: "2026-11-13T09:00:00.000Z",
    createdAt: "2026-11-13T09:00:00.000Z",
    messages: [
      {
        id: "msg-o-1",
        senderRole: "customer",
        senderName: "Foreign Buyer",
        text: "Inquiry about other store",
        timestamp: "2026-11-13T09:00:00.000Z",
        isRead: false,
      },
    ],
  },
];

describe("Vendor Messaging (Week 3, Block 3)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    saveStoredConversations(mockConversations);
  });

  it("displays customer conversations with customer name, latest message, timestamp and unread badge", () => {
    render(<VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />);

    // Customer names
    expect(screen.getAllByText("Aarav Sharma").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Diya Patel").length).toBeGreaterThan(0);

    // Latest messages
    expect(screen.getByText("Thank you for the quick assistance!")).toBeInTheDocument();
    expect(
      screen.getAllByText("Can you change the delivery address to my office?").length,
    ).toBeGreaterThan(0);

    // Diya has unread messages
    const unreadDot = screen.getByTestId("unread-dot");
    expect(unreadDot).toBeInTheDocument();

    // Order number badges
    expect(screen.getAllByText("#1001").length).toBeGreaterThan(0);
    expect(screen.getAllByText("#1002").length).toBeGreaterThan(0);
  });

  it("strictly scopes conversations to the current vendor store", () => {
    render(<VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />);

    // Foreign Buyer from other store should not be rendered
    expect(screen.queryByText("Foreign Buyer")).not.toBeInTheDocument();
    expect(screen.queryByText("Inquiry about other store")).not.toBeInTheDocument();

    // API check
    const convs = getVendorConversations(testStoreId);
    expect(convs.some((c) => c.customerEmail === "foreign@other.com")).toBe(false);
    expect(convs.length).toBe(2);
  });

  it("allows vendors to open a conversation and view complete message history", () => {
    render(<VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />);

    // Select Diya's conversation
    const diyaItem = screen.getByTestId("conversation-item-conv-test-002");
    fireEvent.click(diyaItem);

    // Thread stream should show both of Diya's messages
    const threadStream = screen.getByTestId("message-thread-stream");
    expect(within(threadStream).getByText("Hi, I just placed order #1002.")).toBeInTheDocument();
    expect(within(threadStream).getByText("Can you change the delivery address to my office?")).toBeInTheDocument();
  });

  it("implements sending messages with immediate UI update and timestamp", async () => {
    render(<VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />);

    // Select Aarav
    const aaravItem = screen.getByTestId("conversation-item-conv-test-001");
    fireEvent.click(aaravItem);

    // Type a reply
    const input = screen.getByLabelText(/type your message/i);
    fireEvent.change(input, {
      target: { value: "You are very welcome! Feel free to reach out anytime." },
    });

    const sendButton = screen.getByRole("button", { name: /send message/i });
    expect(sendButton).not.toBeDisabled();
    fireEvent.click(sendButton);

    // Sent message should appear immediately in thread
    const threadStream = screen.getByTestId("message-thread-stream");
    expect(
      within(threadStream).getByText("You are very welcome! Feel free to reach out anytime."),
    ).toBeInTheDocument();

    // Input should be cleared
    expect(input).toHaveValue("");

    // Conversation list should reflect latest message
    expect(
      within(aaravItem).getByText("You are very welcome! Feel free to reach out anytime."),
    ).toBeInTheDocument();
  });

  it("disables send when input is empty or whitespace only", () => {
    render(<VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />);

    const sendButton = screen.getByRole("button", { name: /send message/i });
    expect(sendButton).toBeDisabled();

    const input = screen.getByLabelText(/type your message/i);
    fireEvent.change(input, { target: { value: "    " } });
    expect(sendButton).toBeDisabled();
  });

  it("searches conversations by customer name", () => {
    render(<VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />);

    const searchInput = screen.getByLabelText(/search conversations/i);

    // Search Diya
    fireEvent.change(searchInput, { target: { value: "Diya" } });
    expect(screen.getAllByText("Diya Patel").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("conversation-item-conv-test-001")).not.toBeInTheDocument();

    // Clear search
    const clearButton = screen.getByLabelText(/clear conversation search/i);
    fireEvent.click(clearButton);
    expect(screen.getAllByText("Aarav Sharma").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Diya Patel").length).toBeGreaterThan(0);
  });

  it("filters conversations by unread status and marks as read upon selection", async () => {
    render(<VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />);

    // Filter Unread
    const unreadTab = screen.getByRole("button", { name: /unread/i });
    fireEvent.click(unreadTab);

    // Only Diya was unread
    expect(screen.getAllByText("Diya Patel").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("conversation-item-conv-test-001")).not.toBeInTheDocument();

    // Click Diya to open and mark as read
    const diyaItem = screen.getByTestId("conversation-item-conv-test-002");
    fireEvent.click(diyaItem);

    // Diya's conversation unread count should be cleared in storage
    const conv = getVendorConversationById("conv-test-002", testStoreId);
    expect(conv?.unreadCount).toBe(0);
  });

  it("persists sent messages using project storage across re-renders", () => {
    const { unmount } = render(
      <VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />,
    );

    // Send a message via API to simulate persistence
    const res = sendVendorMessage(
      "conv-test-001",
      "Your order will be packed with extra care.",
      testStoreId,
    );
    expect(res.success).toBe(true);

    unmount();

    // Re-render
    render(<VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />);
    expect(
      screen.getAllByText("Your order will be packed with extra care.").length,
    ).toBeGreaterThan(0);
  });

  it("handles empty store and empty search states gracefully", () => {
    // Empty store
    const { unmount } = render(
      <VendorMessagesView storeId="empty-store" storeName="Brand New Store" />,
    );
    expect(screen.getByTestId("messages-empty-state")).toBeInTheDocument();
    expect(screen.getByText(/no customer messages yet/i)).toBeInTheDocument();
    unmount();

    // Non-matching search
    render(<VendorMessagesView storeId={testStoreId} storeName="Handmade Haven" />);
    const searchInput = screen.getByLabelText(/search conversations/i);
    fireEvent.change(searchInput, { target: { value: "UnknownCustomer123" } });

    expect(screen.getByTestId("conversations-no-results")).toBeInTheDocument();
    expect(screen.getByText(/no conversations found/i)).toBeInTheDocument();

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    fireEvent.click(clearButton);
    expect(screen.getAllByText("Aarav Sharma").length).toBeGreaterThan(0);
  });

  it("renders seamlessly inside VendorNonDashboardView when activeTab is messages", () => {
    render(
      <VendorNonDashboardView
        activeTab="messages"
        onBackToDashboard={() => {}}
        storeId={testStoreId}
        storeName="Handmade Haven"
      />,
    );

    expect(screen.getByText("Messages & Customer Inquiries")).toBeInTheDocument();
    expect(screen.getAllByText("Aarav Sharma").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Diya Patel").length).toBeGreaterThan(0);
  });
});

