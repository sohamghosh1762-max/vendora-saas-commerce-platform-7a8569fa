export type DeliveryMethodId = "standard" | "express";

export interface DeliveryMethod {
  id: DeliveryMethodId;
  name: string;
  description: string;
  estimatedDays: string;
  estimatedDate: string;
  fee: number;
}

export type PaymentMethodType = "cod" | "upi" | "card";

export interface PaymentDetails {
  method: PaymentMethodType;
  status: "CONFIRMED_DEMO" | "PENDING_ON_DELIVERY";
  upiId?: string | undefined;
  cardLast4?: string | undefined;
  cardholderName?: string | undefined;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  apartment?: string | undefined;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  category: string;
  price: number;
  originalPrice: number;
  qty: number;
  image: string;
  selectedVariants?: Record<string, string> | undefined;
}

export interface OrderPriceBreakdown {
  subtotal: number;
  couponCode?: string | null | undefined;
  couponDiscount: number;
  deliveryFee: number;
  total: number;
}

export type OrderStatus =
  | "Placed"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export interface CustomerOrder {
  orderId: string;
  customerId?: string | undefined;
  customer: {
    id?: string | undefined;
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  priceBreakdown: OrderPriceBreakdown;
  deliveryMethod: DeliveryMethod;
  payment: PaymentDetails;
  orderStatus: OrderStatus;
  statusTimestamps?: Partial<Record<OrderStatus, string>> | undefined;
  createdAt: string; // ISO format
  estimatedDeliveryDate: string;
}

export interface CheckoutDraft {
  step: 1 | 2 | 3 | 4;
  shippingAddress: Partial<ShippingAddress>;
  deliveryMethodId: DeliveryMethodId;
  paymentMethod: PaymentMethodType;
  paymentForm?: {
    upiId?: string | undefined;
    cardNumber?: string | undefined;
    cardholderName?: string | undefined;
    cardExpiry?: string | undefined;
    cardCvv?: string | undefined;
  };
  updatedAt: string;
}
