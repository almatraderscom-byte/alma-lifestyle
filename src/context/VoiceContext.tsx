'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import type { VoiceClipKey } from '@/lib/admin-settings-types';

/**
 * ALMA voice system — plays short pre-recorded Bengali clips (ElevenLabs-
 * generated, shipped under /public/voice/<key>.mp3 or CMS URL overrides) at
 * key storefront moments: homepage greeting, price reveal, family-set hook,
 * add-to-cart, assistant open.
 *
 * Browser autoplay policy: audio with sound may only start after a user
 * gesture. The provider listens for the FIRST pointerdown/keydown, marks the
 * session "unlocked", and flushes at most one queued clip (e.g. the homepage
 * greeting queued on mount). Missing clip files fail silently and are
 * remembered so we never re-request a 404.
 */

interface VoiceApi {
  /** True when voice is globally enabled (admin) and not user-muted. */
  active: boolean;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  /** Play a clip now (or queue it if the session isn't unlocked yet). */
  play: (key: VoiceClipKey, opts?: { oncePerSession?: boolean }) => void;
  /** True when the admin enabled the voice feature at all (drives the dock). */
  featureEnabled: boolean;
}

const VoiceContext = createContext<VoiceApi>({
  active: false,
  muted: false,
  setMuted: () => {},
  play: () => {},
  featureEnabled: false,
});

const MUTE_KEY = 'alma-voice-muted';
const SESSION_PREFIX = 'alma-voice-played-';

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const settings = useStoreSettings();
  const voice = settings.voice;
  const pathname = usePathname();

  const [muted, setMutedState] = useState(false);
  const unlockedRef = useRef(false);
  const pendingRef = useRef<VoiceClipKey | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const missingRef = useRef<Set<string>>(new Set());
  const mutedRef = useRef(false);

  useEffect(() => {
    try {
      setMutedState(localStorage.getItem(MUTE_KEY) === '1');
    } catch {
      /* storage unavailable */
    }
  }, []);
  mutedRef.current = muted;

  const featureEnabled = Boolean(voice?.enabled);
  const active = featureEnabled && !muted;

  const clipUrl = useCallback(
    (key: VoiceClipKey): string | null => {
      const clip = voice?.clips?.[key];
      if (!voice?.enabled || !clip?.enabled) return null;
      return clip.url?.trim() || `/voice/${key}.mp3`;
    },
    [voice]
  );

  const playNow = useCallback(
    (key: VoiceClipKey) => {
      const url = clipUrl(key);
      if (!url || mutedRef.current || missingRef.current.has(url)) return;
      try {
        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        audio.pause();
        audio.src = url;
        audio.currentTime = 0;
        audio.onerror = () => missingRef.current.add(url);
        void audio.play().catch(() => {
          /* autoplay blocked or missing file — stay silent */
        });
      } catch {
        /* Audio unsupported — stay silent */
      }
    },
    [clipUrl]
  );

  const play = useCallback(
    (key: VoiceClipKey, opts?: { oncePerSession?: boolean }) => {
      if (opts?.oncePerSession) {
        try {
          const k = SESSION_PREFIX + key;
          if (sessionStorage.getItem(k)) return;
          sessionStorage.setItem(k, '1');
        } catch {
          /* storage unavailable — play anyway */
        }
      }
      if (unlockedRef.current) playNow(key);
      else pendingRef.current = key;
    },
    [playNow]
  );

  // Unlock on the first user gesture and flush the queued clip (if any).
  useEffect(() => {
    const unlock = () => {
      unlockedRef.current = true;
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) playNow(pending);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [playNow]);

  // Homepage salam/greeting — once per browser session, on the first gesture.
  useEffect(() => {
    if (pathname === '/' && featureEnabled) {
      play('greeting', { oncePerSession: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, featureEnabled]);

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
    if (next && audioRef.current) audioRef.current.pause();
  }, []);

  const value = useMemo<VoiceApi>(
    () => ({ active, muted, setMuted, play, featureEnabled }),
    [active, muted, setMuted, play, featureEnabled]
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice(): VoiceApi {
  return useContext(VoiceContext);
}
