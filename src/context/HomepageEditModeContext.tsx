'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isHomepageEditMessage } from '@/lib/homepage-edit-messages';

type HomepageEditModeContextValue = {
  editMode: boolean;
  overlaysEnabled: boolean;
  selectedId: string | null;
  selectSection: (sectionId: string) => void;
  clearSelection: () => void;
};

const HomepageEditModeContext = createContext<HomepageEditModeContextValue | null>(null);

export function useHomepageEditMode() {
  return useContext(HomepageEditModeContext);
}

export function HomepageEditModeProvider({
  editMode,
  children,
}: {
  editMode: boolean;
  children: ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overlaysEnabled, setOverlaysEnabled] = useState(false);

  useEffect(() => {
    if (!editMode) {
      setOverlaysEnabled(false);
      return;
    }
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setOverlaysEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [editMode]);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    window.parent?.postMessage({ type: 'CLEAR_SECTION_EDIT' }, '*');
  }, []);

  const selectSection = useCallback((sectionId: string) => {
    setSelectedId(sectionId);
  }, []);

  useEffect(() => {
    if (!editMode) return;

    const onMessage = (event: MessageEvent) => {
      if (!isHomepageEditMessage(event.data)) return;
      if (event.data.type === 'HIGHLIGHT_SECTION') {
        const { sectionId } = event.data;
        setSelectedId(sectionId);
        const el = document.querySelector(`[data-editable-section="${sectionId}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => {
          setSelectedId((cur) => (cur === sectionId ? null : cur));
        }, 2000);
      }
      if (event.data.type === 'CLEAR_SECTION_EDIT') {
        setSelectedId(null);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [editMode]);

  useEffect(() => {
    if (!editMode) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-editable-section]')) return;
      if (target.closest('[data-homepage-edit-banner]')) return;
      clearSelection();
    };

    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [editMode, clearSelection]);

  useEffect(() => {
    if (!editMode) return;

    const blockNav = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('click', blockNav, true);
    return () => document.removeEventListener('click', blockNav, true);
  }, [editMode]);

  const value = useMemo(
    () => ({
      editMode,
      overlaysEnabled,
      selectedId,
      selectSection,
      clearSelection,
    }),
    [editMode, overlaysEnabled, selectedId, selectSection, clearSelection]
  );

  return (
    <HomepageEditModeContext.Provider value={value}>{children}</HomepageEditModeContext.Provider>
  );
}
