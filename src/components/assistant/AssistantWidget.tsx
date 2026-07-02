'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAssistant } from '@/context/AssistantContext';
import {
  queueSpotlight,
  runSpotlight,
  runSpotlightTour,
  takePendingSpotlight,
} from '@/components/assistant/spotlight';
import { useVoice } from '@/context/VoiceContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { formatBdtPrice } from '@/lib/format-bn';

/**
 * ALMA AI assistant — floating concierge widget (ElevenLabs/Hostinger-style).
 *
 * Streams replies from /api/v1/assistant/chat (Gemini 2.5) as SSE. The final
 * SSE event may carry actions the widget executes while narrating them with
 * inline status chips ("নেভিগেট করছি ✓", "হাইলাইট করছি ✓" — the ElevenLabs
 * pattern): `nav` (route change), `highlight` (guided spotlight), `tour`
 * (sequential product spotlights) and `products` (tappable cards).
 *
 * The conversation persists in localStorage so a customer who leaves and
 * comes back continues where they left off.
 */

interface ProductCard {
  slug: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  href: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'status';
  text: string;
  products?: ProductCard[];
  /** status entries only: unique id + completion flag for the ✓ */
  sid?: string;
  done?: boolean;
}

const NAV_DELAY_MS = 1200;
const HISTORY_KEY = 'alma-ai-history-v1';
const HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const HISTORY_MAX = 40;

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { at: number; messages: ChatMessage[] };
    if (!Array.isArray(parsed.messages) || Date.now() - parsed.at > HISTORY_TTL_MS) return [];
    // Anything that was mid-flight when the page closed is finished now.
    return parsed.messages.map((m) => (m.role === 'status' ? { ...m, done: true } : m));
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({ at: Date.now(), messages: messages.slice(-HISTORY_MAX) })
    );
  } catch {
    /* storage unavailable/full — history is best-effort */
  }
}

export function AssistantWidget() {
  const { open, pageContext, openAssistant, closeAssistant } = useAssistant();
  const settings = useStoreSettings();
  const assistant = settings.assistant;
  const { play } = useVoice();
  const router = useRouter();
  const pathname = usePathname();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hydrated = useRef(false);

  // Wheel over the panel scrolls the CHAT, never the page. Must be a native
  // non-passive listener: the compositor scrolls the page directly (scroll
  // chaining past the too-short list) before React's delegated handler runs,
  // so stopPropagation alone can't contain it.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const onWheel = (e: WheelEvent) => {
      const list = listRef.current;
      if (list) list.scrollTop += e.deltaY;
      e.preventDefault();
      e.stopPropagation();
    };
    panel.addEventListener('wheel', onWheel, { passive: false });
    return () => panel.removeEventListener('wheel', onWheel);
  }, [open]);

  // Restore the conversation once on mount, then persist every change.
  useEffect(() => {
    setMessages(loadHistory());
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (hydrated.current) saveHistory(messages);
  }, [messages]);

  const pushStatus = useCallback((text: string): string => {
    const sid = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setMessages((cur) => [...cur, { role: 'status', text, sid, done: false }]);
    return sid;
  }, []);
  const finishStatus = useCallback((sid: string) => {
    setMessages((cur) => cur.map((m) => (m.sid === sid ? { ...m, done: true } : m)));
  }, []);

  // After an assistant-triggered navigation lands, run the spotlight/tour it
  // queued for the destination page — with a visible status chip.
  useEffect(() => {
    const pending = takePendingSpotlight();
    if (!pending) return;
    const sid = pushStatus('হাইলাইট করছি — Highlighting');
    const run = pending.tour?.length
      ? runSpotlightTour(pending.tour)
      : runSpotlight(pending.key!);
    void run.then(() => finishStatus(sid));
  }, [pathname, pushStatus, finishStatus]);

  // Voice cue when the panel opens.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) play('assistantOpen', { oncePerSession: true });
    wasOpen.current = open;
  }, [open, play]);

  // Keep the message list pinned to the bottom while streaming.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      setInput('');
      setBusy(true);

      let history: ChatMessage[] = [];
      setMessages((cur) => {
        history = cur;
        return [...cur, { role: 'user', text }, { role: 'assistant', text: '' }];
      });

      const patchLast = (patch: Partial<ChatMessage>) =>
        setMessages((cur) => {
          const next = [...cur];
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === 'assistant') {
              next[i] = { ...next[i], ...patch };
              break;
            }
          }
          return next;
        });

      const fail = () =>
        patchLast({
          text: `দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। 🙏 WhatsApp-এ আমাদের টিমের সাথে কথা বলতে পারেন: wa.me/${`${settings.whatsappCountryCode}${settings.whatsappNumber}`.replace(/[^\d]/g, '')}`,
        });

      try {
        const controller = new AbortController();
        abortRef.current = controller;
        const chatTurns = [...history, { role: 'user' as const, text }]
          .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.text))
          .slice(-16)
          .map((m) => ({ role: m.role as 'user' | 'assistant', text: m.text }));
        const res = await fetch('/api/v1/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ messages: chatTurns, context: pageContext ?? undefined }),
        });
        if (!res.ok || !res.body) {
          fail();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        let streamed = '';
        let gotDone = false;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            let evt: {
              t?: string;
              done?: boolean;
              nav?: string | null;
              highlight?: string | null;
              tour?: string[] | null;
              products?: ProductCard[];
              error?: string;
            };
            try {
              evt = JSON.parse(line.slice(5).trim());
            } catch {
              continue;
            }
            if (evt.t) {
              streamed += evt.t;
              patchLast({ text: streamed });
            }
            if (evt.error) {
              if (!streamed) fail();
              return;
            }
            if (evt.done) {
              gotDone = true;
              if (evt.products?.length) patchLast({ products: evt.products });
              if (!streamed && !evt.products?.length) fail();

              const samePage = evt.nav && evt.nav.split('?')[0] === pathname;
              if (evt.nav && !samePage) {
                // Queue on-arrival effects, then navigate — each step gets
                // its own status chip, ElevenLabs-style.
                if (evt.tour?.length) queueSpotlight({ tour: evt.tour });
                else if (evt.highlight) queueSpotlight({ key: evt.highlight });
                const sid = pushStatus('পেজে নিয়ে যাচ্ছি — Navigating');
                const target = evt.nav;
                setTimeout(() => {
                  finishStatus(sid);
                  router.push(target);
                }, NAV_DELAY_MS);
              } else if (evt.tour?.length) {
                const sid = pushStatus('প্রোডাক্টগুলো ঘুরিয়ে দেখাচ্ছি — Highlighting');
                void runSpotlightTour(evt.tour).then(() => finishStatus(sid));
              } else if (evt.highlight) {
                const sid = pushStatus('হাইলাইট করছি — Highlighting');
                void runSpotlight(evt.highlight).then(() => finishStatus(sid));
              }
            }
          }
        }
        // Stream cut early with nothing shown (no done event, no text).
        if (!gotDone && !streamed) fail();
      } catch {
        fail();
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [
      busy,
      pageContext,
      pathname,
      router,
      pushStatus,
      finishStatus,
      settings.whatsappCountryCode,
      settings.whatsappNumber,
    ]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  if (!assistant?.enabled) return null;

  const hasChat = messages.some((m) => m.role !== 'status');

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          className="alma-ai-fab bn"
          onClick={() => openAssistant()}
          aria-label={`${assistant.name} — AI সহকারী`}
        >
          <span className="alma-ai-fab-orb" aria-hidden>
            ✦
          </span>
          <span className="alma-ai-fab-label">{assistant.name}</span>
        </button>
      )}

      {/* Chat panel. Wheel/touch events must never leak to the page: Lenis
          (the storefront's scroll engine) listens on window and would scroll
          the PAGE while the customer tries to scroll the CHAT. */}
      {open && (
        <div
          ref={panelRef}
          className="alma-ai-panel"
          role="dialog"
          aria-label={`${assistant.name} AI সহকারী`}
          data-lenis-prevent
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="alma-ai-head">
            <span className="alma-ai-head-orb" aria-hidden>
              ✦
            </span>
            <div className="alma-ai-head-txt">
              <strong className="bn">{assistant.name}</strong>
              <span className="bn">ALMA AI সহকারী</span>
            </div>
            {hasChat && (
              <button
                type="button"
                className="alma-ai-clear bn"
                onClick={clearHistory}
                aria-label="চ্যাট মুছুন"
                title="চ্যাট মুছুন"
              >
                🗑
              </button>
            )}
            <button
              type="button"
              className="alma-ai-close"
              onClick={closeAssistant}
              aria-label="বন্ধ করুন"
            >
              ✕
            </button>
          </div>

          <div className="alma-ai-list bn" ref={listRef}>
            <div className="alma-ai-list-inner">
            <div className="alma-ai-msg is-bot">{assistant.greeting}</div>

            {!hasChat && assistant.suggestions.length > 0 && (
              <div className="alma-ai-chips">
                {assistant.suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="bn">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) =>
              m.role === 'status' ? (
                <div key={m.sid ?? i} className={`alma-ai-status${m.done ? ' done' : ''}`}>
                  <span className="alma-ai-status-ic" aria-hidden>
                    {m.done ? '✓' : ''}
                  </span>
                  {m.text}
                </div>
              ) : (
                <div key={i} className={`alma-ai-msg ${m.role === 'user' ? 'is-user' : 'is-bot'}`}>
                  {m.text ||
                    (m.role === 'assistant' && busy && i === messages.length - 1 ? (
                      <span className="alma-ai-typing" aria-label="লিখছে…">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      m.text
                    ))}
                  {m.products && m.products.length > 0 && (
                    <div className="alma-ai-cards">
                      {m.products.map((p) => (
                        <button
                          key={p.slug}
                          type="button"
                          className="alma-ai-card"
                          onClick={() => router.push(p.href)}
                        >
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt={p.title} loading="lazy" />
                          ) : (
                            <span className="alma-ai-card-ph" aria-hidden>
                              ✦
                            </span>
                          )}
                          <span className="alma-ai-card-txt">
                            <strong>{p.title}</strong>
                            <em>
                              {formatBdtPrice(p.price)}
                              {p.compareAtPrice && p.compareAtPrice > p.price ? (
                                <s>{formatBdtPrice(p.compareAtPrice)}</s>
                              ) : null}
                            </em>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
            </div>
          </div>

          <form
            className="alma-ai-input"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="আপনার প্রশ্ন লিখুন…"
              className="bn"
              maxLength={2000}
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="পাঠান">
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
