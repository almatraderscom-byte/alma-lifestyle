import { z } from 'zod';

// Environment variable schema validation
export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),

  // External APIs (future)
  STRIPE_SECRET_KEY: z.string().optional(),
  WHATSAPP_API_KEY: z.string().optional(),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// Type inference
export type Env = z.infer<typeof envSchema>;

// Validate environment variables
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
}