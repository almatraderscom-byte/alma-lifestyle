import type { MetadataRoute } from 'next';

const CANONICAL_SITE = 'https://almatraders.com';

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === 'production') {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/checkout/confirmation', '/cart', '/_next/'],
      },
      sitemap: `${CANONICAL_SITE}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
