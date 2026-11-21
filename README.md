# jeff jefferson

jeff's corner of the internet. live at [https://jeffersons.space/](https://jeffersons.space/).

built with [Astro](https://astro.build). static site, hosted on GitHub Pages.

## useful files

- site title and description: `astro-paper.config.ts` (url and repo name are in `site.constants.ts`)
- posts: `src/content/blog/<slug>.md`, images next to the post
- about page: `src/content/pages/about.md`
- favourites on the about page: `src/data/favourites.ts`, covers in `public/favourites/`
- goodies page (`/goodies/`): `src/data/banners.ts`, files in `public/buttons/`, `public/blinkies/`, `public/stamps/`, `public/gifs/`
- cool sites: `src/data/links.ts`
- updates.txt box: `src/data/updates.ts`

## adding a post

use `./post.sh draft.md images...` (or `--dry-run` first). it strips metadata from photos, builds, commits and pushes. don't publish without an ok.

## adding a goodie or button

```sh
python3 scripts/add-goodie.py <buttons|blinkies|stamps|gifs> <image-url>
```

that downloads the image, strips all metadata (keeps gif animation), and appends it to `src/data/banners.ts`. `scripts/add-snippet.py` does the same thing.

always strip metadata from photos and anything that goes on the site.

## adding new kinds of pages

the site is set up so you can fill things in later without inventing a new layout each time.

- **site map** (`/map/`): every public page is listed in `src/data/site-pages.ts`. set `inNav: true` to show it in the left-hand menu. the site map page reads the same file, so add a page once and both stay in sync.
- **stuff i like** (`/likes/`): edit `src/data/collections.ts`. add a name to an existing group, or add a new group. leave notes and links off unless you have something real to say.
- **shrines** (`/shrines/`): edit `src/data/shrines.ts`. each entry needs a `slug`, a `title`, and a `status` (`open` or `coming-soon`). images can go in `public/shrines/<slug>/`. the index and the individual shrine page are generated from that file. if the list is empty, the index just says it's not ready yet.
- **scrapbook** (`/scrapbook/`): photos live in `src/data/gallery.ts` and `public/scrapbook/`. run

```sh
python3 scripts/add-photo.py path/to/photo.jpg --alt "what's in the photo"
```

that strips all metadata (and keeps gif animation) before saving. you can also pass a url.

- **windows / boxes**: reuse `src/components/WinBox.astro` for the little window chrome (title bar, body). it uses the existing `.win` styles in `src/styles/global.css`, so new pages can look like the rest of the site without copying markup.
