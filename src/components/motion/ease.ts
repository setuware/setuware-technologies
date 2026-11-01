/**
 * Shared motion tokens. One easing family across the site is what makes the
 * motion read as "designed" rather than a pile of unrelated transitions.
 */

/** Expo-out: fast start, long soft landing. Used for every entrance. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Symmetric ease for hover / state changes. */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  fast: 0.45,
  base: 0.9,
  slow: 1.3,
} as const;

/** Default viewport trigger: fire once, slightly before the element is fully in. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;
