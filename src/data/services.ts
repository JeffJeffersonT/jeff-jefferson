/**
 * Little third-party services the (static) site talks to from the browser.
 * Nothing here needs an account.
 */

/**
 * Visitor counter: Abacus (https://jasoncameron.dev/abacus/), a free counting
 * API with no signup. The counter lives at namespace/key below.
 * Each browser tab session counts once (see src/scripts/extras.ts).
 */
export const counter = {
  api: "https://abacus.jasoncameron.dev",
  namespace: "jeffersons-space",
  key: "visits",
  digits: 6,
};
