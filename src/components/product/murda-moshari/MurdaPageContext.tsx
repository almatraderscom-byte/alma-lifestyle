'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { MurdaMoshariContent } from '@/lib/landing-content-types';
import { getDefaultMurdaMoshariContent } from '@/lib/murda-moshari-default-content';

const MurdaPageContext = createContext<MurdaMoshariContent>(getDefaultMurdaMoshariContent());

export function MurdaPageProvider({
  page,
  children,
}: {
  page: MurdaMoshariContent;
  children: ReactNode;
}) {
  return <MurdaPageContext.Provider value={page}>{children}</MurdaPageContext.Provider>;
}

export function useMurdaPage(): MurdaMoshariContent {
  return useContext(MurdaPageContext);
}
