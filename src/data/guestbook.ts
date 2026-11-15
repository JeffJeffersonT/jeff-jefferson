/**
 * Guestbook settings.
 *
 * The guestbook page (/guestbook/) talks to a tiny JSON API (see
 * `guestbook-worker/` in the repo root: a ~100 line Cloudflare Worker).
 * Paste the worker's URL into `endpoint` (no trailing slash) and push, and
 * signing turns on. While `endpoint` is empty the form shows up greyed out
 * with a "coming soon" note and the list says no entries yet.
 */
export const guestbook = {
  endpoint: "",
  maxName: 40,
  maxMessage: 500,
  maxWebsite: 100,
  /** how many entries to show */
  limit: 100,
};
