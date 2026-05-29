/** Premium editorial easing */
export const EASE_PREMIUM: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeUpTransition = (delay = 0) => ({
  duration: 0.6,
  delay,
  ease: EASE_PREMIUM,
});

export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_PREMIUM },
  },
};

export const scrollViewport = {
  once: true as const,
  margin: '-100px' as const,
};

export const cardRevealViewport = {
  once: true as const,
  amount: 0.5 as const,
  margin: '-40px' as const,
};
