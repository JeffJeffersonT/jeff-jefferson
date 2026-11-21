// Guestbook client: loads entries, posts new ones to the guestbook API.
// Everything user-supplied is rendered with textContent (never innerHTML).
type Entry = { id?: string; name: string; message: string; website?: string; ts: number };

const root = document.querySelector<HTMLElement>("#guestbook");
if (root) {
  const endpoint = (root.dataset.endpoint ?? "").replace(/\/+$/, "");
  const maxName = Number(root.dataset.maxName);
  const maxMessage = Number(root.dataset.maxMessage);
  const maxWebsite = Number(root.dataset.maxWebsite);
  const list = root.querySelector<HTMLOListElement>("#gb-entries")!;
  const empty = root.querySelector<HTMLElement>("#gb-empty")!;
  const form = root.querySelector<HTMLFormElement>("#gb-form")!;
  const status = root.querySelector<HTMLElement>("#gb-status")!;
  const count = root.querySelector<HTMLElement>("#gb-count")!;
  const msgBox = form.elements.namedItem("message") as HTMLTextAreaElement;
  const loadedAt = Date.now();

  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const fmt = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
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

  if (!endpoint) {
    empty.textContent = "no entries yet. signing is opening soon!";
  } else {
    empty.textContent = "loading entries...";
    fetch(`${endpoint}/entries`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { entries?: Entry[] }) => {
        const entries = Array.isArray(d.entries) ? d.entries : [];
        entries.forEach(e => {
          if (e && typeof e.name === "string" && typeof e.message === "string") render(e);
        });
        if (entries.length === 0) {
          empty.hidden = false;
          empty.textContent = "no entries yet. be the first to sign!";
        }
      })
      .catch(() => {
        empty.hidden = false;
        empty.textContent = "couldn't load the entries right now. try again in a bit :(";
      });
  }

  const updateCount = () => {
    count.textContent = `${msgBox.value.length}/${maxMessage}`;
  };
  msgBox.addEventListener("input", updateCount);
  updateCount();

  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    if (!endpoint) return;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const website = String(fd.get("website") ?? "").trim();
    const hp = String(fd.get("nickname") ?? "");
    if (!name || !message) return say("please fill in your name and a message :)", "err");
    if (name.length > maxName) return say(`name is too long (max ${maxName})`, "err");
    if (message.length > maxMessage) return say(`message is too long (max ${maxMessage})`, "err");
    if (website && (website.length > maxWebsite || !safeUrl(website))) {
      return say("that website doesn't look right (start it with https://)", "err");
    }
    try {
      const last = Number(localStorage.getItem("gb-last") ?? 0);
      if (Date.now() - last < 60_000) return say("easy there! one note a minute please :)", "err");
    } catch {
      /* ignore */
    }
    const btn = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
    btn.disabled = true;
    say("signing...");
    try {
      const r = await fetch(`${endpoint}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, website, nickname: hp, elapsed: Date.now() - loadedAt }),
      });
      const d = (await r.json().catch(() => ({}))) as { error?: string; entry?: Entry };
      if (!r.ok) throw new Error(d.error ?? "something went wrong");
      say("thanks for signing! :)", "ok");
      if (d.entry) render(d.entry, true);
      form.reset();
      updateCount();
      try {
        localStorage.setItem("gb-last", String(Date.now()));
      } catch {
        /* ignore */
      }
    } catch (err) {
      say(`couldn't sign: ${(err as Error).message}`, "err");
    } finally {
      btn.disabled = false;
    }
  });
}
