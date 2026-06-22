import type { Song } from '../types'
import { useStore } from '../store/useStore'
import {API_BASE} from "../api.ts";

interface Props {
    song: Song
}

export default function ExpandedRow({ song }: Props) {
    const coverUrl = `${API_BASE}/api/cover?seed=${song.index}&title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`
    const setActiveSong = useStore(s => s.setActiveSong)

    return (
        <div className="bg-gray-900 px-6 py-4 flex gap-6">
            <img
                src={coverUrl}
                alt={`${song.title} cover`}
                className="w-36 h-36 rounded-lg object-cover shrink-0 shadow-lg"
            />

            <div className="flex flex-col gap-2">
                <div className="text-lg font-semibold text-white">{song.title}</div>
                <div className="text-sm text-gray-400">{song.artist} — {song.album}</div>
                <div className="text-sm text-purple-400">{song.genre}</div>

                <button
                    onClick={() => setActiveSong(song)}
                    className="mt-2 w-fit bg-purple-700 hover:bg-purple-600 text-white text-sm px-4 py-1.5 rounded-full transition-colors"
                >
                     Play Preview
                </button>

                <p className="text-sm text-gray-400 italic mt-2 max-w-xl">"{song.review}"</p>
            </div>
        </div>
    )
}