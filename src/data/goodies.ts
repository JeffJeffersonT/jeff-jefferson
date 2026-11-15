/**
 * The "goodies" page (/collect/): little things collected from around the web.
 *
 * Easiest way to add one: run `python3 scripts/add-goodie.py <category> <image-url> ...`
 * (see README). It downloads the image, wipes ALL metadata (keeping gif animation),
 * saves it in `public/goodies/<category>/` and adds a line below.
 *
 * By hand: drop the file in `public/goodies/<category>/` and add a line to that
 * category's array right above its `add-goodie` marker comment (keep the marker!).
 *  * `src` is the path inside `public/` (the site's base path is added for you).
 * `href` and `credit` are optional. Files stay local, never hotlink.
 */
export type Goodie = {
  /** Path inside `public/`, e.g. "/goodies/buttons/cool.gif". */
  src: string;
  /** Alt text, describe the image. */
  alt: string;
  /** Optional link (e.g. back to the site the button is for). */
  href?: string;
  /** Optional credit / where it came from. */
  credit?: string;
  /** Optional size in px (read from the file by add-goodie). */
  width?: number;
  height?: number;
};

export type GoodieCategory = {
  /** folder name under public/goodies/ */
  key: "buttons" | "blinkies" | "stamps" | "gifs";
  title: string;
  blurb: string;
  items: Goodie[];
};

export const buttons: Goodie[] = [
  // add-goodie:buttons
];

export const blinkies: Goodie[] = [
  // add-goodie:blinkies
];

export const stamps: Goodie[] = [
  // add-goodie:stamps
];

export const gifs: Goodie[] = [
  // add-goodie:gifs
];

export const categories: GoodieCategory[] = [
  { key: "buttons", title: "88x31 buttons", blurb: "tiny website badges, 88 by 31 pixels", items: buttons },
  { key: "blinkies", title: "blinkies", blurb: "small blinking banners", items: blinkies },
  { key: "stamps", title: "stamps", blurb: "little 99x56 web stamps", items: stamps },
  { key: "gifs", title: "gifs & doodads", blurb: "odds and ends, animated and not", items: gifs },
];
