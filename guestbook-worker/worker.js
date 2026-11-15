// Guestbook API for jeffersons.space: one small Cloudflare Worker + one KV namespace.
//
//   GET    /entries         -> { entries: [{ id, name, message, website, ts }, ...] }  (newest first)
//   POST   /sign            -> { name, message, website, nickname, elapsed }  -> { ok, entry }
//   DELETE /entries/:id     -> remove an entry (needs "Authorization: Bearer <ADMIN_TOKEN>")
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
const MIN_ELAPSED_MS = 3000;
const COOLDOWN_SECONDS = 60; // KV's minimum expirationTtl
const KEY = "entries";

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

async function sha(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
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
    const load = async () => JSON.parse((await env.GUESTBOOK.get(KEY)) ?? "[]");

    if (request.method === "GET" && url.pathname === "/entries") {
      const entries = await load();
      return json({ entries: entries.slice(0, 100) });
    }

    if (request.method === "POST" && url.pathname === "/sign") {
      // only accept posts coming from the site itself
      if (origin && origin !== allowed) return json({ error: "not allowed" }, 403);
      let data;
      try {
        data = await request.json();
      } catch {
        return json({ error: "bad request" }, 400);
      }
      // honeypot: bots fill every field. pretend it worked.
      if (clean(data.nickname, 100) !== "") return json({ ok: true });
      if (!(Number(data.elapsed) >= MIN_ELAPSED_MS)) {
        return json({ error: "that was fast! please try again in a few seconds" }, 429);
      }
      const name = clean(data.name, MAX_NAME);
      const message = clean(data.message, MAX_MESSAGE);
      const website = safeUrl(clean(data.website, MAX_WEBSITE));
      if (!name || !message) return json({ error: "please fill in your name and a message" }, 400);
      if ((message.match(/https?:\/\/|www\./gi) ?? []).length > 1) {
        return json({ error: "please keep it to one link at most" }, 400);
      }

      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const rlKey = "rl:" + (await sha(ip));
      if (await env.GUESTBOOK.get(rlKey)) {
        return json({ error: "easy there! one note a minute please" }, 429);
      }
      await env.GUESTBOOK.put(rlKey, "1", { expirationTtl: COOLDOWN_SECONDS });

      const entry = { id: crypto.randomUUID().slice(0, 8), name, message, website, ts: Date.now() };
      const entries = await load();
      entries.unshift(entry);
      await env.GUESTBOOK.put(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
      return json({ ok: true, entry }, 201);
    }

    const del = url.pathname.match(/^\/entries\/([\w-]+)$/);
    if (request.method === "DELETE" && del) {
      if (!env.ADMIN_TOKEN || request.headers.get("Authorization") !== `Bearer ${env.ADMIN_TOKEN}`) {
        return json({ error: "nope" }, 401);
      }
      const entries = (await load()).filter(e => e.id !== del[1]);
      await env.GUESTBOOK.put(KEY, JSON.stringify(entries));
      return json({ ok: true });
    }

    return json({ error: "not found" }, 404);
  },
};
