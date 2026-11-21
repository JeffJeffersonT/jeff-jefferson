/**
 * Every public page on the site, in one place.
 * The nav, the site map, and any future "what's here" list should
 * read from this file so new pages only have to be added once.
 *
 * `path` is the url without a leading slash ("" is home).
 * `inNav` puts it in the left-hand navigation.
 */
export type SitePage = {
  path: string;
  label: string;
  group: "main" | "fun" | "meta";
  blurb: string;
  inNav?: boolean;
};

export const sitePages: SitePage[] = [
  { path: "", label: "home", group: "main", blurb: "the front door", inNav: true },
  { path: "posts", label: "posts", group: "main", blurb: "everything i've written so far", inNav: true },
  { path: "tags", label: "tags", group: "main", blurb: "posts grouped by topic", inNav: true },
  { path: "archives", label: "archives", group: "main", blurb: "posts sorted by month", inNav: true },
  { path: "likes", label: "stuff i like", group: "fun", blurb: "shows, games, music and card games", inNav: true },
  { path: "shrines", label: "shrines", group: "fun", blurb: "little pages about things i love", inNav: true },
  { path: "scrapbook", label: "scrapbook", group: "fun", blurb: "photos i've taken", inNav: true },
  { path: "goodies", label: "goodies", group: "fun", blurb: "buttons, blinkies, stamps and gifs", inNav: true },
  { path: "links", label: "cool sites", group: "fun", blurb: "other places on the web i like", inNav: true },
  { path: "guestbook", label: "guestbook", group: "meta", blurb: "leave a note", inNav: true },
  { path: "about", label: "about me", group: "meta", blurb: "a little about jeff", inNav: true },
  { path: "search", label: "search", group: "meta", blurb: "look through the posts", inNav: true },
  { path: "random", label: "random post", group: "meta", blurb: "surprise me", inNav: true },
  { path: "map", label: "site map", group: "meta", blurb: "a list of every page", inNav: true },
  { path: "updates", label: "updates", group: "meta", blurb: "what's changed on the site", inNav: false },
];

export const pageGroups: { key: SitePage["group"]; title: string }[] = [
  { key: "main", title: "writing" },
  { key: "fun", title: "fun stuff" },
  { key: "meta", title: "around the site" },
];
