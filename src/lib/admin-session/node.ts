import { createHmac, timingSafeEqual } from 'crypto';
import {
  ADMIN_SESSION_MAX_AGE_SEC,
  type AdminSessionPayload,
  type AdminSessionRole,
  type VerifySessionResult,
} from './constants';
import {
  base64UrlDecodeToBytes,
  base64UrlEncodeBuffer,
  isLegacySessionToken,
  parsePayload,
  signPayloadPart,
  splitSessionToken,
} from './codec';
import { assertAdminSessionSecret } from './secret';

function hmacNode(payloadPart: string): Buffer {
  return createHmac('sha256', assertAdminSessionSecret())
    .update(payloadPart)
    .digest();
}

/** Issue a signed session token (Node.js). */
export function signSession(payload: AdminSessionPayload): string {
  const payloadPart = signPayloadPart(payload);
  const sig = base64UrlEncodeBuffer(hmacNode(payloadPart));
  return `${payloadPart}.${sig}`;
}

function verifySignatureNode(payloadPart: string, sigPart: string): boolean {
  const expected = hmacNode(payloadPart);
  const actual = base64UrlDecodeToBytes(sigPart);
  if (!actual || actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(expected, Buffer.from(actual));
}

/** Verify session token (Node.js — API routes). */
export function verifySession(token: string): VerifySessionResult {
  if (isLegacySessionToken(token)) {
    return { ok: false, reason: 'invalid_format' };
  }

  const parts = splitSessionToken(token);
  if (!parts) {
    return { ok: false, reason: 'invalid_format' };
  }

  if (!verifySignatureNode(parts.payloadPart, parts.sigPart)) {
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

export function createAdminSessionPayload(
  uid: string,
  email: string,
  role: AdminSessionRole
): AdminSessionPayload {
  const iat = Math.floor(Date.now() / 1000);
  return {
    uid,
    email,
    role,
    iat,
    exp: iat + ADMIN_SESSION_MAX_AGE_SEC,
  };
}
