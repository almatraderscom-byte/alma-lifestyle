/** Format a number using Bengali digits (locale bn-BD) */
export function toBanglaNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('bn-BD', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/** Format price in BDT with Bengali numerals (৳ ১,৫৫০) */
export function formatBdtPrice(amount: number): string {
  return `৳ ${toBanglaNumber(amount)}`;
}

/** Format a price range for filters */
export function formatBdtRange(min: number, max: number): string {
  return `${formatBdtPrice(min)} - ${formatBdtPrice(max)}`;
}

/** Rating display: ৪.৮ */
export function formatRating(rating: number): string {
  return toBanglaNumber(rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Review count: (২৫ রিভিউ) */
export function formatReviewCount(count: number): string {
  return `(${toBanglaNumber(count)} রিভিউ)`;
}

/** Pagination range: ৪৮টি পণ্যের মধ্যে ১-১২ */
export function formatProductRange(start: number, end: number, total: number): string {
  return `${toBanglaNumber(total)}টি পণ্যের মধ্যে ${toBanglaNumber(start)}-${toBanglaNumber(end)}`;
}

/** Total count: মোট ৪৮টি পণ্য */
export function formatTotalProducts(total: number): string {
  return `মোট ${toBanglaNumber(total)}টি পণ্য`;
}

/** Discount percent: ২০% ছাড় */
export function formatDiscountPercent(percent: number): string {
  return `${toBanglaNumber(percent)}% ছাড়`;
}

/** Page number for pagination buttons */
export function formatPageNumber(page: number): string {
  return toBanglaNumber(page);
}
