import { create } from 'zustand';

interface ContentStore {
  content: Record<string, string>;
  isReady: boolean;
  setContent: (content: Record<string, string>) => void;
  setReady: (ready: boolean) => void;
}

export const useContentStore = create<ContentStore>((set) => ({
  content: {},
  isReady: false,
  setContent: (content) => set({ content }),
  setReady: (ready) => set({ isReady: ready }),
}));