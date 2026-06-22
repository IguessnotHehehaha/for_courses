import { useEffect } from 'react'
import type { Song } from '../types'
import { useStore } from '../store/useStore'
import {API_BASE} from "../api.ts";


interface Props {
    song: Song
    onClose: () => void
}

export default function SongModal({ song, onClose }: Props) {
    const seed = useStore(state => state.seed)
    const coverUrl = `${API_BASE}/api/cover?seed=${seed}_${song.index}&title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`
    const setActiveSong = useStore(s => s.setActiveSong)

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <img
                        src={coverUrl}
                        alt={song.title}
                        className="w-full aspect-square object-cover"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                    >
                        X
                    </button>
                    <button
                        onClick={() => setActiveSong(song)}
                        className="mt-2 w-fit bg-purple-700 hover:bg-purple-600 text-white text-sm px-8 py-1.5 rounded-full transition-colors"
                    >
                        Play Preview
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-2">
                    <div className="text-xl font-bold text-white">{song.title}</div>
                    <div className="text-sm text-gray-400">{song.artist}</div>
                    <div className="text-sm text-gray-500">{song.album}</div>

                    <div className="flex items-center justify-between mt-1">
                        <span className="text-purple-400 text-sm">{song.genre}</span>
                        <span className="text-gray-500 text-sm">♥ {song.likes}</span>
                    </div>

                    <p className="text-sm text-gray-400 italic mt-3 border-t border-gray-800 pt-3">
                        "{song.review}"
                    </p>
                </div>
            </div>
        </div>
    )
}