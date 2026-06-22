import { Faker, en, de, base } from '@faker-js/faker'
import { getFaker } from './localeLoader'
import seedrandom from 'seedrandom'

function makePageSeed(userSeed: string, page: number): string {
    const s = BigInt(userSeed) || 0n
    return String(s * BigInt(page) + BigInt(page))
}


export interface Song {
    index: number
    title: string
    artist: string
    album: string
    genre: string
    likes: number
    review: string
}

function generateTitle(f: Faker, rng: seedrandom.PRNG): string {
    const wordCount = 1 + Math.floor(rng() * 5)
    const words: string[] = []
    for (let i = 0; i < wordCount; i++) {
        words.push(f.word.words(1))
    }
    const result = words.join(' ')
    return result.charAt(0).toUpperCase() + result.slice(1)
}

function generateArtist(f: Faker, rng: seedrandom.PRNG): string {
    const roll = rng()
    if (roll < 0.33) {
        return f.person.fullName()
    } else if (roll < 0.66) {
        return f.person.firstName() + ' ' + f.person.lastName()
    } else {
        const wordCount = 2 + Math.floor(rng() * 2)
        const words: string[] = []
        for (let i = 0; i < wordCount; i++) {
            const w = f.word.words(1)
            words.push(w.charAt(0).toUpperCase() + w.slice(1))
        }
        return words.join(' ')
    }
}

function generateAlbum(f: Faker, rng: seedrandom.PRNG): string {
    if (rng() < 0.3) return 'Single'
    const wordCount = 1 + Math.floor(rng() * 4)
    const words: string[] = []
    for (let i = 0; i < wordCount; i++) {
        words.push(f.word.words(1))
    }
    const result = words.join(' ')
    return result.charAt(0).toUpperCase() + result.slice(1)
}

function generateGenre(f: Faker, rng: seedrandom.PRNG): string {
    const roll = rng()
    if (roll < 0.5) {
        const w = f.word.words(1)
        return w.charAt(0).toUpperCase() + w.slice(1)
    } else {
        const w1 = f.word.words(1)
        const w2 = f.word.words(1)
        return (w1.charAt(0).toUpperCase() + w1.slice(1)) + ' ' +
            (w2.charAt(0).toUpperCase() + w2.slice(1))
    }
}

function applyLikes(avg: number, rng: seedrandom.PRNG): number {
    const base = Math.floor(avg)
    const fraction = avg % 1
    return base + (rng() < fraction ? 1 : 0)
}

export function generateSongs(
    userSeed: string,
    page: number,
    pageSize: number,
    lang: string,
    likesAvg: number
): Song[] {
    const f = getFaker(lang)
    const pageSeed = makePageSeed(userSeed, page)
    const songs: Song[] = []

    for (let i = 0; i < pageSize; i++) {
        const globalIndex = (page - 1) * pageSize + i + 1

        const songRng = seedrandom(`${pageSeed}_song_${i}`)

        const likesRng = seedrandom(`likes_${userSeed}_${globalIndex}`)

        const reviewRng = seedrandom(`review_${pageSeed}_${i}`)

        f.seed(Math.floor(songRng() * 2 ** 31))

        const title = generateTitle(f, songRng)
        const artist = generateArtist(f, songRng)
        const album = generateAlbum(f, songRng)
        const genre = generateGenre(f, songRng)

        f.seed(Math.floor(reviewRng() * 2 ** 31))
        const wordCount = 20 + Math.floor(reviewRng() * 30)
        const words: string[] = []
        for (let w = 0; w < wordCount; w++) {
            words.push(f.word.words(1))
        }
        const review = words.join(' ')

        const likes = applyLikes(likesAvg, likesRng)

        songs.push({
            index: globalIndex,
            title,
            artist,
            album,
            genre,
            likes,
            review,
        })
    }

    return songs
}