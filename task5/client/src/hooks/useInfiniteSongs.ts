import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { Song, SongsParams } from '../types'

const PAGE_SIZE = 20

async function fetchSongsPage(params: Omit<SongsParams, 'page'> & { page: number }): Promise<{ songs: Song[], page: number }> {
    const { data } = await axios.get('/api/songs', {
        params: {
            seed: params.seed,
            page: params.page,
            lang: params.lang,
            likes: params.likes,
            pageSize: PAGE_SIZE,
        },
    })
    return data
}

export function useInfiniteSongs(params: Omit<SongsParams, 'page'>) {
    return useInfiniteQuery({
        queryKey: ['songs-infinite', params],
        queryFn: ({ pageParam }) => fetchSongsPage({ ...params, page: pageParam as number }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.page + 1,
        staleTime: Infinity,
    })
}