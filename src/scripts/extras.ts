// Little handmade touches: blinking "new!" badges and a friendly greeting.
const FRESH_DAYS = 14;

const greetings = [
  "thanks for stopping by!",
  "hope you have a nice day :)",
  "make yourself at home.",
  "grab a snack, stay a while.",
  "so glad you're here!",
  "pull up a chair.",
  "come back soon!",
  "you're all caught up. go do something nice.",
];

function setup(): void {
  const now = Date.now();
  document.querySelectorAll<HTMLElement>(".new-badge[data-pub]").forEach(el => {
    const pub = Date.parse(el.dataset.pub ?? "");
    if (!Number.isNaN(pub) && now - pub < FRESH_DAYS * 86400000) {
      el.classList.add("show");
    }
  });

  const note = document.getElementById("hello-note");
  if (note) {
    note.textContent = greetings[Math.floor(Math.random() * greetings.length)];
  }
}

setup();
document.addEventListener("astro:page-load", setup);
export {};
