export type AddressLabel = "Home" | "Work" | "Other";

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  apartment?: string | undefined;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  label: AddressLabel;
  isDefault: boolean;
}

export interface CustomerUser {
  id: string; // e.g. "cust_aarav_sharma_001"
  name: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  salt: string;
  createdAt: string; // ISO string
  addresses: CustomerAddress[];
}

export interface CustomerSession {
  customerId: string;
  customerEmail: string;
  createdAt: string;
  user?: {
    id: string;
    name?: string;
    fullName: string;
    email: string;
    phone: string;
    createdAt: string;
    addresses: CustomerAddress[];
  };
  token?: string;
  loginAt?: string;
}

export interface CustomerSignUpData {
  name?: string;
  fullName?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

export interface CustomerSignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CustomerProfileUpdate {
  name?: string;
  fullName?: string;
  phone: string;
}
