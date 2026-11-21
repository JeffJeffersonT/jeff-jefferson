/**
 * Banners, buttons, blinkies, stamps and gifs shown on the goodies page (/goodies/).
 *
 * How to add one (or run `python3 scripts/add-snippet.py <category> <url>`):
 *   1. Drop the file into the matching folder and keep it local, don't hotlink:
 *        public/buttons/   88x31 buttons
 *        public/blinkies/  150x20-ish blinkies
 *        public/stamps/    ~99x56 stamps
 *        public/gifs/      other gifs
 *        public/banners/   wider 468x60-style banners
 *   2. Add a line to the matching array below:
 *        { src: "/blinkies/my-blinkie.gif", alt: "what it says", href: "https://example.com" }
 *      `src` is the path inside `public/` (the site's base path is added for you).
 *      `href` is optional; leave it out if it isn't a link.
 *   3. Commit + push. Empty groups stay hidden on the goodies page.
 */
export type Banner = {
  /** Path inside `public/`, e.g. "/blinkies/cool.gif" (or a full https:// URL). */
  src: string;
  /** Alt text, describe the image. */
  alt: string;
  /** Optional link. Opens in a new tab. */
  href?: string;
  /** Optional credit / where it came from. */
  credit?: string;
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
  { src: "/buttons/1bookmark.png", alt: "1bookmark", href: "https://pixelsafari.neocities.org/", width: 88, height: 31 },
  { src: "/buttons/1ao3.png", alt: "1ao3", href: "https://pixelsafari.neocities.org/", width: 88, height: 31 },
  { src: "/buttons/1bw19.gif", alt: "1bw19", href: "https://pixelsafari.neocities.org/", width: 88, height: 31 },
  { src: "/buttons/signguest.gif", alt: "signguest", href: "https://pixelsafari.neocities.org/", width: 88, height: 31 },
  { src: "/buttons/1html.gif", alt: "1html", href: "https://pixelsafari.neocities.org/", width: 88, height: 31 },
  { src: "/buttons/1neo15.gif", alt: "1neo15", href: "https://pixelsafari.neocities.org/", width: 88, height: 31 },
  { src: "/buttons/3among.gif", alt: "3among", href: "https://pixelsafari.neocities.org/", width: 88, height: 31 },
  // add-snippet:buttons
];

/** Blinkies (usually 150x20-ish). */
export const blinkies: Banner[] = [
  { src: "/blinkies/0187-transparentsparkle.gif", alt: "0187 transparentsparkle", href: "https://blinkies.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/0128-splatoon2.gif", alt: "0128 splatoon2", href: "https://blinkies.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/0133-applejack.gif", alt: "0133 applejack", href: "https://blinkies.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/0123-glitterpink.gif", alt: "0123 glitterpink", href: "https://blinkies.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/0124-stars.gif", alt: "0124 stars", href: "https://blinkies.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/0079-nonbinary.gif", alt: "0079 nonbinary", href: "https://blinkies.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/0061-pinkcomputer.gif", alt: "0061 pinkcomputer", href: "https://blinkies.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/0006-purple.gif", alt: "0006 purple", href: "https://blinkies.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/gaypride2.gif", alt: "gaypride2", href: "https://blinkies.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/blinkiebug1.gif", alt: "blinkiebug1", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/blinkiejunkie.gif", alt: "blinkiejunkie", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/geek.gif", alt: "geek", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/ihateadobe.gif", alt: "ihateadobe", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/2003.gif", alt: "2003", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/beyourself.gif", alt: "beyourself", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/loveyourself.gif", alt: "loveyourself", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/lovefriends.gif", alt: "lovefriends", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/dablinkie.gif", alt: "dablinkie", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/onthefloor.gif", alt: "onthefloor", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/weball.gif", alt: "weball", href: "https://pixelsafari.neocities.org/", width: 400, height: 53 },
  { src: "/blinkies/whore.gif", alt: "whore", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/musicplay.gif", alt: "musicplay", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/emomusic.gif", alt: "emomusic", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/monsterhigh.gif", alt: "monsterhigh", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/sanrio4.gif", alt: "sanrio4", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/undertale.gif", alt: "undertale", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  { src: "/blinkies/clumppenguin.gif", alt: "clumppenguin", href: "https://pixelsafari.neocities.org/", width: 400, height: 53 },
  { src: "/blinkies/pokemon.gif", alt: "pokemon", href: "https://pixelsafari.neocities.org/", width: 150, height: 20 },
  // add-snippet:blinkies
];

/** Stamps (usually around 99x56). */
export const stamps: Banner[] = [
  { src: "/stamps/portal1.png", alt: "portal1", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/ilovestamps.gif", alt: "ilovestamps", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/load.gif", alt: "load", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/meta.png", alt: "meta", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/wiggly.png", alt: "wiggly", href: "https://pixelsafari.neocities.org/", width: 98, height: 59 },
  { src: "/stamps/textsize.png", alt: "textsize", href: "https://pixelsafari.neocities.org/", width: 97, height: 57 },
  { src: "/stamps/ilovemyds.png", alt: "ilovemyds", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/3ds.gif", alt: "3ds", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/iloveoldweb.png", alt: "iloveoldweb", href: "https://pixelsafari.neocities.org/", width: 99, height: 55 },
  { src: "/stamps/website.gif", alt: "website", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/gender2.png", alt: "gender2", href: "https://pixelsafari.neocities.org/", width: 97, height: 55 },
  { src: "/stamps/fnaf.gif", alt: "fnaf", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/clubpenguin.png", alt: "clubpenguin", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/starlights.png", alt: "starlights", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  { src: "/stamps/portal2.png", alt: "portal2", href: "https://pixelsafari.neocities.org/", width: 99, height: 56 },
  // add-snippet:stamps
];

/** Other gifs collected for the goodies page. */
export const gifs: Banner[] = [
  // add-snippet:gifs
];
