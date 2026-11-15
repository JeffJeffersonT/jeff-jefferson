/**
 * The "updates" box on the side of every page (like a site changelog).
 * Newest first. Add a line whenever you change something on the site:
 *   { date: "20 nov 2026", text: "added a new page!" },
 */
export type Update = { date: string; text: string };

export const updates: Update[] = [
  { date: "15 nov 2026", text: "added a bunch of new buttons to the footer" },
  { date: "15 nov 2026", text: "moved to jeffersons.space, added a guestbook!" },
  { date: "15 nov 2026", text: "working visitor counter, cool sites page, random post link" },
  { date: "15 nov 2026", text: "new page: goodies! come grab my button" },
  { date: "14 nov 2026", text: "new look. back to basics!" },
  { date: "14 nov 2026", text: "site opened!" },
];
