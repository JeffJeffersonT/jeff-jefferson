/**
 * Photos on the scrapbook page.
 * Easiest way to add one: run
 *   python3 scripts/add-photo.py <image-or-url> --alt "what's in the photo"
 * That strips all metadata, saves it to public/scrapbook/, and adds a line here.
 *
 * By hand: drop a stripped file in public/scrapbook/ and add a line
 * above the marker. Leave caption off if you don't have one.
 */
export type Photo = {
  src: string;
  alt: string;
  caption?: string;
};

export const photos: Photo[] = [
  // add-photo
];
