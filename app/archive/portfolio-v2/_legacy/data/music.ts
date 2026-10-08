export type FavoriteSong = {
  artist: string;
  artwork: string;
  highlightStart: number;
  title: string;
  youtubeId: string;
};

export const favoriteSongs: readonly FavoriteSong[] = [
  {
    artist: "Gestalt Girl",
    artwork: "/albums/kamisama.jpg",
    highlightStart: 180,
    title: "Kamisama",
    youtubeId: "jjw1j1H1EYQ",
  },
  {
    artist: "The Poles",
    artwork: "/albums/tp.jpg",
    highlightStart: 72,
    title: "So, Again",
    youtubeId: "JJCznTuDyhU",
  },
  {
    artist: "Jeon Jin Hee",
    artwork: "/albums/wak.jpg",
    highlightStart: 47,
    title: "A Trivial Story",
    youtubeId: "IkoYaTgAY8U",
  },
  {
    artist: "The Weeknd",
    artwork: "/albums/mdm.jpg",
    highlightStart: 0,
    title: "Try Me",
    youtubeId: "a4x7p76ix8M",
  },
];
