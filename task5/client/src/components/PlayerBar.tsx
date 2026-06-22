import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { useMidiPlayer } from '../hooks/useMidiPlayer'
import {PlayIcon, StopIcon, LoadingIcon, VolumeIcon, CancelIcon} from './icons'
import {API_BASE} from "../api.ts";


function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PlayerBar() {
    const activeSong = useStore(s => s.activeSong)
    const seed = useStore(s => s.seed)
    const setActiveSong = useStore(s => s.setActiveSong)

    const midiUrl = activeSong
        ? `${API_BASE}/api/music?seed=${seed}_${activeSong.index}&title=${encodeURIComponent(activeSong.title)}`
        : null

    const { play, stop, seekTo, setVolume, state } = useMidiPlayer(midiUrl)

    useEffect(() => {
        if (activeSong) play()
    }, [activeSong])

    if (!activeSong) return null

    const coverUrl = `${API_BASE}/api/cover?seed=${seed}_${activeSong.index}&title=${encodeURIComponent(activeSong.title)}&artist=${encodeURIComponent(activeSong.artist)}`

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 px-4 py-3 flex items-center gap-4">

            <div className="flex items-center gap-3 w-48 shrink-0">
                <img
                    src={coverUrl}
                    alt={activeSong.title}
                    className="w-10 h-10 rounded object-cover"
                />
                <div className="overflow-hidden">
                    <div className="text-white text-sm font-medium truncate">
                        {activeSong.title}
                    </div>
                    <div className="text-gray-400 text-xs truncate">
                        {activeSong.artist}
                    </div>
                </div>
            </div>

            <button
                onClick={() => state.isPlaying ? stop() : play()}
                disabled={state.isLoading}
                className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-colors"
            >
                {state.isLoading ? <LoadingIcon className="w-4 h-4"/>
                    : state.isPlaying ? <StopIcon className="w-4 h-4"/>
                        : <PlayIcon className="w-4 h-4"/>}
            </button>

            <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-gray-500 text-xs w-8 text-right shrink-0">
                  {formatTime(state.currentTime)}
                </span>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.001}
                            value={state.progress}
                            onChange={(e) => seekTo(parseFloat(e.target.value))}
                            className="flex-1 accent-purple-500 h-1 min-w-0"
                        />
                        <span className="text-gray-500 text-xs w-8 shrink-0">
                  {formatTime(state.duration)}
                </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <VolumeIcon className="h-4 w-4"/>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={state.volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-purple-500 h-1"
                />
            </div>

            <a
                href={midiUrl ?? '#'}
                download={`${activeSong.title} - ${activeSong.artist}.mid`}
                className="shrink-0 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                Download
            </a>

            <button
                onClick={() => {
                    stop()
                    setActiveSong(null)
                }}
                className="shrink-0 text-gray-500 hover:text-white text-lg transition-colors"
            >
                <CancelIcon className="w-4 h-4" />
            </button>

        </div>
    )
}