type FbqFn = (command: string, event: string, params?: object) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
  }
}

export const fbPixel = {
  track(event: string, params?: object) {
    if (typeof window === 'undefined' || !window.fbq) return;
    window.fbq('track', event, params);
  },
};
