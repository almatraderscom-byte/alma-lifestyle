import { headers } from 'next/headers';

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Server component: JSON-LD with CSP nonce from middleware (`x-nonce`). */
export async function JsonLd({ data }: JsonLdProps) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
