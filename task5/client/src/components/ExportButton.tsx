import { useState, useRef } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { Song } from '../types'
import { renderMidiToBlob } from '../utils/renderMidi'


interface Props {
    songs: Song[]
}

export default function ExportButton({ songs }: Props) {
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
        <div className="flex items-center gap-2">
            <button
                onClick={isExporting ? handleCancel : handleExport}
                disabled={!isExporting && songs.length === 0}
                className={`text-sm px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isExporting
                        ? 'bg-red-900 hover:bg-red-800 text-red-300'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
            >
                {isExporting
                    ? `Cancel (${progress}/${songs.length})`
                    : 'Export ZIP'}
            </button>
        </div>
    )
}