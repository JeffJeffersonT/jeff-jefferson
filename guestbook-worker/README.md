# guestbook + comments worker

The guestbook page (`/guestbook/`) and the comments on each post are plain
static HTML. Entries live in a tiny Cloudflare Worker + KV store (free plan,
no card). Comments go up instantly, same as guestbook notes. No accounts.

**Currently deployed:** worker `jeffersons-guestbook`, KV namespace
`jeffersons-space-guestbook`, live at
`https://jeffersons-guestbook.jeffjefferson.workers.dev` (that URL is `endpoint` in
`src/data/guestbook.ts`). It only accepts writing from `https://jeffersons.space`.

## API

Guestbook:

- `GET /entries` returns `{ entries: [...] }`, newest first
- `POST /sign` with `{ name, message, website, nickname, elapsed }`
- `DELETE /entries/:id` removes an entry, needs `Authorization: Bearer <ADMIN_TOKEN>`

Post comments (slug is the post url slug, like `cooking-is-a-life-skill`):

- `GET /comments/:slug` returns `{ comments: [...] }`, newest first
- `POST /comments/:slug` with the same body as `/sign`
- `DELETE /comments/:slug/:id` removes a comment, needs the admin token

```
python3 scripts/comments.py list <slug>
python3 scripts/comments.py delete <slug> <id>
```

The admin token is a worker secret (not in the repo). The script reads it from
`/workspace/.guestbook-admin-token` (or `$ADMIN_TOKEN`) and never prints it.

## Spam protection

honeypot field, minimum time on page, length limits, one link max, control-character
stripping, a per-IP cooldown (best effort: KV is eventually consistent), a slug
check on comment routes, and a cap of 300 stored notes per list. The site renders
everything as plain text.

## Deploying changes

Either `npx wrangler deploy` from this folder (after `wrangler login` and putting the
KV id into `wrangler.toml`), or re-upload `worker.js` through the Cloudflare API/dashboard.
Keep the bindings: KV `GUESTBOOK`, var `ALLOWED_ORIGIN`, secret `ADMIN_TOKEN`.
