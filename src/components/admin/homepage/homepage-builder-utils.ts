import type { HomepageConfig, HomepageSectionConfig, HomepageSectionId } from '@/lib/homepage-config-types';
import { HOMEPAGE_SECTION_LABELS } from '@/lib/homepage-config-types';

export function reorderSections(
  config: HomepageConfig,
  fromIndex: number,
  toIndex: number
): HomepageConfig {
  const sorted = [...config.sections].sort((a, b) => a.order - b.order);
  const [moved] = sorted.splice(fromIndex, 1);
  if (!moved) return config;
  sorted.splice(toIndex, 0, moved);
  const sections = sorted.map((s, i) => ({ ...s, order: i })) as HomepageSectionConfig[];
  return { ...config, sections };
}

export function toggleSectionEnabled(
  config: HomepageConfig,
  id: HomepageSectionId
): HomepageConfig {
  return {
    ...config,
    sections: config.sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ) as HomepageSectionConfig[],
  };
}

export function updateSection<K extends HomepageSectionId>(
  config: HomepageConfig,
  id: K,
  patch: Partial<Extract<HomepageSectionConfig, { id: K }>>
): HomepageConfig {
  return {
    ...config,
    sections: config.sections.map((s) =>
      s.id === id ? ({ ...s, ...patch } as HomepageSectionConfig) : s
    ) as HomepageSectionConfig[],
  };
}

export function formatLastSaved(iso: string | undefined): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleString('en-GB');
}

export function sectionLabel(id: HomepageSectionId): string {
  return HOMEPAGE_SECTION_LABELS[id];
}

export const HOMEPAGE_DRAFT_EVENT = 'alma-homepage-draft-updated';

export function dispatchDraftUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(HOMEPAGE_DRAFT_EVENT));
  }
}
