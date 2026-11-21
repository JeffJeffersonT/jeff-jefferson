/**
 * Shrines are little pages about one thing i love.
 * Add one here, then drop any images in public/shrines/<slug>/ .
 * The index and the individual pages update themselves.
 *
 * Example:
 *   { slug: "minecraft", title: "Minecraft", status: "coming-soon" }
 *
 * Don't invent blurbs. Leave `blurb` off until there's something real to say.
 */
export type Shrine = {
  slug: string;
  title: string;
  status: "open" | "coming-soon";
  blurb?: string;
};

export const shrines: Shrine[] = [
  // add shrines above this line
];
