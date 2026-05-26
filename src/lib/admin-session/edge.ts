import type { VerifySessionResult } from './constants';
import {
  base64UrlDecodeToBytes,
  isLegacySessionToken,
  parsePayload,
  splitSessionToken,
  timingSafeEqualBytes,
} from './codec';
import { assertAdminSessionSecret } from './secret';

async function hmacWeb(payloadPart: string): Promise<Uint8Array> {
  const secret = assertAdminSessionSecret();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadPart)
  );
  return new Uint8Array(sig);
}

/** Verify session token (Edge middleware — Web Crypto). */
export async function verifySessionEdge(token: string): Promise<VerifySessionResult> {
  if (isLegacySessionToken(token)) {
    return { ok: false, reason: 'invalid_format' };
  }

  const parts = splitSessionToken(token);
  if (!parts) {
    return { ok: false, reason: 'invalid_format' };
  }

  const expected = await hmacWeb(parts.payloadPart);
  const actual = base64UrlDecodeToBytes(parts.sigPart);
  if (!actual) {
    return { ok: false, reason: 'bad_signature' };
  }

  if (!timingSafeEqualBytes(expected, actual)) {
    return { ok: false, reason: 'bad_signature' };
  }

  const payload = parsePayload(parts.payloadPart);
  if (!payload) {
    return { ok: false, reason: 'invalid_payload' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, payload };
}
