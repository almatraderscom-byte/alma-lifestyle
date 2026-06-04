import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo/global-jsonld';

export function GlobalJsonLd() {
  return (
    <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
  );
}
