// Sidebar shoutbox. Same API and spam checks as the guestbook, rendered
// with textContent only.
type Shout = { id?: string; name: string; message: string; ts: number };

const root = document.querySelector<HTMLElement>("#shoutbox");
if (root) {
  const endpoint = (root.dataset.endpoint ?? "").replace(/\/+$/, "");
  const maxName = Number(root.dataset.maxName ?? 40);
  const maxMessage = Number(root.dataset.maxMessage ?? 160);
  const list = root.querySelector<HTMLOListElement>("#shout-list")!;
  const empty = root.querySelector<HTMLElement>("#shout-empty")!;
  const form = root.querySelector<HTMLFormElement>("#shout-form")!;
  const status = root.querySelector<HTMLElement>("#shout-status")!;
  const loadedAt = Date.now();

  const say = (text: string, kind: "" | "ok" | "err" = "") => {
    status.textContent = text;
    status.className = `shout-status ${kind}`.trim();
  };

  const render = (e: Shout, prepend = false) => {
    const li = document.createElement("li");
    const who = document.createElement("b");
    who.textContent = String(e.name).slice(0, maxName);
    const msg = document.createElement("span");
    msg.textContent = " " + String(e.message).slice(0, maxMessage);
    li.append(who, msg);
    if (prepend) list.prepend(li);
    else list.append(li);
    empty.hidden = true;
  };

  if (!endpoint) {
    empty.textContent = "the shoutbox is opening soon.";
  } else {
    empty.textContent = "loading shouts...";
    fetch(`${endpoint}/shouts`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { shouts?: Shout[] }) => {
        const shouts = Array.isArray(d.shouts) ? d.shouts : [];
        shouts.slice(0, 20).forEach(e => {
          if (e && typeof e.name === "string" && typeof e.message === "string") render(e);
        });
        if (list.children.length === 0) {
          empty.hidden = false;
          empty.textContent = "no shouts yet. say hi!";
        }
      })
      .catch(() => {
        empty.hidden = false;
        empty.textContent = "(shoutbox is taking a nap)";
      });
  }

  form?.addEventListener("submit", ev => {
    ev.preventDefault();
    if (!endpoint) return;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim().slice(0, maxName);
    const message = String(fd.get("message") ?? "").trim().slice(0, maxMessage);
    const nickname = String(fd.get("nickname") ?? "");
    if (!name || !message) {
      say("please fill in a name and a shout", "err");
      return;
    }
    const body = {
      name,
      message,
      nickname,
      elapsed: Date.now() - loadedAt,
    };
    const btn = form.querySelector<HTMLButtonElement>("button[type=submit]");
    if (btn) btn.disabled = true;
    say("sending...");
    fetch(`${endpoint}/shouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(async r => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error((d as { error?: string }).error || String(r.status));
        return d as { ok?: boolean; entry?: Shout };
      })
      .then(d => {
        if (d.entry) render(d.entry, true);
        form.reset();
        say("posted!", "ok");
      })
      .catch((err: Error) => {
        say(err.message || "could not post that, sorry", "err");
      })
      .finally(() => {
        if (btn) btn.disabled = false;
      });
  });
}
export {};
