import { getSiteUrl } from '@/lib/seo/site-url';

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ALMA Lifestyle',
    alternateName: 'Alma Traders',
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/alma-email-logo.jpg`,
    foundingDate: '1971',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+880-1307-777733',
      contactType: 'Customer Service',
      areaServed: 'BD',
      availableLanguage: ['Bengali', 'English'],
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: getSiteUrl(),
    name: 'ALMA Lifestyle',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${getSiteUrl()}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
