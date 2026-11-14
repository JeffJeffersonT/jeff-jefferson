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
