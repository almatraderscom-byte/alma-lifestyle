'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssistant } from '@/context/AssistantContext';
import { useVoice } from '@/context/VoiceContext';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { formatBdtPrice } from '@/lib/format-bn';

/**
 * ALMA AI assistant — floating concierge widget (ElevenLabs/Hostinger-style).
 *
 * Streams replies from /api/v1/assistant/chat (Gemini 2.5) as SSE. The final
 * SSE event may carry `nav` (a storefront path the assistant wants to take
 * the customer to — executed with a short heads-up bubble) and `products`
 * (tappable product cards rendered under the reply).
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
  role: 'user' | 'assistant';
  text: string;
  products?: ProductCard[];
}

const NAV_DELAY_MS = 1400;

export function AssistantWidget() {
  const { open, pageContext, openAssistant, closeAssistant } = useAssistant();
  const settings = useStoreSettings();
  const assistant = settings.assistant;
  const { play } = useVoice();
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [navNotice, setNavNotice] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

      const history: ChatMessage[] = [...messages, { role: 'user', text }];
      setMessages([...history, { role: 'assistant', text: '' }]);

      const patchLast = (patch: Partial<ChatMessage>) =>
        setMessages((cur) => {
          const next = [...cur];
          const last = next[next.length - 1];
          if (last?.role === 'assistant') next[next.length - 1] = { ...last, ...patch };
          return next;
        });

      const fail = () =>
        patchLast({
          text: `দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। 🙏 WhatsApp-এ আমাদের টিমের সাথে কথা বলতে পারেন: wa.me/${`${settings.whatsappCountryCode}${settings.whatsappNumber}`.replace(/[^\d]/g, '')}`,
        });

      try {
        const controller = new AbortController();
        abortRef.current = controller;
        const res = await fetch('/api/v1/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history.slice(-16).map((m) => ({ role: m.role, text: m.text })),
            context: pageContext ?? undefined,
          }),
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
              if (evt.nav) {
                setNavNotice(true);
                const target = evt.nav;
                setTimeout(() => {
                  setNavNotice(false);
                  router.push(target);
                }, NAV_DELAY_MS);
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
    [busy, messages, pageContext, router, settings.whatsappCountryCode, settings.whatsappNumber]
  );

  if (!assistant?.enabled) return null;

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

      {/* Chat panel */}
      {open && (
        <div className="alma-ai-panel" role="dialog" aria-label={`${assistant.name} AI সহকারী`}>
          <div className="alma-ai-head">
            <span className="alma-ai-head-orb" aria-hidden>
              ✦
            </span>
            <div className="alma-ai-head-txt">
              <strong className="bn">{assistant.name}</strong>
              <span className="bn">ALMA AI সহকারী</span>
            </div>
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
            <div className="alma-ai-msg is-bot">{assistant.greeting}</div>

            {messages.length === 0 && assistant.suggestions.length > 0 && (
              <div className="alma-ai-chips">
                {assistant.suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="bn">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
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
                        onClick={() => {
                          closeAssistant();
                          router.push(p.href);
                        }}
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
            ))}

            {navNotice && <div className="alma-ai-nav-notice">পেজে নিয়ে যাচ্ছি… ✨</div>}
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
