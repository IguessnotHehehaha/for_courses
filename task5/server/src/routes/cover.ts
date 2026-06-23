import { Router, Request, Response } from 'express'
import { generateCover } from '../generators/coverGenerator'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
    const {
        seed = '12345',
        title = 'Unknown',
        artist = 'Unknown',
    } = req.query as Record<string, string>

    const buffer = await generateCover(
        `${seed}_${title}_${artist}`,
        title,
        artist
    )

    res.set('Content-Type', 'image/png')
    res.set('Cache-Control', 'public, max-age=31536000')
    res.send(buffer)
})

export default router