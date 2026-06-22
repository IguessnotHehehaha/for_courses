import { useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useStore } from '../store/useStore'
import { useInfiniteSongs } from '../hooks/useInfiniteSongs'
import SongCard from './SongCard'
import SongModal from './SongModal'
import type { Song } from '../types'
import ExportFAB from "./ExportFAB.tsx";

export default function GalleryView() {
    const { lang, seed, likes } = useStore()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [selectedSong, setSelectedSong] = useState<Song | null>(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isError,
    } = useInfiniteSongs({ lang, seed, likes })

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0
        }
    }, [lang, seed, likes])

    const allSongs: Song[] = data?.pages.flatMap((p) => p.songs) ?? []

    if (isLoading) {
        return (
            <div className="flex items-center justify-center mt-20">
                <div className="text-gray-400 animate-pulse">Loading songs...</div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center mt-20">
                <div className="text-red-400">Failed to load songs. Is the server running?</div>
            </div>
        )
    }

    return (
        <div
            id="gallery-scroll"
            ref={scrollRef}
            className="h-[calc(100vh-64px)] overflow-y-auto"
        >

            <InfiniteScroll
                dataLength={allSongs.length}
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={
                    <div className="text-center text-gray-500 py-6 animate-pulse">
                        Loading more songs...
                    </div>
                }
                scrollableTarget="gallery-scroll"
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                {allSongs.map((song) => (
                    <SongCard
                        key={song.index}
                        song={song}
                        onClick={() => setSelectedSong(song)}
                    />
                    ))}
                </div>
            </InfiniteScroll>
            <ExportFAB songs = {allSongs} />
            {selectedSong && (
                <SongModal
                    song={selectedSong}
                    onClose={() => setSelectedSong(null)}
                />
            )}
        </div>
    )
}