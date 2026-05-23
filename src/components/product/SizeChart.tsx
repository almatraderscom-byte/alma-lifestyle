'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SIZE_CHART } from '@/lib/content';
import { toBanglaNumber } from '@/lib/format-bn';
import { cn } from '@/lib/utils';

interface SizeChartProps {
  open: boolean;
  onClose: () => void;
}

const ROWS = [
  { size: 'S', chestIn: 38, chestCm: 96, waistIn: 32, waistCm: 81, lengthIn: 40, lengthCm: 102 },
  { size: 'M', chestIn: 40, chestCm: 102, waistIn: 34, waistCm: 86, lengthIn: 41, lengthCm: 104 },
  { size: 'L', chestIn: 42, chestCm: 107, waistIn: 36, waistCm: 91, lengthIn: 42, lengthCm: 107 },
  { size: 'XL', chestIn: 44, chestCm: 112, waistIn: 38, waistCm: 97, lengthIn: 43, lengthCm: 109 },
  { size: 'XXL', chestIn: 46, chestCm: 117, waistIn: 40, waistCm: 102, lengthIn: 44, lengthCm: 112 },
];

export function SizeChart({ open, onClose }: SizeChartProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-primary/50"
            aria-label={SIZE_CHART.close}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-chart-title"
            className={cn(
              'relative w-full max-w-lg bg-background rounded-t-2xl sm:rounded-xl',
              'max-h-[85vh] overflow-hidden shadow-xl'
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
              <h2 id="size-chart-title" className="font-bn-heading text-xl font-bold text-primary">
                {SIZE_CHART.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 min-w-12 flex items-center justify-center text-primary font-bn-body text-sm"
              >
                {SIZE_CHART.close}
              </button>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full font-bn-body text-sm text-left">
                <thead>
                  <tr className="border-b border-border-subtle text-primary">
                    <th className="py-3 pr-2 font-semibold">{SIZE_CHART.sizeCol}</th>
                    <th className="py-3 px-2 font-semibold" colSpan={2}>
                      {SIZE_CHART.chest}
                    </th>
                    <th className="py-3 px-2 font-semibold" colSpan={2}>
                      {SIZE_CHART.waist}
                    </th>
                    <th className="py-3 pl-2 font-semibold" colSpan={2}>
                      {SIZE_CHART.length}
                    </th>
                  </tr>
                  <tr className="text-text-light text-xs border-b border-border-subtle">
                    <th />
                    <th className="py-1 px-1">{SIZE_CHART.inch}</th>
                    <th className="py-1 px-1">{SIZE_CHART.cm}</th>
                    <th className="py-1 px-1">{SIZE_CHART.inch}</th>
                    <th className="py-1 px-1">{SIZE_CHART.cm}</th>
                    <th className="py-1 px-1">{SIZE_CHART.inch}</th>
                    <th className="py-1 pl-1">{SIZE_CHART.cm}</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.size} className="border-b border-border-subtle/60">
                      <td className="py-3 pr-2 font-semibold text-primary">{row.size}</td>
                      <td className="py-3 px-1">{toBanglaNumber(row.chestIn)}</td>
                      <td className="py-3 px-1">{toBanglaNumber(row.chestCm)}</td>
                      <td className="py-3 px-1">{toBanglaNumber(row.waistIn)}</td>
                      <td className="py-3 px-1">{toBanglaNumber(row.waistCm)}</td>
                      <td className="py-3 px-1">{toBanglaNumber(row.lengthIn)}</td>
                      <td className="py-3 pl-1">{toBanglaNumber(row.lengthCm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 font-bn-body text-sm text-text-light leading-relaxed">
                {SIZE_CHART.note}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
