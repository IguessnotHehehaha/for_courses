import { create } from 'zustand'
import type {ViewMode} from '../types'
import type {Song} from '../types'

interface StoreState {
    lang: string
    seed: string
    likes: number
    viewMode: ViewMode
    activeSong: Song | null
    setLang: (lang: string) => void
    setSeed: (seed: string) => void
    setLikes: (likes: number) => void
    setViewMode: (mode: ViewMode) => void
    randomizeSeed: () => void
    setActiveSong: (song: Song | null) => void
}

export const useStore = create<StoreState>((set) => ({
    lang: 'en',
    seed: '12345',
    likes: 3,
    viewMode: 'table',
    activeSong: null,
    setLang: (lang) => set({ lang }),
    setSeed: (seed) => set({ seed }),
    setLikes: (likes) => set({ likes }),
    setViewMode: (mode) => set({ viewMode: mode }),
    randomizeSeed: () => set({ seed: Math.floor(Math.random() * 1e12).toString() }),
    setActiveSong: (song) => set({ activeSong: song }),
}))