import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createAdminSessionPayload,
  signSession,
  verifySession,
} from '@/lib/admin-session/node';
import { verifySessionEdge } from '@/lib/admin-session/edge';

const TEST_SECRET = 'test-admin-session-secret-32chars!!';

describe('admin-session', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ADMIN_SESSION_SECRET = TEST_SECRET;
  });

  it('signSession + verifySession round-trip succeeds', () => {
    const payload = createAdminSessionPayload('uid-1', 'admin@test.com', 'admin');
    const token = signSession(payload);
    const result = verifySession(token);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.uid).toBe('uid-1');
      expect(result.payload.email).toBe('admin@test.com');
    }
  });

  it('verifySessionEdge accepts token from signSession (Node)', async () => {
    const payload = createAdminSessionPayload('uid-edge', 'edge@test.com', 'editor');
    const token = signSession(payload);
    const result = await verifySessionEdge(token);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.uid).toBe('uid-edge');
    }
  });

  it('rejects legacy literal authenticated', () => {
    expect(verifySession('authenticated')).toEqual({
      ok: false,
      reason: 'invalid_format',
    });
  });

  it('rejects tampered payload', () => {
    const token = signSession(
      createAdminSessionPayload('u1', 'a@test.com', 'admin')
    );
    const dot = token.indexOf('.');
    const tampered =
      token.slice(0, dot - 1) + (token[dot - 1] === 'a' ? 'b' : 'a') + token.slice(dot);
    expect(verifySession(tampered).ok).toBe(false);
  });

  it('rejects tampered signature', () => {
    const token = signSession(
      createAdminSessionPayload('u1', 'a@test.com', 'admin')
    );
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
    const result = verifySession(tampered);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('bad_signature');
    }
  });

  it('rejects expired token', () => {
    const payload = createAdminSessionPayload('u1', 'a@test.com', 'admin');
    const expired = { ...payload, exp: Math.floor(Date.now() / 1000) - 10 };
    const token = signSession(expired);
    const result = verifySession(token);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('expired');
    }
  });

  it('rejects wrong-length ADMIN_SESSION_SECRET', async () => {
    vi.resetModules();
    process.env.ADMIN_SESSION_SECRET = 'too-short';
    const { signSession: signWithBadSecret } = await import('@/lib/admin-session/node');
    expect(() =>
      signWithBadSecret(createAdminSessionPayload('u1', 'a@test.com', 'admin'))
    ).toThrow(/ADMIN_SESSION_SECRET/);
  });
});
