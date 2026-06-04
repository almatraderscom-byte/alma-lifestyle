type EnvSpec = {
  name: string;
  required: 'always' | 'production-only';
  minLength?: number;
  validate?: (v: string) => true | string;
};

const SPECS: EnvSpec[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: 'production-only',
    validate: (v) => v.startsWith('https://') || 'must start with https://',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: 'production-only',
    minLength: 20,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: 'production-only',
    minLength: 20,
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: 'production-only',
    validate: (v) => v.startsWith('https://') || 'must be https in production',
  },
  {
    name: 'ADMIN_SESSION_SECRET',
    required: 'production-only',
    minLength: 32,
  },
];

export function validateEnvOrThrow(): void {
  const isProd = process.env.VERCEL_ENV === 'production';
  const errors: string[] = [];

  for (const spec of SPECS) {
    const value = process.env[spec.name];
    const needed =
      spec.required === 'always' ||
      (spec.required === 'production-only' && isProd);

    if (!value || value.trim() === '') {
      if (needed) {
        errors.push(`${spec.name} is required${isProd ? ' in production' : ''}`);
      }
      continue;
    }

    if (!needed) {
      continue;
    }

    if (spec.minLength && value.length < spec.minLength) {
      errors.push(`${spec.name} must be at least ${spec.minLength} characters`);
    }

    if (spec.validate) {
      const result = spec.validate(value);
      if (result !== true) {
        errors.push(`${spec.name}: ${result}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `[env] Invalid configuration:\n  - ${errors.join('\n  - ')}\n` +
        'Refer to vercel.env.production.example for the full list.'
    );
  }
}
