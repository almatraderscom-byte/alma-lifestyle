/** Format price in BDT with Bengali numerals (৳ ১,৫৫০) */
export function formatBdtPrice(amount: number): string {
  const formatted = new Intl.NumberFormat('bn-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `৳ ${formatted}`;
}
