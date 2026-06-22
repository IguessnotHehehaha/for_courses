import type {Song} from '../types'
import { PlayIcon } from './icons'

interface Props {
    song: Song,
    onClick?: () => void
}

export default function SongCard({song, onClick}: Props) {
    const coverUrl = `/api/cover?seed=${song.index}&title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`

    return (
        <div
            onClick={onClick}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-700 transition-colors cursor-pointer group">
            <div className="w-full aspect-square relative overflow-hidden">
                <img
                    src={coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                        <PlayIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="p-3 flex flex-col gap-1">
                <div className="text-white font-medium text-sm truncate">{song.title}</div>
                <div className="text-gray-400 text-xs truncate">{song.artist}</div>
                <div className="text-gray-500 text-xs truncate">{song.album}</div>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-purple-400 text-xs">{song.genre}</span>
                    <span className="text-gray-500 text-xs">♥ {song.likes}</span>
                </div>
            </div>
        </div>

    )
}