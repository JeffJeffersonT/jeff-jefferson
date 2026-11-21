/**
 * Guestbook settings.
 *
 * The guestbook page (/guestbook/), the comments on each post, and the shoutbox in the sidebar talk to a
 * tiny JSON API: the Cloudflare Worker in `guestbook-worker/` (deployed as "jeffersons-guestbook" with a KV
 * namespace "jeffersons-space-guestbook"). Set `endpoint` to "" to switch
 * signing off again (the form greys out with a "coming soon" note).
 */
export const guestbook = {
  endpoint: "https://jeffersons-guestbook.jeffjefferson.workers.dev",
  maxName: 40,
  maxMessage: 500,
  maxWebsite: 100,
  /** how many entries to show */
  limit: 100,
};
