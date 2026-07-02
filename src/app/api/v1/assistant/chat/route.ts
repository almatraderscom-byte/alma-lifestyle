import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAssistantKnowledge } from '@/server/assistant/context';
import { isHighlightKey } from '@/lib/highlight-targets';
import { apiError } from '@/server/api/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * ALMA AI assistant — public chat endpoint backed by Google Gemini 2.5.
 *
 * Streams the reply as SSE events the widget consumes:
 *   data: {"t":"<text chunk>"}          — incremental reply text
 *   data: {"done":true,"nav":"/path","products":[...]} — final metadata
 *   data: {"error":"<code>"}            — terminal failure
 *
 * The model embeds [[NAV:/path]] / [[PRODUCT:slug]] action tags in its text;
 * they are stripped from the streamed text server-side and resolved into the
 * final metadata event (products resolved against the live catalog).
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(24),
  /** Optional page/product context, e.g. "Customer is viewing: <title>". */
  context: z.string().max(600).optional(),
});

/* Small in-memory rate limit (per serverless instance) — enough to stop
 * accidental loops and casual abuse without external infra. */
const hits = new Map<string, { n: number; at: number }>();
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 30;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.at > RATE_WINDOW_MS) {
    hits.set(ip, { n: 1, at: now });
    return false;
  }
  h.n += 1;
  return h.n > RATE_MAX;
}

const NAV_RE = /\[\[NAV:([^\]]+)\]\]/g;
const PRODUCT_RE = /\[\[PRODUCT:([^\]]+)\]\]/g;
const HIGHLIGHT_RE = /\[\[HIGHLIGHT:([^\]]+)\]\]/g;
const TAG_RE = /\[\[(?:NAV|PRODUCT|HIGHLIGHT):[^\]]*\]\]/g;
/** A possibly-incomplete action tag at the chunk tail ("[", "[[NAV:/pro" …).
 *  Held back until it completes or the stream ends — worst case a literal
 *  "[" is briefly delayed, never lost. */
const PARTIAL_TAG_TAIL = /\[\[?[A-Z]*(?::[^\]]*)?$/;

function sseEvent(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return apiError('Assistant is not configured', 503, 'ASSISTANT_NOT_CONFIGURED');
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  if (rateLimited(ip)) {
    return apiError('Too many requests', 429, 'RATE_LIMITED');
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return apiError('Invalid chat payload', 400, 'VALIDATION_ERROR');
  }

  const knowledge = await getAssistantKnowledge();
  const systemPrompt = parsed.context
    ? `${knowledge.prompt}\n\n## বর্তমান প্রেক্ষাপট\n${parsed.context}`
    : knowledge.prompt;

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: parsed.messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
          // Gemini 2.5 is a thinking model; keep latency low for chat UX.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    console.error('[assistant] Gemini error', upstream.status, detail.slice(0, 300));
    return apiError('Assistant is temporarily unavailable', 502, 'GEMINI_ERROR');
  }

  const products = knowledge.products;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let sseBuf = '';
      let fullText = '';
      /** Text already emitted to the client (tags stripped). */
      let emitted = 0;

      const emitSafe = () => {
        // Strip complete tags, then hold back any partial tag at the tail so
        // a tag split across chunks never leaks to the display text.
        const clean = fullText.replace(TAG_RE, '');
        const tail = clean.slice(emitted);
        const partial = tail.match(PARTIAL_TAG_TAIL);
        const safeEnd = clean.length - (partial ? partial[0].length : 0);
        if (safeEnd > emitted) {
          controller.enqueue(encoder.encode(sseEvent({ t: clean.slice(emitted, safeEnd) })));
          emitted = safeEnd;
        }
      };

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuf += decoder.decode(value, { stream: true });
          const lines = sseBuf.split('\n');
          sseBuf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const raw = line.slice(5).trim();
            if (!raw || raw === '[DONE]') continue;
            try {
              const json = JSON.parse(raw);
              const chunk: string =
                json?.candidates?.[0]?.content?.parts
                  ?.map((p: { text?: string }) => p.text ?? '')
                  .join('') ?? '';
              if (chunk) {
                fullText += chunk;
                emitSafe();
              }
            } catch {
              /* ignore malformed upstream lines */
            }
          }
        }

        // Flush any held-back text (a trailing "[[" that never became a tag).
        const clean = fullText.replace(TAG_RE, '');
        if (clean.length > emitted) {
          controller.enqueue(encoder.encode(sseEvent({ t: clean.slice(emitted) })));
        }

        const nav = [...fullText.matchAll(NAV_RE)]
          .map((m) => m[1].trim())
          .find((p) => p.startsWith('/'));
        const highlight =
          [...fullText.matchAll(HIGHLIGHT_RE)]
            .map((m) => m[1].trim())
            .find((k) => isHighlightKey(k)) ?? null;
        const cards = [...fullText.matchAll(PRODUCT_RE)]
          .map((m) => m[1].trim())
          .slice(0, 3)
          .map((slug) => products.find((p) => p.slug === slug))
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
          .map((p) => ({
            slug: p.slug,
            title: p.title,
            price: p.price,
            compareAtPrice: p.compareAtPrice ?? null,
            image: p.images?.[0]?.url ?? '',
            href: `/products/${p.slug}`,
          }));

        controller.enqueue(
          encoder.encode(sseEvent({ done: true, nav: nav ?? null, highlight, products: cards }))
        );
      } catch (err) {
        console.error('[assistant] stream error', err);
        controller.enqueue(encoder.encode(sseEvent({ error: 'STREAM_ERROR' })));
      } finally {
        controller.close();
      }
    },
    cancel() {
      /* client disconnected — upstream reader is GC'd with the fetch */
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
