// show the blinking "new!" tag next to posts from the last two weeks
const FRESH_DAYS = 14;

const now = Date.now();
document.querySelectorAll<HTMLElement>(".new-badge[data-pub]").forEach(el => {
  const pub = Date.parse(el.dataset.pub ?? "");
  if (!Number.isNaN(pub) && now - pub < FRESH_DAYS * 86400000) {
    el.classList.add("show");
  }
});
export {};

// ---------- visitor counter (Abacus, no account needed) ----------
// Counts once per browser-tab session: the first page you open bumps the
// number, later pages in the same session just read it.
const counterEl = document.querySelector<HTMLElement>("#visit-counter");
if (counterEl) {
  const { api, ns, key, digits } = counterEl.dataset;
  const note = document.querySelector<HTMLElement>("#visit-note");
  const show = (n: number) => {
    counterEl.textContent = String(n).padStart(Number(digits ?? 6), "0");
    counterEl.classList.remove("is-down");
    counterEl.setAttribute("aria-label", `visitor counter: ${n}`);
    if (note) note.textContent = "you are visitor number...";
  };
  const fail = () => {
    counterEl.textContent = "??????";
    counterEl.classList.add("is-down");
    if (note) note.textContent = "(counter is taking a nap)";
  };
  let counted = false;
  try {
    counted = sessionStorage.getItem("counted") === "1";
  } catch {
    /* storage blocked: just count */
  }
  const url = `${api}/${counted ? "get" : "hit"}/${ns}/${key}`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  fetch(url, { signal: ctl.signal })
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((d: { value?: number }) => {
      if (typeof d.value !== "number") throw new Error("bad data");
      if (!counted) {
        try {
          sessionStorage.setItem("counted", "1");
        } catch {
          /* ignore */
        }
      }
      show(d.value);
    })
    .catch(fail)
    .finally(() => clearTimeout(timer));
}
