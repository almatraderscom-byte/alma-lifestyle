'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Global open/close state for the ALMA AI assistant panel, with an optional
 * page context string ("Customer is viewing: <product>") that the widget
 * forwards to the chat API so the model knows what the customer is looking at.
 */

interface AssistantApi {
  open: boolean;
  /** Extra context injected into the system prompt for this conversation. */
  pageContext: string | null;
  openAssistant: (pageContext?: string) => void;
  closeAssistant: () => void;
}

const AssistantContext = createContext<AssistantApi>({
  open: false,
  pageContext: null,
  openAssistant: () => {},
  closeAssistant: () => {},
});

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pageContext, setPageContext] = useState<string | null>(null);

  const openAssistant = useCallback((ctx?: string) => {
    if (ctx) setPageContext(ctx);
    setOpen(true);
  }, []);
  const closeAssistant = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, pageContext, openAssistant, closeAssistant }),
    [open, pageContext, openAssistant, closeAssistant]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant(): AssistantApi {
  return useContext(AssistantContext);
}
