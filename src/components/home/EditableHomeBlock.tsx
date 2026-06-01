'use client';

import type { ReactNode } from 'react';
import { EditableSection } from '@/components/admin/EditableSection';

export function EditableHomeBlock({
  editMode,
  sectionId,
  sectionName,
  children,
}: {
  editMode?: boolean;
  sectionId: string;
  sectionName: string;
  children: ReactNode;
}) {
  if (!editMode) return <>{children}</>;
  return (
    <EditableSection sectionId={sectionId} sectionName={sectionName}>
      {children}
    </EditableSection>
  );
}
