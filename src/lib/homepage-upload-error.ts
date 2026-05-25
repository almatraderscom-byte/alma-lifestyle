/** Show upload errors in builder (toast + alert so nothing is silent). */
export function reportHomepageBuilderUploadError(
  msg: string,
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
): void {
  console.error('[HomepageBuilder] Upload error:', msg);
  toast(msg, 'error');
  window.alert(`Upload error: ${msg}`);
}
