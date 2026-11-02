import { z } from "zod";

// Phone number: 10-digit Indian mobile number optionally prefixed with +91 or 0
const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6-9]\d{9}$/;

// Indian Postal Code: 6 digits, cannot start with 0
const pinCodeRegex = /^[1-9][0-9]{5}$/;

// UPI ID format: username@bank
const upiRegex = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/;

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().regex(phoneRegex, "Please enter a valid 10-digit mobile number"),
  addressLine: z.string().trim().min(5, "Street address must be at least 5 characters"),
  apartment: z.string().trim().optional(),
  city: z.string().trim().min(2, "City name must be at least 2 characters"),
  state: z.string().trim().min(2, "Please select or enter your state"),
  pinCode: z.string().trim().regex(pinCodeRegex, "Please enter a valid 6-digit Indian PIN code"),
  country: z.string().trim().min(2, "Country is required"),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;

export const deliveryMethodSchema = z.object({
  deliveryMethodId: z.enum(["standard", "express"]),
});

export type DeliveryMethodFormValues = z.infer<typeof deliveryMethodSchema>;

// Payment options are simulated demo selections only.
// As per payment safety requirements, no actual card numbers, CVVs, expiry dates, or UPI PINs are collected.
export const paymentSelectionSchema = z.object({
  paymentMethod: z.enum(["cod", "upi", "card"]),
  upiId: z.string().optional(),
  cardholderName: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
});

export type PaymentSelectionFormValues = z.infer<typeof paymentSelectionSchema>;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
] as const;
