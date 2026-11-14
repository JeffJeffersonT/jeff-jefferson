#!/usr/bin/env node
/**
 * Publish helper used by ../post.sh
 *
 * - Optimizes images (max 1600px long side, WebP q82, all EXIF/GPS stripped)
 * - Copies the post + images into src/content/blog/
 * - Rewrites image references
 * - Builds the site to validate
 * - Commits, pushes, and waits for the GitHub Pages deploy (unless --dry-run)
 */
import { spawn } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  GITHUB_USERNAME,
  SITE_BASE,
  SITE_URL,
} from "../site.constants.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = path.join(ROOT, "src/content/blog");
const MAX_SIDE = 1600;
const WEBP_QUALITY = 82;
const IMAGE_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".tif",
  ".tiff",
  ".avif",
]);
const SVG_EXTS = new Set([".svg"]);

function usage(exitCode = 1) {
  console.error(
    "Usage: ./post.sh [--dry-run] <post.md> [image files...]\n" +
      "  Optimizes images, writes the post under src/content/blog/, builds, then\n" +
      "  commits, pushes, and waits for GitHub Pages (skipped with --dry-run)."
  );
  process.exit(exitCode);
}

function parseArgs(argv) {
  let dryRun = false;
  const positional = [];
  for (const arg of argv) {
    if (arg === "--dry-run" || arg === "-n") dryRun = true;
    else if (arg === "--help" || arg === "-h") usage(0);
    else if (arg.startsWith("-")) {
      console.error(`Unknown flag: ${arg}`);
      usage(1);
    } else positional.push(arg);
  }
  if (positional.length === 0) usage(1);
  const markdown = positional[0];
  const images = positional.slice(1);
  return { dryRun, markdown, images };
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { fm: "", body: markdown, data: {} };
  const fm = match[1];
  const body = markdown.slice(match[0].length);
  const data = {};
  const lines = fm.split(/\r?\n/);
  let currentArray = null;
  for (const line of lines) {
    const arrayItem = line.match(/^\s+-\s+(.*)$/);
    if (arrayItem && currentArray) {
      currentArray.push(arrayItem[1].replace(/^["']|["']$/g, ""));
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) {
      currentArray = null;
      continue;
    }
    const key = kv[1];
    let raw = kv[2];
    if (raw === "" || raw === "[]") {
      currentArray = [];
      data[key] = currentArray;
      continue;
    }
    currentArray = null;
    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      raw = raw.slice(1, -1);
    }
    data[key] = raw;
  }
  return { fm, body, data };
}

function run(command, args, { cwd = ROOT, env = process.env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

function runCapture(command, args, { cwd = ROOT, env = process.env } = {}) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const errChunks = [];
    const child = spawn(command, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.on("data", d => chunks.push(d));
    child.stderr.on("data", d => errChunks.push(d));
    child.on("error", reject);
    child.on("close", code => {
      const stdout = Buffer.concat(chunks).toString("utf8");
      const stderr = Buffer.concat(errChunks).toString("utf8");
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} failed (${code}): ${stderr || stdout}`));
    });
  });
}

function uniqueName(dir, base) {
  const ext = path.extname(base);
  const stem = path.basename(base, ext);
  let candidate = base;
  let i = 1;
  while (existsSync(path.join(dir, candidate))) {
    candidate = `${stem}-${i}${ext}`;
    i += 1;
  }
  return candidate;
}

async function optimizeImage(srcPath, destPath) {
  const ext = path.extname(srcPath).toLowerCase();
  if (SVG_EXTS.has(ext)) {
    copyFileSync(srcPath, destPath);
    return { width: null, height: null, format: "svg", bytes: null };
  }

  // rotate() applies EXIF orientation, then metadata is stripped by default
  // because withMetadata() is not used.
  let image = sharp(srcPath, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const long = Math.max(width, height);
  if (long > MAX_SIDE) {
    image = image.resize({
      width: width >= height ? MAX_SIDE : undefined,
      height: height > width ? MAX_SIDE : undefined,
      withoutEnlargement: true,
    });
  }

  await image.webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(destPath);
  const out = await sharp(destPath).metadata();
  return {
    width: out.width,
    height: out.height,
    format: out.format,
    hasExif: Boolean(out.exif || out.icc || out.xmp || out.iptc || out.tifftagPhotoshop),
  };
}

function rewriteMarkdown(markdown, replacements, slug, firstImageRel) {
  let result = markdown;

  const replaceRef = ref => {
    const cleaned = ref.trim().replace(/^<|>$/g, "").replace(/["']/g, "");
    const base = path.basename(cleaned.split("?")[0]);
    if (replacements.has(base)) return `./${slug}/${replacements.get(base)}`;
    if (replacements.has(cleaned)) return `./${slug}/${replacements.get(cleaned)}`;
    return null;
  };

  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (full, alt, src) => {
      const next = replaceRef(src);
      return next ? `![${alt}](${next})` : full;
    }
  );

  result = result.replace(
    /<img\b([^>]*?)\bsrc=(["'])([^"']+)\2/gi,
    (full, pre, quote, src) => {
      const next = replaceRef(src);
      return next ? `<img${pre}src=${quote}${next}${quote}` : full;
    }
  );

  // Frontmatter ogImage: path (quoted or not)
  result = result.replace(
    /^(ogImage:\s*)(.+)$/m,
    (full, prefix, value) => {
      const next = replaceRef(value.replace(/^["']|["']$/g, ""));
      return next ? `${prefix}${next}` : full;
    }
  );

  const fmMatch = result.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch && firstImageRel && !/^\s*ogImage:/m.test(fmMatch[1])) {
    const injected = result.replace(
      /^---\r?\n([\s\S]*?)\r?\n---/,
      `---\n${fmMatch[1]}\nogImage: ${firstImageRel}\n---`
    );
    result = injected;
  }

  return result;
}

async function githubApi(pathname, { method = "GET", body } = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set; cannot talk to the GitHub API.");
  }
  const res = await fetch(`https://api.github.com${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "jeff-jefferson-post-script",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data.message || text || res.statusText;
    throw new Error(`GitHub API ${method} ${pathname} failed (${res.status}): ${msg}`);
  }
  return data;
}

async function parseRemote() {
  const { stdout } = await runCapture("git", ["remote", "get-url", "origin"]);
  const url = stdout.trim();
  // Never print the raw URL if a token ever slipped in; parse carefully.
  const https = url.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (!https) {
    throw new Error("origin remote is not a github.com URL; cannot poll deploy status.");
  }
  return { owner: https[1], repo: https[2].replace(/\.git$/, "") };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForDeploy(sha, slug) {
  const { owner, repo } = await parseRemote();
  console.log(`Waiting for GitHub Actions deploy of ${sha.slice(0, 7)}...`);
  const started = Date.now();
  const timeout = 12 * 60 * 1000;
  let runId = null;

  while (Date.now() - started < timeout) {
    const data = await githubApi(
      `/repos/${owner}/${repo}/actions/runs?head_sha=${encodeURIComponent(sha)}&per_page=10`
    );
    const runs = (data.workflow_runs || []).filter(r =>
      /deploy|pages/i.test(r.name || r.display_title || r.path || "")
    );
    const run = runs[0] || (data.workflow_runs || [])[0];
    if (!run) {
      process.stdout.write(".");
      await sleep(8000);
      continue;
    }
    runId = run.id;
    const status = run.status;
    const conclusion = run.conclusion;
    console.log(`  run ${runId}: status=${status} conclusion=${conclusion ?? "-"}`);
    if (status === "completed") {
      if (conclusion === "success") {
        const live = `${SITE_URL}${SITE_BASE}/posts/${slug}/`;
        console.log(`Deployed. Live post URL:\n${live}`);
        return live;
      }
      throw new Error(`Deploy workflow finished with conclusion=${conclusion}`);
    }
    await sleep(10000);
  }
  throw new Error(
    `Timed out waiting for GitHub Actions deploy${runId ? ` (run ${runId})` : ""}.`
  );
}

async function main() {
  const { dryRun, markdown, images } = parseArgs(process.argv.slice(2));
  const mdPath = path.resolve(markdown);
  if (!existsSync(mdPath)) {
    console.error(`Markdown file not found: ${mdPath}`);
    process.exit(1);
  }
  for (const img of images) {
    const resolved = path.resolve(img);
    if (!existsSync(resolved)) {
      console.error(`Image file not found: ${resolved}`);
      process.exit(1);
    }
    const ext = path.extname(resolved).toLowerCase();
    if (!IMAGE_EXTS.has(ext) && !SVG_EXTS.has(ext)) {
      console.error(`Unsupported image type: ${resolved}`);
      process.exit(1);
    }
  }

  const source = readFileSync(mdPath, "utf8");
  const { data } = parseFrontmatter(source);
  const required = ["title", "pubDatetime", "description"];
  const missing = required.filter(k => !data[k]);
  if (missing.length) {
    console.error(
      `Post frontmatter is missing required field(s): ${missing.join(", ")}\n` +
        "Required: title, pubDatetime, description\n" +
        "Optional: tags, ogImage, slug, featured, draft, author, modDatetime"
    );
    process.exit(1);
  }

  const fileSlug = slugify(path.basename(mdPath, path.extname(mdPath)));
  const slug = data.slug ? slugify(String(data.slug)) : fileSlug;
  if (!slug) {
    console.error("Could not derive a slug from the filename or frontmatter.");
    process.exit(1);
  }

  mkdirSync(BLOG_DIR, { recursive: true });
  const imageDir = path.join(BLOG_DIR, slug);
  if (images.length) mkdirSync(imageDir, { recursive: true });

  const replacements = new Map(); // basename or original name -> dest filename
  let firstImageRel = null;

  for (const img of images) {
    const srcPath = path.resolve(img);
    const ext = path.extname(srcPath).toLowerCase();
    const destName = uniqueName(
      imageDir,
      slugify(path.basename(srcPath, ext)) + (SVG_EXTS.has(ext) ? ext : ".webp")
    );
    const destPath = path.join(imageDir, destName);
    console.log(`Optimizing ${path.basename(srcPath)} -> src/content/blog/${slug}/${destName}`);
    const info = await optimizeImage(srcPath, destPath);
    if (info.format !== "svg") {
      console.log(
        `  ${info.width}x${info.height} ${info.format}; EXIF/GPS stripped: ${info.hasExif ? "NO (still present)" : "yes"}`
      );
      if (info.hasExif) {
        throw new Error(`EXIF/metadata still present on ${destName}`);
      }
    }
    replacements.set(path.basename(srcPath), destName);
    replacements.set(srcPath, destName);
    if (!firstImageRel) firstImageRel = `./${slug}/${destName}`;
  }

  let output = rewriteMarkdown(source, replacements, slug, firstImageRel);
  const destMd = path.join(BLOG_DIR, `${slug}.md`);
  writeFileSync(destMd, output.endsWith("\n") ? output : `${output}\n`);
  console.log(`Wrote src/content/blog/${slug}.md`);

  console.log("Building site to validate...");
  await run("npm", ["run", "build"]);
  console.log("Build succeeded.");

  if (dryRun) {
    console.log("Dry run: skipping git commit, push, and deploy wait.");
    console.log(
      `Preview path: ${SITE_URL}${SITE_BASE}/posts/${slug}/ (after a real publish)`
    );
    return;
  }

  // Stage only the new post files (and nothing else unexpected).
  const toAdd = [`src/content/blog/${slug}.md`];
  if (images.length) toAdd.push(`src/content/blog/${slug}`);
  await run("git", ["add", "--", ...toAdd]);
  const status = await runCapture("git", ["status", "--porcelain"]);
  if (!status.stdout.trim()) {
    console.log("Nothing to commit (working tree clean for this post).");
  } else {
    await run("git", [
      "-c",
      "user.name=Jeff Jefferson",
      "-c",
      `user.email=${GITHUB_USERNAME}@users.noreply.github.com`,
      "commit",
      "-m",
      `Add post: ${data.title}`,
    ]);
  }

  const sha = (await runCapture("git", ["rev-parse", "HEAD"])).stdout.trim();
  // Credentials come from $GITHUB_TOKEN via a credential helper, so the token
  // is never written to .git/config, the remote URL, or any file.
  await run("git", [
    "-c",
    "credential.helper=",
    "-c",
    `credential.helper=!f() { echo username=${GITHUB_USERNAME}; echo "password=$GITHUB_TOKEN"; }; f`,
    "push",
    "origin",
    "HEAD",
  ]);
  await waitForDeploy(sha, slug);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});
