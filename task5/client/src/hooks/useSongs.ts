import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type {Song, SongsParams} from '../types'

const PAGE_SIZE = 20

async function fetchSongs(params: SongsParams): Promise<Song[]> {
    const { data } = await axios.get('/api/songs', {
        params: {
            seed: params.seed,
            page: params.page,
            lang: params.lang,
            likes: params.likes,
            pageSize: PAGE_SIZE,
        },
    })
    return data.songs
}

export function useSongs(params: SongsParams) {
    return useQuery({
        queryKey: ['songs', params],
        queryFn: () => fetchSongs(params),
        staleTime: Infinity,
    })
}

export { PAGE_SIZE }