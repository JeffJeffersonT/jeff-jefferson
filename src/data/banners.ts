/**
 * Banners & buttons shown in the footer ("snippets from other corners of the internet").
 *
 * How to add one:
 *   1. Drop the GIF (or PNG/WebP) into `public/banners/` (468x60 style banners)
 *      or `public/buttons/` (88x31 buttons). Keep files local, don't hotlink.
 *   2. Add a line to the matching array below:
 *        { src: "/banners/my-banner.gif", alt: "what it says", href: "https://example.com" }
 *      `src` is the path inside `public/` (the site's base path is added for you).
 *      `href` is optional; leave it out for a banner that isn't a link.
 *   3. Commit + push. While both arrays are empty the footer just says "(more coming soon)".
 */
export type Banner = {
  /** Path inside `public/`, e.g. "/banners/cool.gif" (or a full https:// URL). */
  src: string;
  /** Alt text, describe the banner. */
  alt: string;
  /** Optional link. Opens in a new tab. */
  href?: string;
  /** Optional width/height in px (defaults: banners auto, buttons 88x31). */
  width?: number;
  height?: number;
};

/** Wide banners (usually 468x60 or similar). */
export const banners: Banner[] = [];

/** Little 88x31 buttons. */
export const buttons: Banner[] = [];
