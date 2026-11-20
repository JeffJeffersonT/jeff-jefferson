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
