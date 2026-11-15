/**
 * Favourites on the about page. Add a line and drop a cover in
 * public/favourites/ (small webp, metadata stripped). Leave `src`
 * off to show a plain text tile instead.
 */
export type Favourite = {
  title: string;
  artist?: string;
  note?: string;
  src?: string;
};

export const shows: Favourite[] = [
  { title: "Community", note: "my favourite of all time. i've seen it eighteen times", src: "/favourites/community.webp" },
  { title: "Steven Universe", src: "/favourites/steven-universe.webp" },
  { title: "Gravity Falls", src: "/favourites/gravity-falls.webp" },
  { title: "The Good Place", src: "/favourites/the-good-place.webp" },
];

export const games: Favourite[] = [
  { title: "Gunfire Reborn", src: "/favourites/gunfire-reborn.webp" },
  { title: "League of Legends", src: "/favourites/league-of-legends.webp" },
  { title: "Club Penguin: Elite Penguin Force", src: "/favourites/club-penguin-epf.webp" },
  { title: "Club Penguin: Elite Penguin Force: Herbert's Revenge" },
  { title: "Skylanders: Spyro's Adventure", src: "/favourites/skylanders-spyros-adventure.webp" },
  { title: "Skylanders: Giants", src: "/favourites/skylanders-giants.webp" },
  { title: "Skylanders: Swap Force", src: "/favourites/skylanders-swap-force.webp" },
  { title: "Skylanders: Trap Team", src: "/favourites/skylanders-trap-team.webp" },
  { title: "Minecraft", src: "/favourites/minecraft.webp" },
  { title: "Clash Royale", src: "/favourites/clash-royale.webp" },
  { title: "Terraria", src: "/favourites/terraria.webp" },
  { title: "Rocket League", src: "/favourites/rocket-league.webp" },
  { title: "Descenders", src: "/favourites/descenders.webp" },
];

export const albums: Favourite[] = [
  { title: "Twenty One Pilots", artist: "Twenty One Pilots", src: "/favourites/twenty-one-pilots.webp" },
  { title: "Regional at Best", artist: "Twenty One Pilots", src: "/favourites/regional-at-best.webp" },
  { title: "Vessel", artist: "Twenty One Pilots", src: "/favourites/vessel.webp" },
  { title: "Trench", artist: "Twenty One Pilots", src: "/favourites/trench.webp" },
  { title: "Breach", artist: "Twenty One Pilots", src: "/favourites/breach.webp" },
  { title: "Baby Gravy 2", artist: "Yung Gravy & bbno$", src: "/favourites/baby-gravy-2.webp" },
  { title: "Baby Gravy 3", artist: "Yung Gravy & bbno$", src: "/favourites/baby-gravy-3.webp" },
  { title: "Marvelous", artist: "Yung Gravy", src: "/favourites/marvelous.webp" },
  { title: "Sensational", artist: "Yung Gravy", src: "/favourites/sensational.webp" },
  { title: "Serving Country", artist: "Yung Gravy", src: "/favourites/serving-country.webp" },
  { title: "Water Dogs", artist: "Penelope Scott", src: "/favourites/water-dogs.webp" },
  { title: "Fear of God", artist: "Penelope Scott", src: "/favourites/fear-of-god.webp" },
  { title: "The Junkyard 2", artist: "Penelope Scott", src: "/favourites/the-junkyard-2.webp" },
  { title: "Public Void", artist: "Penelope Scott", src: "/favourites/public-void.webp" },
  { title: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?", artist: "Billie Eilish", src: "/favourites/when-we-all-fall-asleep.webp" },
  { title: "dont smile at me", artist: "Billie Eilish", src: "/favourites/dont-smile-at-me.webp" },
  { title: "Camp (deluxe)", artist: "Childish Gambino", src: "/favourites/camp.webp" },
  { title: "Cherry Bomb", artist: "Tyler, the Creator", src: "/favourites/cherry-bomb.webp" },
  { title: "Cry Baby (deluxe)", artist: "Melanie Martinez", src: "/favourites/cry-baby.webp" },
  { title: "amo", artist: "Bring Me The Horizon", src: "/favourites/amo.webp" },
  { title: "That's the Spirit", artist: "Bring Me The Horizon", src: "/favourites/thats-the-spirit.webp" },
  { title: "POST HUMAN: SURVIVAL HORROR", artist: "Bring Me The Horizon", src: "/favourites/post-human-survival-horror.webp" },
];
