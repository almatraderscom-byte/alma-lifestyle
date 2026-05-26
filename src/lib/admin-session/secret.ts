let secretValidated = false;

export function assertAdminSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const isProduction = process.env.VERCEL_ENV === 'production';

  if (!secretValidated) {
    secretValidated = true;
    if (isProduction && (!secret || secret.length < 32)) {
      throw new Error(
        'ADMIN_SESSION_SECRET must be set with at least 32 characters in production'
      );
    }
  }

  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET is missing or too short (minimum 32 characters)'
    );
  }

  return secret;
}
