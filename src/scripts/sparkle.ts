// A little star trail that follows the cursor. Off when the visitor
// asks for reduced motion, and there's a button in the sidebar to
// turn it off the rest of the time.
const KEY = "sparkles";

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const wanted = () => {
  if (reduced()) return false;
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};

const remember = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage blocked */
  }
};

type Spark = { x: number; y: number; life: number; max: number; s: number; c: string };

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let running = false;
let raf = 0;
let last = 0;
const sparks: Spark[] = [];
const COLORS = ["#fff3a0", "#ffffff", "#e6c8ff", "#ffd0f0"];

const ensure = () => {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.id = "sparkle-layer";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  const resize = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);
};

const tick = () => {
  if (!running || !ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i];
    p.life += 1;
    const t = p.life / p.max;
    if (t >= 1) {
      sparks.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = p.c;
    const s = p.s * (1 - t * 0.35);
    ctx.fillRect(p.x - 0.5, p.y - s, 1, s * 2);
    ctx.fillRect(p.x - s, p.y - 0.5, s * 2, 1);
  }
  ctx.globalAlpha = 1;
  raf = requestAnimationFrame(tick);
};

const onMove = (e: MouseEvent) => {
  if (!running) return;
  const now = performance.now();
  if (now - last < 28) return;
  last = now;
  sparks.push({
    x: e.clientX + Math.random() * 8 - 4,
    y: e.clientY + Math.random() * 8 - 4,
    life: 0,
    max: 20 + Math.random() * 12,
    s: 2 + Math.random() * 2,
    c: COLORS[(Math.random() * COLORS.length) | 0],
  });
  if (sparks.length > 36) sparks.splice(0, sparks.length - 36);
};

const start = () => {
  if (running || reduced()) return;
  ensure();
  running = true;
  window.addEventListener("mousemove", onMove);
  raf = requestAnimationFrame(tick);
};

const stop = () => {
  running = false;
  window.removeEventListener("mousemove", onMove);
  if (raf) cancelAnimationFrame(raf);
  sparks.length = 0;
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const syncButton = () => {
  const btn = document.querySelector<HTMLButtonElement>("#sparkle-btn");
  if (!btn) return;
  const on = running;
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  const onLabel = btn.querySelector(".spark-on");
  const offLabel = btn.querySelector(".spark-off");
  if (onLabel && offLabel) {
    (onLabel as HTMLElement).hidden = on;
    (offLabel as HTMLElement).hidden = !on;
  } else {
    btn.textContent = on ? "turn sparkles off" : "turn sparkles on";
  }
};

const apply = () => {
  if (wanted()) start();
  else stop();
  syncButton();
};

apply();

document.querySelector("#sparkle-btn")?.addEventListener("click", () => {
  remember(!running);
  apply();
});

window
  .matchMedia("(prefers-reduced-motion: reduce)")
  .addEventListener("change", apply);

export {};
