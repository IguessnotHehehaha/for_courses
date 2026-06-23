import { createCanvas, SKRSContext2D } from '@napi-rs/canvas'
import seedrandom from 'seedrandom'

function hslToString(h: number, s: number, l: number) {
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
}

function buildPalette(hue: number, rng: seedrandom.PRNG) {
    const style = Math.floor(rng() * 3)
    if (style === 0) {
        return [hue, (hue + 25) % 360, (hue + 50) % 360]
    } else if (style === 1) {
        return [hue, (hue + 180) % 360, (hue + 200) % 360]
    } else {
        return [hue, (hue + 120) % 360, (hue + 240) % 360]
    }
}

function drawMinimalist(
    ctx: SKRSContext2D,
    size: number,
    rng: seedrandom.PRNG,
    palette: number[]
) {
    ctx.fillStyle = hslToString(palette[0], 30, 8)
    ctx.fillRect(0, 0, size, size)

    const shapeType = Math.floor(rng() * 3)
    const cx = size * (0.3 + rng() * 0.4)
    const cy = size * (0.3 + rng() * 0.4)
    const radius = size * (0.2 + rng() * 0.2)

    ctx.save()
    ctx.globalAlpha = 0.85
    ctx.fillStyle = hslToString(palette[1], 65, 45)

    if (shapeType === 0) {
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()
    } else if (shapeType === 1) {
        ctx.translate(cx, cy)
        ctx.rotate(Math.PI / 4 * rng())
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
    } else {
        ctx.beginPath()
        ctx.moveTo(cx, cy - radius)
        ctx.lineTo(cx + radius, cy + radius)
        ctx.lineTo(cx - radius, cy + radius)
        ctx.closePath()
        ctx.fill()
    }
    ctx.restore()

    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.fillStyle = hslToString(palette[2], 80, 60)
    const ax = size * (0.1 + rng() * 0.8)
    const ay = size * (0.1 + rng() * 0.8)
    const ar = size * (0.04 + rng() * 0.08)
    ctx.beginPath()
    ctx.arc(ax, ay, ar, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.globalAlpha = 0.3
    ctx.strokeStyle = hslToString(palette[2], 70, 70)
    ctx.lineWidth = 1
    const ly = size * (0.6 + rng() * 0.2)
    ctx.beginPath()
    ctx.moveTo(size * 0.1, ly)
    ctx.lineTo(size * 0.5, ly)
    ctx.stroke()
    ctx.restore()
}

function drawBands(
    ctx: SKRSContext2D,
    size: number,
    rng: seedrandom.PRNG,
    palette: number[]
) {
    const bandCount = 3 + Math.floor(rng() * 3)
    const diagonal = rng() > 0.5
    const angle = diagonal ? (rng() * 30 - 15) : 0 // slight tilt

    ctx.save()
    ctx.translate(size / 2, size / 2)
    ctx.rotate((angle * Math.PI) / 180)
    ctx.translate(-size / 2, -size / 2)

    for (let i = 0; i < bandCount; i++) {
        const t = i / bandCount
        const bandHue = palette[i % palette.length]
        const lightness = 10 + (i / bandCount) * 25
        ctx.fillStyle = hslToString(bandHue, 50 + rng() * 20, lightness)
        ctx.fillRect(-size, (i / bandCount) * size * 2 - size / 2, size * 3, (size * 2) / bandCount)
    }
    ctx.restore()

    const grad = ctx.createLinearGradient(0, 0, 0, size)
    grad.addColorStop(0, 'rgba(0,0,0,0.3)')
    grad.addColorStop(0.5, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.5)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
}

function drawRadialBurst(
    ctx: SKRSContext2D,
    size: number,
    rng: seedrandom.PRNG,
    palette: number[]
) {
    ctx.fillStyle = hslToString(palette[0], 40, 6)
    ctx.fillRect(0, 0, size, size)

    const cx = size * (0.3 + rng() * 0.4)
    const cy = size * (0.3 + rng() * 0.4)
    const rayCount = 6 + Math.floor(rng() * 6)

    for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2
        const nextAngle = ((i + 1) / rayCount) * Math.PI * 2
        const isLight = i % 2 === 0

        ctx.save()
        ctx.globalAlpha = isLight ? 0.15 + rng() * 0.1 : 0.05
        ctx.fillStyle = hslToString(
            palette[i % palette.length],
            60,
            isLight ? 70 : 30
        )
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(
            cx + Math.cos(angle) * size * 1.5,
            cy + Math.sin(angle) * size * 1.5
        )
        ctx.lineTo(
            cx + Math.cos(nextAngle) * size * 1.5,
            cy + Math.sin(nextAngle) * size * 1.5
        )
        ctx.closePath()
        ctx.fill()
        ctx.restore()
    }

    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.4)
    glow.addColorStop(0, `hsla(${palette[1]}, 80%, 70%, 0.4)`)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, size, size)
}

function drawMosaic(
    ctx: SKRSContext2D,
    size: number,
    rng: seedrandom.PRNG,
    palette: number[]
) {
    const gridSize = 4 + Math.floor(rng() * 3) // 4x4 to 6x6
    const cellSize = size / gridSize

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const roll = rng()
            const hue = palette[Math.floor(rng() * palette.length)]
            const lightness = roll > 0.7 ? 50 + rng() * 20 : 8 + rng() * 12

            ctx.fillStyle = hslToString(hue, 50 + rng() * 30, lightness)
            ctx.fillRect(
                col * cellSize,
                row * cellSize,
                cellSize,
                cellSize
            )
        }
    }

    const vignette = ctx.createRadialGradient(
        size / 2, size / 2, size * 0.2,
        size / 2, size / 2, size * 0.85
    )
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, size, size)
}

function drawConcentric(
    ctx: SKRSContext2D,
    size: number,
    rng: seedrandom.PRNG,
    palette: number[]
) {
    ctx.fillStyle = hslToString(palette[0], 40, 5)
    ctx.fillRect(0, 0, size, size)

    const cx = size / 2
    const cy = size / 2
    const ringCount = 5 + Math.floor(rng() * 4)
    const useSquares = rng() > 0.5

    for (let i = ringCount; i > 0; i--) {
        const t = i / ringCount
        const hue = palette[i % palette.length]
        const lightness = 15 + (1 - t) * 35

        ctx.save()
        ctx.globalAlpha = 0.7 + (1 - t) * 0.3
        ctx.fillStyle = hslToString(hue, 55 + rng() * 20, lightness)

        if (useSquares) {
            const half = (t * size * 0.6)
            ctx.fillRect(cx - half, cy - half, half * 2, half * 2)
        } else {
            ctx.beginPath()
            ctx.arc(cx, cy, t * size * 0.55, 0, Math.PI * 2)
            ctx.fill()
        }
        ctx.restore()
    }
}

function drawText(
    ctx: SKRSContext2D,
    size: number,
    title: string,
    artist: string
) {
    const padding = 18
    const artistSize = Math.max(12, Math.floor(size / 18))
    const titleSize = Math.max(16, Math.floor(size / 10))

    const barHeight = titleSize * 3.5
    const barGrad = ctx.createLinearGradient(0, size - barHeight, 0, size)
    barGrad.addColorStop(0, 'rgba(0,0,0,0)')
    barGrad.addColorStop(1, 'rgba(0,0,0,0.75)')
    ctx.fillStyle = barGrad
    ctx.fillRect(0, size - barHeight, size, barHeight)

    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = `400 ${artistSize}px sans-serif`
    const artistText = artist.length > 24 ? artist.slice(0, 24) + '…' : artist
    ctx.fillText(artistText, padding, size - barHeight + artistSize + 4)
    ctx.restore()

    ctx.save()
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${titleSize}px sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,0.9)'
    ctx.shadowBlur = 6

    const words = title.split(' ')
    let line = ''
    const lines: string[] = []
    for (const word of words) {
        const test = line ? `${line} ${word}` : word
        if (ctx.measureText(test).width > size - padding * 2 && line) {
            lines.push(line)
            line = word
        } else {
            line = test
        }
    }
    lines.push(line)

    const lineHeight = titleSize * 1.25
    const startY = size - padding - (lines.length - 1) * lineHeight
    lines.forEach((l, i) => {
        ctx.fillText(l, padding, startY + i * lineHeight)
    })
    ctx.restore()
}

function addNoiseTexture(
    ctx: SKRSContext2D,
    size: number,
    rng: seedrandom.PRNG
) {
    const imageData = ctx.getImageData(0, 0, size, size)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
        const noise = (rng() * 18) | 0
        data[i] = Math.min(255, data[i] + noise)
        data[i + 1] = Math.min(255, data[i + 1] + noise)
        data[i + 2] = Math.min(255, data[i + 2] + noise)
    }
    ctx.putImageData(imageData, 0, 0)
}

export function generateCover(
    seed: string,
    title: string,
    artist: string,
    size = 400
): Buffer {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d') as SKRSContext2D
    const rng = seedrandom(`cover_${seed}_${title}_${artist}`)

    const styleIndex = Math.floor(rng() * 5)
    const hue = Math.floor(rng() * 360)
    const palette = buildPalette(hue, rng)

    switch (styleIndex) {
        case 0: drawMinimalist(ctx, size, rng, palette); break
        case 1: drawBands(ctx, size, rng, palette); break
        case 2: drawRadialBurst(ctx, size, rng, palette); break
        case 3: drawMosaic(ctx, size, rng, palette); break
        case 4: drawConcentric(ctx, size, rng, palette); break
    }

    addNoiseTexture(ctx, size, rng)
    drawText(ctx, size, title, artist)

    return canvas.toBuffer('image/png')
}