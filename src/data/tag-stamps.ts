/**
 * Little stamp pictures that sit next to tags. Unknown tags use default.
 */
const KNOWN = new Set([
  "cooking",
  "food",
  "esports",
  "league-of-legends",
  "lck",
  "lpl",
  "worlds",
  "gen.g",
  "player-ratings",
  "blogging",
  "blg",
  "intro",
  "life",
  "life-skills",
  "self-taught",
  "opinions",
]);

export function stampFor(tagSlug: string): string {
  if (tagSlug === "gen.g") return "/tag-stamps/gen.g.png";
  return KNOWN.has(tagSlug) ? `/tag-stamps/${tagSlug}.png` : "/tag-stamps/default.png";
}
