const btn = document.querySelector<HTMLButtonElement>("#random-site");
if (btn) {
  const raw = btn.dataset.sites ?? "[]";
  let sites: string[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      sites = parsed.filter(s => typeof s === "string" && /^https?:\/\//.test(s));
    }
  } catch {
    sites = [];
  }
  btn.addEventListener("click", () => {
    if (sites.length === 0) return;
    const href = sites[Math.floor(Math.random() * sites.length)];
    window.open(href, "_blank", "noopener,noreferrer");
  });
}
export {};
