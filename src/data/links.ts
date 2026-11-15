/**
 * Cool sites page (/links/). Add a line to a group and push.
 */
export type Link = { name: string; href: string; blurb: string };
export type LinkGroup = { title: string; blurb?: string; links: Link[] };

export const linkGroups: LinkGroup[] = [
  {
    title: "places to make a site",
    links: [
      { name: "Neocities", href: "https://neocities.org/", blurb: "free hosting for personal websites, kind of a modern geocities" },
      { name: "32-Bit Cafe", href: "https://32bit.cafe/", blurb: "people who make personal websites, there's a forum and some group projects" },
      { name: "MelonLand", href: "https://melonland.net/", blurb: "web-crafting community with a forum, a wiki and lots of little projects" },
      { name: "Nekoweb", href: "https://nekoweb.org/", blurb: "another free host for personal sites, a lot like neocities" },
      { name: "Yesterweb", href: "https://yesterweb.org/", blurb: "old-web community that shut down in 2023, the site's still up with their manifesto" },
    ],
  },
  {
    title: "old web",
    links: [
      { name: "Cameron's World", href: "https://www.cameronsworld.net/", blurb: "a huge collage of old geocities pages" },
      { name: "The Old Net", href: "https://theoldnet.com/", blurb: "browse archived websites the way an old computer would have seen them" },
    ],
  },
  {
    title: "buttons and gifs",
    links: [
      { name: "GifCities", href: "https://gifcities.org/", blurb: "search the internet archive's old geocities gifs" },
      { name: "blinkies.cafe", href: "https://blinkies.cafe/", blurb: "make your own blinkies" },
      { name: "The 88x31 GIF Collection", href: "https://cyber.dabamos.de/88x31/", blurb: "thousands of old web buttons" },
      { name: "Hekate's Button Maker", href: "https://hekate2.github.io/buttonmaker/", blurb: "make your own 88x31 button" },
      { name: "FMHY", href: "https://fmhy.net/", blurb: "a big community list of free stuff online" },
    ],
  },
];
