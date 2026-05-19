/** Format amounts for Bangladesh storefront (BDT). */
export function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(
  amount: number,
  compareAt?: number
): { current: string; compare?: string; discount?: number } {
  const current = formatBDT(amount);
  if (!compareAt || compareAt <= amount) {
    return { current };
  }
  const discount = Math.round(((compareAt - amount) / compareAt) * 100);
  return {
    current,
    compare: formatBDT(compareAt),
    discount,
  };
}
