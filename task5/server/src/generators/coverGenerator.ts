import path from 'path'
import fs from 'fs/promises'
import seedrandom from 'seedrandom'
import {
    createCanvas,
    loadImage,
    SKRSContext2D
} from '@napi-rs/canvas'

const PALETTES: [number, number][] = [
    [220, 260],
    [340, 20],
    [180, 210],
    [35, 10],
    [270, 320]
]

const ICONS = [
    'microphone.svg',
    'headphones.svg',
    'vinyl.svg',
    'notes.svg',
    'album.svg'
]

function hsl(h: number, s: number, l: number) {
    return `hsl(${h}, ${s}%, ${l}%)`
}

function drawBackground(
    ctx: SKRSContext2D,
    size: number,
    h1: number,
    h2: number
) {
    const gradient = ctx.createLinearGradient(0,0, size, size)

    gradient.addColorStop(0, hsl(h1, 70, 18))

    gradient.addColorStop(1, hsl(h2, 60, 8))

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
}

function drawSpotlight(ctx: SKRSContext2D, size: number, hue: number) {
    const glow = ctx.createRadialGradient(size / 2, size * 0.32, 0, size / 2, size * 0.32, size * 0.55)

    glow.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.35)`)

    glow.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.fillStyle = glow
    ctx.fillRect(0, 0, size, size)
}

async function drawHeroIcon(ctx: SKRSContext2D, size: number, iconName: string, hue: number) {
    const iconPath = path.join(__dirname, '..', 'assets', 'covers', iconName)

    try {
        await fs.access(iconPath)
    } catch {
        throw new Error(`Cover icon not found: ${iconPath}`)
    }

    const svg = await fs.readFile(iconPath)

    const image = await loadImage(svg)

    const iconSize = size * 0.45

    const x = size / 2 - iconSize / 2
    const y = size * 0.16

    ctx.save()

    ctx.shadowColor = `hsla(${hue},100%,80%,0.4)`
    ctx.shadowBlur = size * 0.04

    ctx.drawImage(image, x, y, iconSize, iconSize)

    ctx.restore()

    const halo = ctx.createRadialGradient(size / 2, y + iconSize / 2, 0, size / 2, y + iconSize / 2, iconSize)

    halo.addColorStop(0, `hsla(${hue},80%,75%,0.08)`)

    halo.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.fillStyle = halo
    ctx.fillRect(0, 0, size, size)
}

function drawAccents(ctx: SKRSContext2D, size: number, hue: number) {
    ctx.save()

    ctx.strokeStyle =`hsla(${hue}, 80%, 85%, 0.12)`

    ctx.lineWidth = Math.max(2, Math.floor(size / 250))

    const y1 = size * 0.14
    const y2 = size * 0.72

    ctx.beginPath()
    ctx.moveTo(size * 0.18, y1)
    ctx.lineTo(size * 0.82, y1)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(size * 0.12, y2)
    ctx.lineTo(size * 0.88, y2)
    ctx.stroke()

    ctx.restore()
}

function drawNoiseTexture(ctx: SKRSContext2D, size: number, rng: seedrandom.PRNG) {
    const imageData = ctx.getImageData(0, 0, size, size)

    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
        const noise = (rng() * 8) | 0

        data[i] = Math.min(255, data[i] + noise)

        data[i + 1] = Math.min(255,data[i + 1] + noise)

        data[i + 2] = Math.min(255, data[i + 2] + noise)
    }

    ctx.putImageData(imageData, 0, 0)
}

function drawText(ctx: SKRSContext2D, size: number, title: string, artist: string) {
    const padding = Math.floor(size * 0.05)

    const titleSize = Math.max(24, Math.floor(size / 11))

    const artistSize = Math.max(14, Math.floor(size / 24))

    const overlayHeight = size * 0.34

    const overlay = ctx.createLinearGradient(0, size - overlayHeight, 0, size)

    overlay.addColorStop(0, 'rgba(0,0,0,0)')

    overlay.addColorStop(1, 'rgba(0,0,0,0.75)')

    ctx.fillStyle = overlay

    ctx.fillRect(0, size - overlayHeight, size, overlayHeight)

    ctx.save()

    ctx.fillStyle = 'rgba(255,255,255,0.75)'

    ctx.font = `400 ${artistSize}px sans-serif`

    const artistText = artist.length > 28 ? artist.slice(0, 28) + '…' : artist

    ctx.fillText(artistText, padding, size - overlayHeight + artistSize + 8)

    ctx.restore()

    ctx.save()

    ctx.fillStyle = '#ffffff'

    ctx.font = `bold ${titleSize}px sans-serif`

    ctx.shadowColor = 'rgba(0,0,0,0.9)'

    ctx.shadowBlur = 8

    const words = title.split(' ')

    const lines: string[] = []

    let line = ''

    for (const word of words) {const test = line.length > 0 ? `${line} ${word}` : word

        if (ctx.measureText(test).width >size - padding * 2 &&line) {
            lines.push(line)
            line = word
        } else {
            line = test
        }
    }

    lines.push(line)

    const lineHeight =titleSize * 1.15

    const startY = size - padding - (lines.length - 1) * lineHeight

    lines.forEach((text, index) => {
        ctx.fillText(text, padding, startY + index * lineHeight)
    })

    ctx.restore()
}

export async function generateCover(seed: string, title: string, artist: string, size = 800): Promise<Buffer> {
    const canvas = createCanvas(size, size)

    const ctx = canvas.getContext('2d') as SKRSContext2D

    const rng = seedrandom(`cover_${seed}_${title}_${artist}`)

    const palette = PALETTES[Math.floor(rng() * PALETTES.length)]

    const icon = ICONS[Math.floor(rng() * ICONS.length)]

    drawBackground(ctx, size,palette[0],palette[1])

    drawSpotlight(ctx, size, palette[0])

    await drawHeroIcon(ctx, size, icon, palette[0])

    drawAccents(ctx, size, palette[0])

    drawNoiseTexture(ctx, size, rng)

    drawText(ctx, size, title, artist)

    return canvas.toBuffer('image/png')
}