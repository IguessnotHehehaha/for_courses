import { useEffect, useState } from 'react'
import axios from 'axios'
import { useStore } from '../store/useStore'
import {API_BASE} from "../api.ts";

interface Locale {
    value: string
    label: string
}

export default function Toolbar() {
    const [locales, setLocales] = useState<Locale[]>([])
    const {
        lang, seed, likes, viewMode,
        setLang, setSeed, setLikes,
        setViewMode, randomizeSeed,
    } = useStore()

    useEffect(() => {
        axios.get(`${API_BASE}/api/locales`).then(res => setLocales(res.data))
    }, [])

    return (
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex flex-wrap items-center gap-4">

            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Language</label>
                <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                >
                    {locales.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Seed</label>
                <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white w-36"
                />
                <button
                    onClick={randomizeSeed}
                    className="bg-gray-700 hover:bg-gray-600 text-sm px-2 py-1 rounded transition-colors"
                >
                    Random
                </button>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Likes: {likes.toFixed(1)}</label>
                <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={likes}
                    onChange={(e) => setLikes(parseFloat(e.target.value))}
                    className="w-28 accent-purple-500"
                />
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-1 bg-gray-800 rounded p-1">
                <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === 'table'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Table
                </button>
                <button
                    onClick={() => setViewMode('gallery')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                        viewMode === 'gallery'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Gallery
                </button>
            </div>

        </div>
    )
}