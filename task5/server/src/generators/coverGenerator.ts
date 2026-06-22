import { createCanvas, SKRSContext2D } from '@napi-rs/canvas'
import seedrandom from 'seedrandom'

function hslToString(h: number, s: number, l: number) {
    return `hsl(${h}, ${s}%, ${l}%)`
}

function drawNoiseTexture(
    ctx: SKRSContext2D,
    width: number,
    height: number,
    rng: seedrandom.PRNG
) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
        const noise = (rng() * 30) | 0
        data[i] = Math.min(255, data[i] + noise)
        data[i + 1] = Math.min(255, data[i + 1] + noise)
        data[i + 2] = Math.min(255, data[i + 2] + noise)
    }
    ctx.putImageData(imageData, 0, 0)
}

function drawCircleOverlay(
    ctx: SKRSContext2D,
    width: number,
    height: number,
    rng: seedrandom.PRNG,
    hue: number
) {
    const cx = width * (0.3 + rng() * 0.4)
    const cy = height * (0.3 + rng() * 0.4)
    const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.7)
    radial.addColorStop(0, `hsla(${(hue + 180) % 360}, 60%, 60%, 0.15)`)
    radial.addColorStop(1, 'hsla(0, 0%, 0%, 0.4)')
    ctx.fillStyle = radial
    ctx.fillRect(0, 0, width, height)
}

function drawText(
    ctx: SKRSContext2D,
    width: number,
    height: number,
    title: string,
    artist: string
) {
    const padding = 20

    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.font = `500 ${Math.max(14, Math.floor(width / 16))}px sans-serif`
    ctx.fillText(
        artist.length > 22 ? artist.slice(0, 22) + '…' : artist,
        padding,
        padding + Math.floor(width / 16)
    )
    ctx.restore()

    const titleSize = Math.max(18, Math.floor(width / 10))
    ctx.save()
    ctx.globalAlpha = 1
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${titleSize}px sans-serif`
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 8

    const words = title.split(' ')
    let line = ''
    const lines: string[] = []
    for (const word of words) {
        const test = line ? `${line} ${word}` : word
        if (ctx.measureText(test).width > width - padding * 2 && line) {
            lines.push(line)
            line = word
        } else {
            line = test
        }
    }
    lines.push(line)

    const lineHeight = titleSize * 1.2
    const startY = height - padding - (lines.length - 1) * lineHeight
    lines.forEach((l, i) => {
        ctx.fillText(l, padding, startY + i * lineHeight)
    })
    ctx.restore()
}

function drawBackground(
    ctx: SKRSContext2D,
    width: number,
    height: number,
    rng: seedrandom.PRNG,
    hue: number
) {
    const style = Math.floor(rng() * 4)

    if (style === 0) {
        // Linear gradient at random angle
        const angle = rng() * Math.PI * 2
        const grad = ctx.createLinearGradient(
            width / 2 + Math.cos(angle) * width,
            height / 2 + Math.sin(angle) * height,
            width / 2 - Math.cos(angle) * width,
            height / 2 - Math.sin(angle) * height
        )
        grad.addColorStop(0, hslToString(hue, 60 + rng() * 20, 10 + rng() * 15))
        grad.addColorStop(1, hslToString((hue + 60) % 360, 70 + rng() * 20, 20 + rng() * 15))
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)

    } else if (style === 1) {
        // Radial gradient
        const cx = width * (0.2 + rng() * 0.6)
        const cy = height * (0.2 + rng() * 0.6)
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.8)
        grad.addColorStop(0, hslToString(hue, 80 + rng() * 20, 30 + rng() * 20))
        grad.addColorStop(1, hslToString((hue + 120) % 360, 60, 5 + rng() * 10))
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)

    } else if (style === 2) {
        // Split diagonal
        ctx.fillStyle = hslToString(hue, 70, 12)
        ctx.fillRect(0, 0, width, height)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(width, 0)
        ctx.lineTo(width * (0.3 + rng() * 0.4), height)
        ctx.lineTo(0, height)
        ctx.closePath()
        ctx.fillStyle = hslToString((hue + 40) % 360, 65, 20 + rng() * 15)
        ctx.fill()

    } else {
        // Dark solid with vignette
        ctx.fillStyle = hslToString(hue, 40, 8)
        ctx.fillRect(0, 0, width, height)
        const vignette = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.1,
            width / 2, height / 2, width * 0.8
        )
        vignette.addColorStop(0, 'rgba(0,0,0,0)')
        vignette.addColorStop(1, 'rgba(0,0,0,0.85)')
        ctx.fillStyle = vignette
        ctx.fillRect(0, 0, width, height)
    }
}

function drawShapes(
    ctx: SKRSContext2D,
    width: number,
    height: number,
    rng: seedrandom.PRNG,
    hue: number
) {
    const shapeCount = 5 + Math.floor(rng() * 10)
    const shapeStyle = Math.floor(rng() * 5)

    for (let i = 0; i < shapeCount; i++) {
        const x = rng() * width
        const y = rng() * height
        const size = 30 + rng() * 200
        const alpha = 0.04 + rng() * 0.25
        const shapeHue = (hue + rng() * 180) % 360

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = hslToString(shapeHue, 70 + rng() * 30, 50 + rng() * 30)
        ctx.strokeStyle = hslToString(shapeHue, 80, 70 + rng() * 20)
        ctx.lineWidth = 0.5 + rng() * 3

        if (shapeStyle === 0) {
            ctx.beginPath()
            ctx.arc(x, y, size / 2, 0, Math.PI * 2)
            ctx.fill()

        } else if (shapeStyle === 1) {
            ctx.translate(x, y)
            ctx.rotate(rng() * Math.PI)
            ctx.fillRect(-size / 2, -size / 4, size, size / 2)

        } else if (shapeStyle === 2) {
            ctx.beginPath()
            ctx.moveTo(x, y - size / 2)
            ctx.lineTo(x + size / 2, y + size / 2)
            ctx.lineTo(x - size / 2, y + size / 2)
            ctx.closePath()
            ctx.fill()

        } else if (shapeStyle === 3) {
            ctx.globalAlpha = 0.1 + rng() * 0.3
            ctx.strokeStyle = hslToString(shapeHue, 80, 70 + rng() * 30)
            ctx.lineWidth = 1 + rng() * 5
            ctx.beginPath()
            ctx.moveTo(rng() * width, rng() * height)
            ctx.bezierCurveTo(
                rng() * width, rng() * height,
                rng() * width, rng() * height,
                rng() * width, rng() * height
            )
            ctx.stroke()

        } else {
            ctx.globalAlpha = 0.08 + rng() * 0.2
            ctx.beginPath()
            ctx.arc(x, y, size / 2, 0, Math.PI * 2)
            ctx.lineWidth = 1 + rng() * 8
            ctx.stroke()
        }

        ctx.restore()
    }
}

function drawGridOverlay(
    ctx: SKRSContext2D,
    width: number,
    height: number,
    rng: seedrandom.PRNG,
    hue: number
) {
    if (rng() > 0.4) return

    const cells = 3 + Math.floor(rng() * 5)
    const cellSize = width / cells
    ctx.globalAlpha = 0.06 + rng() * 0.1
    ctx.strokeStyle = hslToString((hue + 60) % 360, 60, 80)
    ctx.lineWidth = 0.5

    for (let i = 0; i <= cells; i++) {
        ctx.beginPath()
        ctx.moveTo(i * cellSize, 0)
        ctx.lineTo(i * cellSize, height)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, i * cellSize)
        ctx.lineTo(width, i * cellSize)
        ctx.stroke()
    }
    ctx.globalAlpha = 1
}

export function generateCover(seed: string, title: string, artist: string, size = 400): Buffer {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d') as SKRSContext2D
    const rng = seedrandom(`cover_${seed}_${title}_${artist}`)

    const hue = Math.floor(rng() * 360)

    drawBackground(ctx, size, size, rng, hue)
    drawShapes(ctx, size, size, rng, hue)
    drawGridOverlay(ctx, size, size, rng, hue)  // new
    drawCircleOverlay(ctx, size, size, rng, hue)
    drawNoiseTexture(ctx, size, size, rng)
    drawText(ctx, size, size, title, artist)

    return canvas.toBuffer('image/png')
}