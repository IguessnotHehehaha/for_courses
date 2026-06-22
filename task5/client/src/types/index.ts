export interface Song {
    index: number
    title: string
    artist: string
    album: string
    genre: string
    likes: number
    review: string
}

export interface SongsParams {
    lang: string
    seed: string
    likes: number
    page: number
}

export type ViewMode = 'table' | 'gallery'