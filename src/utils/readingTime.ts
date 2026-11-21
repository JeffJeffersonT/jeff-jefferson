/** Plain-words reading time from raw post text. About 200 words a minute. */
export function readingTime(text: string): string {
  const words = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  if (minutes === 1) return "about a minute to read";
  return `about ${minutes} minutes to read`;
}
