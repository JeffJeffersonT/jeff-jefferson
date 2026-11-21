// Guestbook + post comments + shoutbox API for jeffersons.space: one Cloudflare Worker + one KV namespace.
//
// Guestbook:
//   GET    /entries         -> { entries: [{ id, name, message, website, ts }, ...] }  (newest first)
//   POST   /sign            -> { name, message, website, nickname, elapsed }  -> { ok, entry }
//   DELETE /entries/:id     -> remove an entry (needs "Authorization: Bearer <ADMIN_TOKEN>")
//
// Post comments (keyed by post slug):
//   GET    /comments/:slug         -> { comments: [...] }  (newest first)
//   POST   /comments/:slug         -> same body as /sign  -> { ok, entry }
//   DELETE /comments/:slug/:id     -> remove a comment (needs admin token)
//
// Shoutbox (short notes in the sidebar):
//   GET    /shouts          -> { shouts: [...] }  (newest first)
//   POST   /shouts          -> same body as /sign, message capped shorter  -> { ok, entry }
//   DELETE /shouts/:id      -> remove a shout (needs admin token)
//
// Comments go up instantly, same as guestbook notes. No approval queue.
//
// Spam protection: honeypot field (`nickname` must be empty), a minimum
// time-on-page, length limits, control-character stripping, max one link-ish
// thing per message, a per-IP cooldown, and a cap on stored entries.
// Everything is stored as plain text; the site renders it with textContent.
//
// Bindings (see wrangler.toml): GUESTBOOK (KV namespace), ALLOWED_ORIGIN (var),
// ADMIN_TOKEN (secret, optional).

const MAX_NAME = 40;
const MAX_MESSAGE = 500;
const MAX_WEBSITE = 100;
const MAX_ENTRIES = 300;
const MAX_SLUG = 80;
const MIN_ELAPSED_MS = 3000;
const COOLDOWN_SECONDS = 60; // KV's minimum expirationTtl
const KEY = "entries";
const SHOUTS_KEY = "shouts";
const MAX_SHOUTS = 40;
const MAX_SHOUT = 160;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const clean = (v, max) =>
  String(v ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e]/g, "")
    .trim()
    .slice(0, max);

const safeUrl = v => {
  if (!v) return "";
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href.slice(0, MAX_WEBSITE) : "";
  } catch {
    return "";
  }
};

const validSlug = s => typeof s === "string" && s.length > 0 && s.length <= MAX_SLUG && SLUG_RE.test(s);

const commentsKey = slug => "comments:" + slug;

async function sha(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}

function parseBody(request) {
  return request.json();
}

function readFields(data) {
  const name = clean(data.name, MAX_NAME);
  const message = clean(data.message, MAX_MESSAGE);
  const website = safeUrl(clean(data.website, MAX_WEBSITE));
  const nickname = clean(data.nickname, 100);
  const elapsed = Number(data.elapsed);
  return { name, message, website, nickname, elapsed };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") ?? "";
    const allowed = env.ALLOWED_ORIGIN || "https://jeffersons.space";
    const cors = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
    const json = (body, status = 200, extra = {}) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...cors, ...extra },
      });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const load = async key => JSON.parse((await env.GUESTBOOK.get(key)) ?? "[]");

    const isAdmin = () =>
      Boolean(env.ADMIN_TOKEN) && request.headers.get("Authorization") === `Bearer ${env.ADMIN_TOKEN}`;

    const cooldown = async (busyMsg) => {
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const rlKey = "rl:" + (await sha(ip));
      if (await env.GUESTBOOK.get(rlKey)) {
        return json({ error: busyMsg }, 429);
      }
      await env.GUESTBOOK.put(rlKey, "1", { expirationTtl: COOLDOWN_SECONDS });
      return null;
    };

    const acceptEntry = async (data, missingMsg, busyMsg) => {
      if (origin && origin !== allowed) return { error: json({ error: "not allowed" }, 403) };
      const fields = readFields(data);
      // honeypot: bots fill every field. pretend it worked.
      if (fields.nickname !== "") return { fake: json({ ok: true }) };
      if (!(fields.elapsed >= MIN_ELAPSED_MS)) {
        return { error: json({ error: "that was fast! please try again in a few seconds" }, 429) };
      }
      if (!fields.name || !fields.message) return { error: json({ error: missingMsg }, 400) };
      if ((fields.message.match(/https?:\/\/|www\./gi) ?? []).length > 1) {
        return { error: json({ error: "please keep it to one link at most" }, 400) };
      }
      const blocked = await cooldown(busyMsg);
      if (blocked) return { error: blocked };
      const entry = {
        id: crypto.randomUUID().slice(0, 8),
        name: fields.name,
        message: fields.message,
        website: fields.website,
        ts: Date.now(),
      };
      return { entry };
    };

    if (request.method === "GET" && path === "/entries") {
      const entries = await load(KEY);
      return json({ entries: entries.slice(0, 100) });
    }

    if (request.method === "POST" && path === "/sign") {
      let data;
      try {
        data = await parseBody(request);
      } catch {
        return json({ error: "bad request" }, 400);
      }
      const result = await acceptEntry(
        data,
        "please fill in your name and a message",
        "easy there! one note a minute please",
      );
      if (result.error) return result.error;
      if (result.fake) return result.fake;
      const entries = await load(KEY);
      entries.unshift(result.entry);
      await env.GUESTBOOK.put(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
      return json({ ok: true, entry: result.entry }, 201);
    }

    const delEntry = path.match(/^\/entries\/([\w-]+)$/);
    if (request.method === "DELETE" && delEntry) {
      if (!isAdmin()) return json({ error: "nope" }, 401);
      const entries = (await load(KEY)).filter(e => e.id !== delEntry[1]);
      await env.GUESTBOOK.put(KEY, JSON.stringify(entries));
      return json({ ok: true });
    }

    const commentsGetPost = path.match(/^\/comments\/([a-z0-9-]+)$/);
    if (commentsGetPost) {
      const slug = commentsGetPost[1];
      if (!validSlug(slug)) return json({ error: "bad slug" }, 400);
      const ckey = commentsKey(slug);
      if (request.method === "GET") {
        const comments = await load(ckey);
        return json({ comments: comments.slice(0, 100) });
      }
      if (request.method === "POST") {
        let data;
        try {
          data = await parseBody(request);
        } catch {
          return json({ error: "bad request" }, 400);
        }
        const result = await acceptEntry(
          data,
          "please fill in your name and a comment",
          "easy there! one comment a minute please",
        );
        if (result.error) return result.error;
        if (result.fake) return result.fake;
        const comments = await load(ckey);
        comments.unshift(result.entry);
        await env.GUESTBOOK.put(ckey, JSON.stringify(comments.slice(0, MAX_ENTRIES)));
        return json({ ok: true, entry: result.entry }, 201);
      }
    }

    const delComment = path.match(/^\/comments\/([a-z0-9-]+)\/([\w-]+)$/);
    if (request.method === "DELETE" && delComment) {
      const slug = delComment[1];
      if (!validSlug(slug)) return json({ error: "bad slug" }, 400);
      if (!isAdmin()) return json({ error: "nope" }, 401);
      const ckey = commentsKey(slug);
      const comments = (await load(ckey)).filter(e => e.id !== delComment[2]);
      await env.GUESTBOOK.put(ckey, JSON.stringify(comments));
      return json({ ok: true });
    }


    if (request.method === "GET" && path === "/shouts") {
      const shouts = await load(SHOUTS_KEY);
      return json({ shouts: shouts.slice(0, MAX_SHOUTS) });
    }

    if (request.method === "POST" && path === "/shouts") {
      let data;
      try {
        data = await parseBody(request);
      } catch {
        return json({ error: "bad request" }, 400);
      }
      // keep shouts short, same protections as a guestbook note
      if (data && typeof data.message === "string") data.message = data.message.slice(0, MAX_SHOUT);
      const result = await acceptEntry(
        data,
        "please fill in your name and a shout",
        "easy there! one shout a minute please",
      );
      if (result.error) return result.error;
      if (result.fake) return result.fake;
      const shouts = await load(SHOUTS_KEY);
      shouts.unshift(result.entry);
      await env.GUESTBOOK.put(SHOUTS_KEY, JSON.stringify(shouts.slice(0, MAX_SHOUTS)));
      return json({ ok: true, entry: result.entry }, 201);
    }

    const delShout = path.match(/^\/shouts\/([\w-]+)$/);
    if (request.method === "DELETE" && delShout) {
      if (!isAdmin()) return json({ error: "nope" }, 401);
      const shouts = (await load(SHOUTS_KEY)).filter(e => e.id !== delShout[1]);
      await env.GUESTBOOK.put(SHOUTS_KEY, JSON.stringify(shouts));
      return json({ ok: true });
    }

    return json({ error: "not found" }, 404);
  },
};
