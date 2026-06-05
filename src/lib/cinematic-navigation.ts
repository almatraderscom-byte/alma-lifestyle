export const CINEMATIC_HOME_NAV_START = 'cinematic:home-nav-start';

export function dispatchHomeNavigationStart() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CINEMATIC_HOME_NAV_START));
  }
}
