import { z } from 'zod';

// Branded types for Zod
const uuidSchema = z.string().uuid();
const moneySchema = z.number().positive();
const emailSchema = z.string().email();

// Common validation schemas
export const UUIDSchema = uuidSchema;
export const MoneySchema = moneySchema;
export const EmailSchema = emailSchema;
export const CurrencySchema = z.enum(['USD', 'AED', 'BDT']);

// API Response schemas
export const APISuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    status: z.literal('success'),
    data: dataSchema,
  });

export const APIErrorSchema = z.object({
  status: z.literal('error'),
  code: z.string(),
  message: z.string(),
  details: z.record(z.string()).optional(),
});

export const APIResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.union([
    APISuccessSchema(dataSchema),
    APIErrorSchema,
  ]);

// Placeholder schemas - to be expanded during development
export const ProductSchema = z.object({
  id: UUIDSchema,
  title: z.string().min(5).max(255),
  price: MoneySchema,
  currency: CurrencySchema,
  published: z.boolean(),
});

export const OrderSchema = z.object({
  id: UUIDSchema,
  status: z.enum(['pending_payment', 'confirmed', 'shipped', 'delivered']),
  total: MoneySchema,
  createdAt: z.string().datetime(),
});

export const CustomerSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});