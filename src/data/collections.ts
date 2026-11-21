/**
 * "stuff i like" lists. Names only, taken from things already on the site.
 * Add a line to a group (or a new group) when you want something else here.
 * Leave `href` and `note` off unless there's a real link or a real note.
 */
export type CollectionItem = {
  name: string;
  href?: string;
  note?: string;
};

export type Collection = {
  key: string;
  title: string;
  items: CollectionItem[];
};

export const collections: Collection[] = [
  {
    key: "shows",
    title: "shows",
    items: [
      { name: "Community" },
      { name: "Steven Universe" },
      { name: "Gravity Falls" },
      { name: "The Good Place" },
    ],
  },
  {
    key: "games",
    title: "games",
    items: [
      { name: "Gunfire Reborn" },
      { name: "League of Legends" },
      { name: "Club Penguin: Elite Penguin Force" },
      { name: "Club Penguin: Elite Penguin Force: Herbert's Revenge" },
      { name: "Skylanders: Spyro's Adventure" },
      { name: "Skylanders: Giants" },
      { name: "Skylanders: Swap Force" },
      { name: "Skylanders: Trap Team" },
      { name: "Minecraft" },
      { name: "Clash Royale" },
      { name: "Terraria" },
      { name: "Rocket League" },
      { name: "Descenders" },
      { name: "Slay the Spire" },
    ],
  },
  {
    key: "music",
    title: "music",
    items: [
      { name: "Twenty One Pilots" },
      { name: "Yung Gravy" },
      { name: "Penelope Scott" },
      { name: "Bring Me The Horizon" },
      { name: "bbno$" },
      { name: "Ashnikko" },
      { name: "the Steven Universe soundtrack" },
      { name: "Billie Eilish" },
      { name: "Childish Gambino" },
      { name: "Tyler, the Creator" },
      { name: "Melanie Martinez" },
    ],
  },
  {
    key: "card-games",
    title: "card games",
    items: [
      { name: "the Plants vs. Zombies card game by Kayou" },
      { name: "Club Penguin Card-Jitsu" },
      { name: "the Pokémon TCG" },
      { name: "Riftbound" },
    ],
  },
];
