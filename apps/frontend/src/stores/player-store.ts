import { create } from 'zustand';

interface SongSource {
  youtubeId: string | null;
  youtubeLink: string | null;
  spotifyId: string | null;
  spotifyLink: string | null;
  appleMId: string | null;
  appleMLink: string | null;
}

interface Song {
  id: number;
  title: string;
  author: string;
  season: number;
  isOpening: boolean;
  isEnding: boolean;
  youtubeId: string | null;
  youtubeLink: string | null;
  spotifyId: string | null;
  spotifyLink: string | null;
  appleMId: string | null;
  appleMLink: string | null;
}

interface PlayerState {
  songs: Song[];
  currentIndex: number;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  volume: number;
  muted: boolean;
  setSongs: (songs: Song[]) => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLooping: (looping: boolean) => void;
  setIsShuffling: (shuffling: boolean) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  playNext: () => void;
  playPrev: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  songs: [],
  currentIndex: 0,
  isPlaying: false,
  isLooping: false,
  isShuffling: false,
  volume: 0.5,
  muted: false,
  setSongs: (songs) => set({ songs, currentIndex: 0 }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsLooping: (isLooping) => set({ isLooping }),
  setIsShuffling: (isShuffling) => set({ isShuffling }),
  setVolume: (volume) => set({ volume }),
  setMuted: (muted) => set({ muted }),
  playNext: () => {
    const { songs, currentIndex, isShuffling } = get();
    let next: number;
    if (isShuffling) {
      next = Math.floor(Math.random() * songs.length);
      if (next === currentIndex && songs.length > 1) {
        next = (next + 1) % songs.length;
      }
    } else {
      next = (currentIndex + 1) % songs.length;
    }
    set({ currentIndex: next, isPlaying: true });
  },
  playPrev: () => {
    const { songs, currentIndex } = get();
    const prev = (currentIndex - 1 + songs.length) % songs.length;
    set({ currentIndex: prev, isPlaying: true });
  },
}));
