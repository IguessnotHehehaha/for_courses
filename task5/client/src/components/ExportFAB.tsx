import { useState, useRef } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { Song } from '../types'
import { renderMidiToBlob } from '../utils/renderMidi'
import { LoadingIcon, DownloadIcon } from './icons'


interface Props {
    songs: Song[]
}

export default function ExportFAB({ songs }: Props) {
    const [isExporting, setIsExporting] = useState(false)
    const [progress, setProgress] = useState(0)
    const abortRef = useRef<boolean>(false)

    const handleCancel = () => {
        abortRef.current = true
    }

    const handleExport = async () => {
        if (isExporting || songs.length === 0) return
        abortRef.current = false
        setIsExporting(true)
        setProgress(0)

        const zip = new JSZip()

        for (let i = 0; i < songs.length; i++) {
            if (abortRef.current) break

            const song = songs[i]
            const midiUrl = `/api/music?seed=${song.index}&title=${encodeURIComponent(song.title)}`
            const blob = await renderMidiToBlob(midiUrl)

            if (abortRef.current) break

            const filename = `${song.title} - ${song.artist} (${song.album}).wav`
            zip.file(filename, blob)
            setProgress(i + 1)
        }

        if (!abortRef.current) {
            const content = await zip.generateAsync({ type: 'blob' })
            saveAs(content, 'songs.zip')
        }

        setIsExporting(false)
        setProgress(0)
        abortRef.current = false
    }

    return (
        <div className="fixed bottom-24 left-4 z-40">
            {isExporting ? (
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full shadow-lg px-4 py-2">
          <span className="text-white text-sm">
             <LoadingIcon className="w-4 h-4"/> {progress}/{songs.length}
          </span>
                    <button
                        onClick={handleCancel}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors ml-1"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleExport}
                    disabled={songs.length === 0}
                    className="group flex items-center gap-2 bg-gray-900 border border-gray-700 hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full shadow-lg transition-all duration-200 overflow-hidden"
                >
                    <div className="p-2">
                        <DownloadIcon className="w-4 h-4" />
                    </div>

                </button>
            )}
        </div>
    )
}