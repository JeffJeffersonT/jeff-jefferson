/**
 * Banners, buttons, blinkies and gifs shown in the footer
 * ("snippets from other corners of the internet") and on /snippets/.
 *
 * How to add one (or run `python3 scripts/add-snippet.py <category> <url>`):
 *   1. Drop the file into the matching folder and keep it local, don't hotlink:
 *        public/buttons/   88x31 buttons
 *        public/blinkies/  150x20-ish blinkies
 *        public/gifs/      other gifs
 *        public/banners/   wider 468x60-style banners
 *   2. Add a line to the matching array below:
 *        { src: "/blinkies/my-blinkie.gif", alt: "what it says", href: "https://example.com" }
 *      `src` is the path inside `public/` (the site's base path is added for you).
 *      `href` is optional; leave it out if it isn't a link.
 *   3. Commit + push. Empty groups stay hidden in the footer.
 *      On /snippets/, an empty blinkies group shows a tiny "none yet".
 */
export type Banner = {
  /** Path inside `public/`, e.g. "/blinkies/cool.gif" (or a full https:// URL). */
  src: string;
  /** Alt text, describe the image. */
  alt: string;
  /** Optional link. Opens in a new tab. */
  href?: string;
  /** Optional width/height in px (defaults: banners auto, buttons 88x31, blinkies 150x20). */
  width?: number;
  height?: number;
};
/** Wide banners (usually 468x60 or similar). */
export const banners: Banner[] = [
  // add-snippet:banners
];

/** Little 88x31 buttons. */
export const buttons: Banner[] = [
  { src: "/buttons/2019.gif", alt: "2019", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/800x600.gif", alt: "800x600", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/acab.gif", alt: "acab", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/antinazi.gif", alt: "anti nazi", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/antinft.gif", alt: "anti nft", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/besteyes.gif", alt: "best eyes", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/built_with_microsoft_notepad.gif", alt: "built with microsoft notepad", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/bu12.gif", alt: "bu12", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/chrome.gif", alt: "chrome", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/e-scp.gif", alt: "e-scp", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/eightyeight.gif", alt: "eighty eight", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/fckgoogle.gif", alt: "fck google", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/fckfb.gif", alt: "fck fb", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/firefoxget.gif", alt: "firefox get", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/free-sex.gif", alt: "free sex", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/gaywomen.gif", alt: "gay women", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/givecredit.gif", alt: "give credit", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/guestbookbutton.gif", alt: "guestbook button", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/happy2006.gif", alt: "happy 2006", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/notepadpp2.gif", alt: "notepadpp 2", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/queerpride.gif", alt: "queer pride", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/rainbow_bev.gif", alt: "rainbow bev", href: "https://cyber.dabamos.de/88x31/" },
  { src: "/buttons/transnow2.gif", alt: "trans now 2", href: "https://cyber.dabamos.de/88x31/" },
  // add-snippet:buttons
];

/** Blinkies (usually 150x20-ish). */
export const blinkies: Banner[] = [
  // add-snippet:blinkies
];

/** Other gifs collected for the snippets page. */
export const gifs: Banner[] = [
  // add-snippet:gifs
];
