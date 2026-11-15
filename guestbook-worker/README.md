# guestbook worker

The guestbook page (`/guestbook/`) is a plain static page. Entries live in a tiny
Cloudflare Worker + KV store (free plan, no card).

**Currently deployed:** worker `jeffersons-guestbook`, KV namespace
`jeffersons-space-guestbook`, live at
`https://jeffersons-guestbook.jeffjefferson.workers.dev` (that URL is `endpoint` in
`src/data/guestbook.ts`). It only accepts signing from `https://jeffersons.space`.

## API

- `GET /entries` returns `{ entries: [...] }`, newest first
- `POST /sign` with `{ name, message, website, nickname, elapsed }`
- `DELETE /entries/:id` removes an entry, needs `Authorization: Bearer <ADMIN_TOKEN>`

```
curl -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" https://jeffersons-guestbook.jeffjefferson.workers.dev/entries/<id>
```

The admin token is a worker secret (not in the repo). To see entries/ids, open `/entries`.

## Spam protection

honeypot field, minimum time on page, length limits, one link max, control-character
stripping, a per-IP cooldown (best effort: KV is eventually consistent), and a cap
of 300 stored entries. The site renders everything as plain text.

## Deploying changes

Either `npx wrangler deploy` from this folder (after `wrangler login` and putting the
KV id into `wrangler.toml`), or re-upload `worker.js` through the Cloudflare API/dashboard.
Keep the bindings: KV `GUESTBOOK`, var `ALLOWED_ORIGIN`, secret `ADMIN_TOKEN`.
