/**
 * The "cool sites" page (/links/). Add a line to any group and push.
 */
export type Link = { name: string; href: string; blurb: string };
export type LinkGroup = { title: string; blurb: string; links: Link[] };

export const linkGroups: LinkGroup[] = [
  {
    title: "cozy neighbourhoods",
    blurb: "places where the handmade web lives",
    links: [
      { name: "Neocities", href: "https://neocities.org/", blurb: "free hosting for hand-coded sites. browse thousands of them." },
      { name: "32-Bit Cafe", href: "https://32bit.cafe/", blurb: "a friendly community of people making tiny weird websites." },
      { name: "MelonLand", href: "https://melonland.net/", blurb: "a cozy hub, forum and project for the small web." },
      { name: "Nekoweb", href: "https://nekoweb.org/", blurb: "another free host for little personal sites." },
      { name: "Yesterweb", href: "https://yesterweb.org/", blurb: "a community for people who miss the old, personal internet." },
    ],
  },
  {
    title: "wandering around",
    blurb: "get a little lost on purpose",
    links: [
      { name: "Cameron's World", href: "https://www.cameronsworld.net/", blurb: "a giant collage made out of old GeoCities pages." },
      { name: "The Old Net", href: "https://theoldnet.com/", blurb: "browse the web the way it looked in a given year." },
      { name: "Wiby", href: "https://wiby.me/", blurb: "a search engine for old-style, simple websites. it even has a surprise me button." },
      { name: "Marginalia Search", href: "https://marginalia-search.com/", blurb: "a search engine that digs up small, independent sites." },
      { name: "Hampster Dance", href: "https://hampsterdance.com/", blurb: "the original. dancing hamsters, forever." },
    ],
  },
  {
    title: "goodies and doodads",
    blurb: "where to find gifs, buttons and blinkies for your own page",
    links: [
      { name: "GifCities", href: "https://gifcities.org/", blurb: "search through the Internet Archive's old GeoCities gifs." },
      { name: "blinkies.cafe", href: "https://blinkies.cafe/", blurb: "type some words and it makes you a blinkie." },
      { name: "The 88x31 GIF Collection", href: "https://cyber.dabamos.de/88x31/", blurb: "thousands of little website buttons." },
      { name: "Hekate's Button Maker", href: "https://hekate2.github.io/buttonmaker/", blurb: "make your very own 88x31 button." },
    ],
  },
];
