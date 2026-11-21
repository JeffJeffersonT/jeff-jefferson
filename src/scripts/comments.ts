// Post comments client: loads and posts comments for one post slug.
// Everything user-supplied is rendered with textContent (never innerHTML).
type Entry = { id?: string; name: string; message: string; website?: string; ts: number };

const root = document.querySelector<HTMLElement>("#comments");
if (root) {
  const endpoint = (root.dataset.endpoint ?? "").replace(/\/+$/, "");
  const slug = (root.dataset.slug ?? "").trim().replace(/^\/+/, "");
  const maxName = Number(root.dataset.maxName);
  const maxMessage = Number(root.dataset.maxMessage);
  const maxWebsite = Number(root.dataset.maxWebsite);
  const list = root.querySelector<HTMLOListElement>("#c-entries")!;
  const empty = root.querySelector<HTMLElement>("#c-empty")!;
  const form = root.querySelector<HTMLFormElement>("#c-form")!;
  const status = root.querySelector<HTMLElement>("#c-status")!;
  const count = root.querySelector<HTMLElement>("#c-count")!;
  const msgBox = form.elements.namedItem("message") as HTMLTextAreaElement;
  const loadedAt = Date.now();
  const cooldownKey = `c-last:${slug}`;

  const fmt = (ts: number) => {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).formatToParts(new Date(ts));
      const get = (t: string) => parts.find(p => p.type === t)?.value ?? "";
      return `${get("day")} ${get("month").toLowerCase()} ${get("year")}`;
    } catch {
      return "";
    }
  };
  const safeUrl = (u?: string) => {
    if (!u) return null;
    try {
      const url = new URL(u.trim());
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  };

  const render = (e: Entry, prepend = false) => {
    const li = document.createElement("li");
    li.className = "gb-entry";
    const head = document.createElement("div");
    head.className = "gb-head";
    const icon = document.createElement("img");
    icon.src = "/gifs/note-icon.png";
    icon.width = 12;
    icon.height = 12;
    icon.alt = "";
    icon.className = "gb-icon";
    const who = document.createElement("span");
    const name = document.createElement("b");
    name.textContent = String(e.name).slice(0, maxName);
    who.append(name);
    const site = safeUrl(e.website);
    if (site) {
      who.append(" (");
      const a = document.createElement("a");
      a.href = site;
      a.rel = "nofollow noopener noreferrer ugc";
      a.target = "_blank";
      a.textContent = "website";
      who.append(a, ")");
    }
    const when = document.createElement("span");
    when.textContent = fmt(e.ts);
    head.append(icon, who, when);
    const p = document.createElement("p");
    p.className = "gb-msg";
    p.textContent = String(e.message).slice(0, maxMessage);
    li.append(head, p);
    if (prepend) list.prepend(li);
    else list.append(li);
    empty.hidden = true;
  };

  const say = (text: string, kind: "" | "ok" | "err" = "") => {
    status.textContent = text;
    status.className = `gb-status ${kind}`.trim();
  };

  if (!endpoint || !slug) {
    empty.textContent = "couldn't load comments right now. try again in a bit :(";
  } else {
    empty.textContent = "loading comments...";
    fetch(`${endpoint}/comments/${encodeURIComponent(slug)}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { comments?: Entry[] }) => {
        const comments = Array.isArray(d.comments) ? d.comments : [];
        comments.forEach(e => {
          if (e && typeof e.name === "string" && typeof e.message === "string") render(e);
        });
        if (comments.length === 0) {
          empty.hidden = false;
          empty.textContent = "no comments yet, be the first";
        }
      })
      .catch(() => {
        empty.hidden = false;
        empty.textContent = "couldn't load comments right now. try again in a bit :(";
      });
  }

  const updateCount = () => {
    count.textContent = `${msgBox.value.length}/${maxMessage}`;
  };
  msgBox.addEventListener("input", updateCount);
  updateCount();

  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    if (!endpoint || !slug) return;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const website = String(fd.get("website") ?? "").trim();
    const hp = String(fd.get("nickname") ?? "");
    if (!name || !message) return say("please fill in your name and a comment :)", "err");
    if (name.length > maxName) return say(`name is too long (max ${maxName})`, "err");
    if (message.length > maxMessage) return say(`comment is too long (max ${maxMessage})`, "err");
    if (website && (website.length > maxWebsite || !safeUrl(website))) {
      return say("that website doesn't look right (start it with https://)", "err");
    }
    try {
      const last = Number(localStorage.getItem(cooldownKey) ?? 0);
      if (Date.now() - last < 60_000) return say("easy there! one comment a minute please :)", "err");
    } catch {
      /* ignore */
    }
    const btn = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
    btn.disabled = true;
    say("posting...");
    try {
      const r = await fetch(`${endpoint}/comments/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, website, nickname: hp, elapsed: Date.now() - loadedAt }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string; entry?: Entry };
      if (!r.ok) throw new Error(d.error ?? "something went wrong");
      say("thanks for commenting :)", "ok");
      if (d.entry) render(d.entry, true);
      form.reset();
      updateCount();
      try {
        localStorage.setItem(cooldownKey, String(Date.now()));
      } catch {
        /* ignore */
      }
    } catch (err) {
      say(`couldn't post: ${(err as Error).message}`, "err");
    } finally {
      btn.disabled = false;
    }
  });
}

export {};
