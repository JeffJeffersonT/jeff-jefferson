/**
 * "stuff i like" lists. Each item should have a picture.
 * Music reuses the album covers in public/favourites/. New covers
 * (shows/games already have those too, plus card games and a few extras)
 * live in public/likes/ as small webp files with the metadata stripped.
 */
export type CollectionItem = {
  name: string;
  href?: string;
  note?: string;
  src?: string;
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
      { name: "Community", src: "/favourites/community.webp" },
      { name: "Steven Universe", src: "/favourites/steven-universe.webp" },
      { name: "Gravity Falls", src: "/favourites/gravity-falls.webp" },
      { name: "The Good Place", src: "/favourites/the-good-place.webp" },
    ],
  },
  {
    key: "games",
    title: "games",
    items: [
      { name: "Gunfire Reborn", src: "/favourites/gunfire-reborn.webp" },
      { name: "League of Legends", src: "/favourites/league-of-legends.webp" },
      { name: "Club Penguin: Elite Penguin Force", src: "/favourites/club-penguin-epf.webp" },
      { name: "Club Penguin: Elite Penguin Force: Herbert's Revenge", src: "/favourites/club-penguin-herberts-revenge.webp" },
      { name: "Skylanders: Spyro's Adventure", src: "/favourites/skylanders-spyros-adventure.webp" },
      { name: "Skylanders: Giants", src: "/favourites/skylanders-giants.webp" },
      { name: "Skylanders: Swap Force", src: "/favourites/skylanders-swap-force.webp" },
      { name: "Skylanders: Trap Team", src: "/favourites/skylanders-trap-team.webp" },
      { name: "Minecraft", src: "/favourites/minecraft.webp" },
      { name: "Clash Royale", src: "/favourites/clash-royale.webp" },
      { name: "Terraria", src: "/favourites/terraria.webp" },
      { name: "Rocket League", src: "/favourites/rocket-league.webp" },
      { name: "Descenders", src: "/favourites/descenders.webp" },
      { name: "Slay the Spire", src: "/likes/slay-the-spire.webp" },
    ],
  },
  {
    key: "music",
    title: "music",
    items: [
      { name: "Twenty One Pilots", note: "Twenty One Pilots", src: "/favourites/twenty-one-pilots.webp" },
      { name: "Regional at Best", note: "Twenty One Pilots", src: "/favourites/regional-at-best.webp" },
      { name: "Vessel", note: "Twenty One Pilots", src: "/favourites/vessel.webp" },
      { name: "Trench", note: "Twenty One Pilots", src: "/favourites/trench.webp" },
      { name: "Breach", note: "Twenty One Pilots", src: "/favourites/breach.webp" },
      { name: "Baby Gravy 2", note: "Yung Gravy & bbno$", src: "/favourites/baby-gravy-2.webp" },
      { name: "Baby Gravy 3", note: "Yung Gravy & bbno$", src: "/favourites/baby-gravy-3.webp" },
      { name: "Marvelous", note: "Yung Gravy", src: "/favourites/marvelous.webp" },
      { name: "Sensational", note: "Yung Gravy", src: "/favourites/sensational.webp" },
      { name: "Serving Country", note: "Yung Gravy", src: "/favourites/serving-country.webp" },
      { name: "Water Dogs", note: "Penelope Scott", src: "/favourites/water-dogs.webp" },
      { name: "Fear of God", note: "Penelope Scott", src: "/favourites/fear-of-god.webp" },
      { name: "The Junkyard 2", note: "Penelope Scott", src: "/favourites/the-junkyard-2.webp" },
      { name: "Public Void", note: "Penelope Scott", src: "/favourites/public-void.webp" },
      { name: "Ashnikko", src: "/likes/ashnikko.webp" },
      { name: "the Steven Universe soundtrack", src: "/likes/steven-universe-soundtrack.webp" },
      { name: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?", note: "Billie Eilish", src: "/favourites/when-we-all-fall-asleep.webp" },
      { name: "dont smile at me", note: "Billie Eilish", src: "/favourites/dont-smile-at-me.webp" },
      { name: "Camp (deluxe)", note: "Childish Gambino", src: "/favourites/camp.webp" },
      { name: "Cherry Bomb", note: "Tyler, the Creator", src: "/favourites/cherry-bomb.webp" },
      { name: "Cry Baby (deluxe)", note: "Melanie Martinez", src: "/favourites/cry-baby.webp" },
      { name: "amo", note: "Bring Me The Horizon", src: "/favourites/amo.webp" },
      { name: "That's the Spirit", note: "Bring Me The Horizon", src: "/favourites/thats-the-spirit.webp" },
      { name: "POST HUMAN: SURVIVAL HORROR", note: "Bring Me The Horizon", src: "/favourites/post-human-survival-horror.webp" },
    ],
  },
  {
    key: "card-games",
    title: "card games",
    items: [
      { name: "the Plants vs. Zombies card game by Kayou", src: "/likes/kayou-pvz.webp" },
      { name: "Club Penguin Card-Jitsu", src: "/likes/card-jitsu.webp" },
      { name: "the Pokémon TCG", src: "/likes/pokemon-tcg.webp" },
      { name: "Riftbound", src: "/likes/riftbound.webp" },
    ],
  },
];
