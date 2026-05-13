// Core type definitions for Alma Lifestyle Ecommerce
// This file serves as the single source of truth for all TypeScript types

// Branded types for type safety
export type UUID = string & { readonly __brand: "UUID" };
export type Money = number & { readonly __brand: "Money" };
export type ISODate = string & { readonly __brand: "ISODate" };
export type Email = string & { readonly __brand: "Email" };

// API Response types
export interface APISuccess<T> {
  status: 'success';
  data: T;
}

export interface APIError {
  status: 'error';
  code: string;
  message: string;
  details?: Record<string, string>;
}

export type APIResponse<T> = APISuccess<T> | APIError;

// Common enums
export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
}

export enum Currency {
  USD = 'USD',
  AED = 'AED',
  BDT = 'BDT',
}

// Placeholder interfaces - to be expanded during development
export interface Product {
  id: UUID;
  title: string;
  price: Money;
  currency: Currency;
  published: boolean;
}

export interface Order {
  id: UUID;
  status: OrderStatus;
  total: Money;
  createdAt: ISODate;
}

export interface Customer {
  id: UUID;
  email: Email;
  firstName?: string;
  lastName?: string;
}

// Re-export for convenience
export type { UUID as default };