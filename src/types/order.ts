import type { Currency } from "./product";

export type OrderStatus =
  | "new"
  | "to_confirm"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refused"
  | "returned"
  | "exchange_requested";

export type OrderTrackingRequest = {
  orderReference: string;
  phone: string;
};

export type CreateOrderLineRequest = {
  productId: string;
  quantity: number;
};

export type CreateOrderRequest = {
  customer: {
    fullName: string;
    phone: string;
    email?: string;
  };
  deliveryAddress: {
    governorate: string;
    city: string;
    addressLine: string;
  };
  items: CreateOrderLineRequest[];
  note?: string;
  acceptedTerms: true;
};

/** All monetary values are authoritative server results in integer millimes. */
export type OrderPricing = {
  currency: Currency;
  subtotalMillimes: number;
  deliveryFeeMillimes: number;
  totalMillimes: number;
};

export type CreateOrderResponse = {
  reference: string;
  status: OrderStatus;
  pricing: OrderPricing;
};

export type TrackedOrderResponse = {
  reference: string;
  status: OrderStatus;
  pricing: OrderPricing;
  createdAt: string;
  updatedAt: string;
};
