'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomepageEditMode } from '@/context/HomepageEditModeContext';
import { HOMEPAGE_EDIT_SECTION_NAMES } from '@/lib/homepage-edit-messages';
import { cn } from '@/lib/utils';

interface EditableSectionProps {
  sectionId: string;
  sectionName?: string;
  children: ReactNode;
}

export function EditableSection({ sectionId, sectionName, children }: EditableSectionProps) {
  const ctx = useHomepageEditMode();
  const [isHovered, setIsHovered] = useState(false);

  const label = sectionName ?? HOMEPAGE_EDIT_SECTION_NAMES[sectionId] ?? sectionId;

  if (!ctx?.editMode || !ctx.overlaysEnabled) {
    return <>{children}</>;
  }

  const isSelected = ctx.selectedId === sectionId;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    ctx.selectSection(sectionId);
    window.parent?.postMessage(
      {
        type: 'EDIT_SECTION',
        sectionId,
        sectionName: label,
      },
      '*'
    );
  };

  return (
    <div
      data-editable-section={sectionId}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={cn(
        'relative cursor-pointer transition-[outline-color] duration-200',
        isSelected && 'z-[30]'
      )}
      style={{
        outlineWidth: 3,
        outlineStyle: isHovered || isSelected ? 'solid' : 'dashed',
        outlineColor: isHovered || isSelected ? '#C97D5D' : 'transparent',
        outlineOffset: -3,
      }}
    >
      <AnimatePresence>
        {(isHovered || isSelected) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-2 left-2 z-50 flex items-center gap-2 rounded-md bg-[#C97D5D] px-3 py-1.5 text-sm font-medium text-white shadow-lg pointer-events-none"
          >
            <EditIcon />
            {isSelected ? `Editing ${label}` : `Edit ${label}`}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

function EditIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
