// quick crawl of dist/: every internal href/src must resolve to a real file
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const dist = "dist";
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") && files.push(p);
  }
})(dist);
let bad = 0;
for (const f of files) {
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(/(?:href|src)="([^"#?]*)(?:[?#][^"]*)?"/g)) {
    const u = m[1];
    if (!u || /^(https?:|mailto:|data:|javascript:|\/\/)/.test(u)) continue;
    let path = u.startsWith("/") ? u : join("/", f.replace(/index\.html$/, "").replace(dist, ""), u);
    const full = join(dist, path);
    const ok = existsSync(full) && (statSync(full).isFile() || existsSync(join(full, "index.html")));
    if (!ok) { bad++; console.log("BROKEN", f, "->", u); }
  }
}
console.log(`${files.length} pages checked, ${bad} broken`);
