# Jeff Jefferson

Jeff's corner of the internet: i write about the things i like. hope you have a nice day :)

A handmade, early-2000s-style personal homepage built with [Astro](https://astro.build) (started from the [AstroPaper](https://github.com/satnaing/astro-paper) theme). Tiled wallpaper, a bordered fixed-width page, a sidebar of little boxes, day/night mode, RSS, tags, archives and search.

Live at [https://oddcolorout.com/jeff-jefferson/](https://oddcolorout.com/jeff-jefferson/).

## What's on the page

- masthead with a welcome line, a scrolling marquee strip and a button-style nav
- sidebar boxes: about me, recent posts (with blinking `new!` badges for fresh posts), tags with counts, archive by month, a decorative visitor counter, a friendly greeting, and a few 88x31 buttons
- posts with framed images, tag chips, share links and prev/next links
- a **goodies** page (`/collect/`), see below
- footer with a **snippets from other corners of the internet** area (see below) and a "best viewed in any browser" line
- the sidebar stacks under the content on phones

## Site URL and base

GitHub username, repo name, site origin, and base path live in one file: [`site.constants.ts`](./site.constants.ts). `astro.config.ts` and `astro-paper.config.ts` both import from there.

- site: `https://oddcolorout.com`
- base: `/jeff-jefferson`
- live URL: `https://oddcolorout.com/jeff-jefferson/`

Site title, tagline and author are in [`astro-paper.config.ts`](./astro-paper.config.ts). The about page is [`src/content/pages/about.md`](./src/content/pages/about.md).

## Adding banners and 88x31 buttons

The footer shows banners and buttons from one data file: [`src/data/banners.ts`](./src/data/banners.ts). While both lists are empty, the footer just shows the heading and "(more coming soon)".

1. Put the GIF in `public/banners/` (wide banners, e.g. 468x60) or `public/buttons/` (88x31 buttons). Keep the file in the repo, don't hotlink.
2. Add one line to `banners` or `buttons` in `src/data/banners.ts`:

   ```ts
   export const banners: Banner[] = [
     { src: "/banners/my-banner.gif", alt: "what the banner says", href: "https://example.com" },
   ];

   export const buttons: Banner[] = [
     { src: "/buttons/cool-site.gif", alt: "cool site", href: "https://example.com" },
   ];
   ```

   `src` is the path inside `public/` (the `/jeff-jefferson` base is added automatically). `href` is optional; leave it out for a banner that isn't a link. Optional `width` / `height` (px) are available too.
3. Commit and push, and GitHub Pages redeploys.

## The goodies page (`/collect/`)

"take some of mine": a page of little things collected from around the web (88x31 buttons, blinkies, stamps, gifs & doodads), plus Jeff's own button for people to link back with. It's linked in the left nav as **goodies**.

- the page is [`src/pages/collect.astro`](./src/pages/collect.astro), the items come from [`src/data/goodies.ts`](./src/data/goodies.ts)
- images live in `public/goodies/<category>/` (`buttons`, `blinkies`, `stamps`, `gifs`), always local, never hotlinked
- empty categories say "(nothing here yet, coming soon)"
- Jeff's own button is `public/buttons/jeff-jefferson.gif` (88x31, 2 frames). The page shows it with a copy-paste html snippet.

### Adding goodies: `scripts/add-goodie.py`

```sh
python3 scripts/add-goodie.py <category> <image-url> [<image-url> ...] [--alt "text"] [--href URL] [--credit "who made it"] [--no-build]

# examples
python3 scripts/add-goodie.py buttons https://example.com/cool.gif --href https://example.com --credit "from example.com"
python3 scripts/add-goodie.py blinkies https://a.com/1.gif https://b.com/2.gif
```

(`scripts/add-goodie.sh` is a thin wrapper around the same thing.) Needs Python 3 and [Pillow](https://pillow.readthedocs.io) (`pip install pillow`). For every URL it:

1. downloads the image (max 10 MB, must really be an image)
2. rebuilds it from the raw pixels only, so **all metadata is removed**: exif/gps, icc profiles, xmp, png text chunks, gif comments and gif application extensions. Animated gifs keep every frame, the frame delays and the loop count (only the standard `NETSCAPE2.0` loop block is written). Animated webp/png keep their frames too
3. verifies the result: same number of frames, and no comment/xmp/exif/extra blocks left (it stops with an error if there are)
4. saves it to `public/goodies/<category>/` (name from the url, a short hash is added on a name clash) and adds a line (with width/height) to the right array in `src/data/goodies.ts`
5. runs `npm run build` (skip with `--no-build`)

`--alt`, `--href` and `--credit` apply to every url in that run, so add images one at a time when each needs its own text. Then commit and push and GitHub Pages redeploys.

Don't delete the `// add-goodie:<category>` comments in `goodies.ts`, the script uses them to know where to add lines.

## Posts

Posts live in `src/content/blog/`. Images for a post go in a folder of the same slug:

```
src/content/blog/my-weekend.md
src/content/blog/my-weekend/cover.webp
src/content/blog/my-weekend/photo.webp
```

In the markdown, reference images relatively:

```md
![A photo](./my-weekend/photo.webp)
```

### Frontmatter

Required:

- `title`: post title
- `pubDatetime`: publish date (`2026-11-14` or an ISO timestamp)
- `description`: short summary (used in listings, SEO, and RSS)

Optional:

- `tags`: list of tags (defaults to `others`)
- `ogImage`: cover / Open Graph image, e.g. `./my-weekend/cover.webp`
- `slug`: URL slug (defaults to the filename)
- `author`: defaults to Jeff Jefferson
- `featured`: show in the featured section on the home page
- `draft`: set `true` to keep a post off the site
- `modDatetime`: last updated date

RSS is at `/jeff-jefferson/rss.xml`.

## Publishing with `post.sh`

`./post.sh` takes a markdown file and any image files, optimizes the images, copies everything into `src/content/blog/`, builds the site to validate, then commits, pushes, and waits for the GitHub Pages deploy.

```sh
# Validate only (no commit or push)
./post.sh --dry-run ./drafts/my-weekend.md ./photos/cover.jpg ./photos/walk.png

# Publish
./post.sh ./drafts/my-weekend.md ./photos/cover.jpg ./photos/walk.png
```

Images are resized so the long side is at most 1600px, encoded as WebP (quality 82), and stripped of all EXIF metadata including GPS. References in the markdown (and `ogImage` if present) are rewritten to the new paths. If `ogImage` is omitted and you pass images, the first image is used as the cover.

A publish run needs `GITHUB_TOKEN` in the environment (classic token with `repo` and `workflow` scopes). It is passed to git through a credential helper, so it is never stored in the repo. The script prints the live post URL when Pages is ready.

## Local dev

```sh
npm install
npm run dev
npm run build
```

Requires Node 22.23.4 or newer.
