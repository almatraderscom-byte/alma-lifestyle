// Application-wide constants

export const APP_CONFIG = {
  name: 'Alma Lifestyle',
  version: '0.1.0',
  description: 'Luxury Punjabi/Panjabi fashion ecommerce',
} as const;

export const CURRENCY = {
  USD: 'USD',
  AED: 'AED',
  BDT: 'BDT',
} as const;

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
} as const;

export const IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 200 },
  PRODUCT_LIST: { width: 300, height: 400 },
  PRODUCT_PAGE: { width: 600, height: 800 },
  HERO: { width: 1920, height: 1080 },
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const CACHE_TTL = {
  PRODUCTS: 300, // 5 minutes
  COLLECTIONS: 60, // 1 minute
  CART: 3600, // 1 hour
} as const;

export const API_RATE_LIMITS = {
  CUSTOMER: 1000, // requests per minute
  ADMIN: 10000,
} as const;