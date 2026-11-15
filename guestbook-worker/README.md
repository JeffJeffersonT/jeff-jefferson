# guestbook worker

The guestbook page (`/guestbook/`) is a plain static page. Entries live in a tiny
Cloudflare Worker + KV store (free plan is plenty, no card needed).

1. sign up / log in at cloudflare.com (free)
2. `cd guestbook-worker && npx wrangler login`
3. `npx wrangler kv namespace create GUESTBOOK` and paste the printed id into `wrangler.toml`
4. optional, for deleting entries: `npx wrangler secret put ADMIN_TOKEN`
5. `npx wrangler deploy`, it prints a `https://jeff-guestbook.<name>.workers.dev` URL
6. put that URL into `src/data/guestbook.ts` (`endpoint`), commit, push. signing turns on.

Delete an entry: `curl -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" <worker-url>/entries/<id>`
