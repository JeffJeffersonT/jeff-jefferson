/**
 * The "updates" box on the side of every page (like a site changelog).
 * Newest first. Add a line whenever you change something on the site:
 *   { date: "20 nov 2026", text: "added a new page!" },
 */
export type Update = { date: string; text: string };

export const updates: Update[] = [
  { date: "14 nov 2026", text: "new look. back to basics!" },
  { date: "14 nov 2026", text: "site opened!" },
];
