'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { SITE, WHATSAPP } from '@/lib/content';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { useStoreSettings } from '@/context/StoreSettingsContext';
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon';
import { cn } from '@/lib/utils';

export function WhatsAppButton() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const settings = useStoreSettings();
  const href = buildWhatsAppHref(settings, SITE.whatsappPrefill);
  const isMurdaLanding = pathname === '/products/smart-murda-moshari';

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={WHATSAPP.label}
      className={cn(
        'fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex items-center gap-2',
        'rounded-full bg-[#25D366] text-white shadow-lg',
        'px-4 py-3 md:px-5 md:py-3.5',
        'hover:bg-[#20bd5a] transition-colors',
        isMurdaLanding && 'hidden md:flex'
      )}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        {!reduceMotion && (
          <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse motion-reduce:hidden" />
        )}
        <WhatsAppIcon />
      </span>
      <span className="hidden sm:inline font-bn-body text-sm font-medium pr-1">
        {WHATSAPP.label}
      </span>
    </motion.a>
  );
}
