/**
 * Blog posts and pages written by the CDIT desk and approved by the owner in the ALMA app. They live in the
 * ERP (one row per post); this site reads the published ones from the ERP's public route on every
 * request (the ERP route itself is CDN-cached ~30 s), so an approved post shows here without a new deploy and a
 * taken-back post disappears just as fast. This site's own data cache is NOT used: it kept a taken-back post
 * for 10+ minutes. An unreachable ERP means "no posts" on the list and an error page for one post.
 */
import { getSiteUrl } from '@/lib/seo/site-url';

const ERP = (process.env.CDIT_SITE_API || 'https://alma-erp-six.vercel.app').replace(/\/$/, '');
const SITE = 'almatraders.com';

export type CditPostSummary = {
  kind: 'post' | 'page';
  slug: string;
  title: string;
  h1: string;
  description: string;
  keyword: string;
  cover_url: string;
  published_at: string;
  updated_at: string;
  words: number;
};
export type CditPost = Omit<CditPostSummary, 'words'> & { body_md: string };

export async function listCditPosts(kind?: 'post' | 'page'): Promise<CditPostSummary[]> {
  try {
    const r = await fetch(`${ERP}/api/assistant/public/cdit-site?site=${SITE}${kind ? `&kind=${kind}` : ''}`, { cache: 'no-store' });
    if (!r.ok) return [];
    const d = (await r.json()) as { posts?: CditPostSummary[] };
    return Array.isArray(d.posts) ? d.posts : [];
  } catch {
    return [];
  }
}

/** One post / page, or null when it does not exist (404). Throws when the ERP could not be reached. */
export async function getCditPost(kind: 'post' | 'page', slug: string): Promise<CditPost | null> {
  if (!/^[a-z0-9-]{1,90}$/.test(slug)) return null;
  const r = await fetch(`${ERP}/api/assistant/public/cdit-site?site=${SITE}&kind=${kind}&slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`cdit-site ${r.status}`);
  const d = (await r.json()) as { post?: CditPost };
  return d.post ?? null;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(text: string): string {
  return esc(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, (_m, t: string, u: string) => {
      const href = u.replace(/^https?:\/\/(www\.)?almatraders\.com/, '') || '/';
      const ext = /^(https?:)?\/\//.test(href);
      return `<a href="${href}"${ext ? ' rel="noopener" target="_blank"' : ''}>${t}</a>`;
    });
}

/**
 * The small markdown subset the desk writes → HTML: ## / ### headings (the page owns the h1), paragraphs, bullet and
 * numbered lists, tables, rules, bold, code, links and a picture on its own line (https only). Everything is
 * HTML-escaped first, so a post can never inject markup.
 */
export function renderPostMarkdown(md: string): string {
  const lines = md.replace(/\r/g, '').split('\n');
  const out: string[] = [];
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null;
  let table: string[][] | null = null;
  let para: string[] = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${para.map(inline).join(' ')}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; } };
  const flushTable = () => {
    if (!table) return;
    const [head, ...rows] = table;
    out.push(`<div class="blog-tbl"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    table = null;
  };
  const flushAll = () => { flushPara(); flushList(); flushTable(); };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushAll(); continue; }
    const img = line.match(/^\s*!\[([^\]]*)\]\((https:\/\/[^\s)"'<>]+)\)\s*$/);
    if (img) { flushAll(); out.push(`<figure class="blog-fig"><img src="${esc(img[2])}" alt="${esc(img[1])}" loading="lazy"><figcaption>${inline(img[1])}</figcaption></figure>`); continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flushAll(); const lvl = h[1].length <= 2 ? 2 : 3; out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`); continue; }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushPara(); flushList();
      if (/^\s*\|\s*:?-{2,}/.test(line)) continue;
      table = table ?? [];
      table.push(line.trim().slice(1, -1).split('|').map(c => c.trim()));
      continue;
    }
    const b = line.match(/^\s*[-*•]\s+(.*)$/);
    if (b) { flushPara(); flushTable(); if (!list || list.tag !== 'ul') { flushList(); list = { tag: 'ul', items: [] }; } list.items.push(b[1]); continue; }
    const n = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (n) { flushPara(); flushTable(); if (!list || list.tag !== 'ol') { flushList(); list = { tag: 'ol', items: [] }; } list.items.push(n[1]); continue; }
    if (/^\s*(---|\*\*\*)\s*$/.test(line)) { flushAll(); out.push('<hr>'); continue; }
    flushList(); flushTable();
    para.push(line.trim());
  }
  flushAll();
  return out.join('\n');
}

/** The "সাধারণ প্রশ্ন" section: a bold question line and the paragraph under it → FAQPage schema. */
export function extractFaq(md: string): Array<{ q: string; a: string }> {
  const i = md.search(/^#{2,3}\s+সাধারণ প্রশ্ন/m);
  if (i < 0) return [];
  const section = md.slice(i).split(/\n#{2}\s|\n---/)[0];
  const out: Array<{ q: string; a: string }> = [];
  const re = /\*\*([^*]+)\*\*\s*\n([^\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section))) out.push({ q: m[1].trim(), a: m[2].trim() });
  return out;
}

/** JSON-LD inside a <script>: escape `<` so content can never close the tag. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

export function bnDate(iso: string): string {
  const MON = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const local = new Date(d.getTime() + 6 * 3_600_000);
  const bn = (n: number) => String(n).replace(/\d/g, c => '০১২৩৪৫৬৭৮৯'[Number(c)]);
  return `${bn(local.getUTCDate())} ${MON[local.getUTCMonth()]} ${bn(local.getUTCFullYear())}`;
}

export const minutesToRead = (words: number) => Math.max(1, Math.round(words / 180));
export const postUrl = (kind: 'post' | 'page', slug: string) => `${getSiteUrl()}${kind === 'post' ? '/blog' : ''}/${slug}`;
