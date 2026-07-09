import { create } from 'zustand';

interface InfoState {
  currentSongId: number | null;
  isOpen: boolean;
  open: (songId: number) => void;
  close: () => void;
}

export const useInfoStore = create<InfoState>((set) => ({
  currentSongId: null,
  isOpen: false,
  open: (songId) => set({ currentSongId: songId, isOpen: true }),
  close: () => set({ currentSongId: null, isOpen: false }),
}));
