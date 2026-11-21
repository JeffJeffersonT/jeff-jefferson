/**
 * "my stuff" / creations. Each section is a real interest from the about
 * page. Lists start empty on purpose. Add a line (and a picture in
 * public/stuff/<section>/) when there's something real to show.
 *
 *   python3 scripts/add-creation.py photography path/to.jpg --title "a title" --alt "what's in the picture"
 *
 * That strips metadata (and keeps gif animation) before saving.
 */
export type Creation = {
  title: string;
  src?: string;
  alt?: string;
  caption?: string;
  href?: string;
  note?: string;
};

export type CreationSection = {
  key: string;
  title: string;
  blurb: string;
  items: Creation[];
};

export const creationSections: CreationSection[] = [
  {
    key: "photography",
    title: "photography",
    blurb: "photos i've taken, when i have a set to put up.",
    items: [
      // add-creation:photography
    ],
  },
  {
    key: "videography",
    title: "videography",
    blurb: "videos i've made, when i have some to share.",
    items: [
      // add-creation:videography
    ],
  },
  {
    key: "graphic-design",
    title: "graphic design",
    blurb: "graphic design work, when i have a piece ready.",
    items: [
      // add-creation:graphic-design
    ],
  },
  {
    key: "art",
    title: "art",
    blurb: "drawings and other art, when i have some to show.",
    items: [
      // add-creation:art
    ],
  },
  {
    key: "voice-work",
    title: "voice work",
    blurb: "voice clips i've recorded, when i have some to put up.",
    items: [
      // add-creation:voice-work
    ],
  },
  {
    key: "game-dev",
    title: "game dev",
    blurb: "games i'm making, when i have something to show.",
    items: [
      // add-creation:game-dev
    ],
  },
];

export const creationByKey = (key: string) =>
  creationSections.find(s => s.key === key);
