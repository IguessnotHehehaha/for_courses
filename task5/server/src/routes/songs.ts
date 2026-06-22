import { Router, Request, Response } from 'express'
import { generateSongs } from '../generators/songGenerator'

const router = Router()

router.get('/', (req: Request, res: Response) => {
    const {
        seed = '12345',
        page = '1',
        lang = 'en',
        likes = '3',
        pageSize = '20',
    } = req.query as Record<string, string>

    const songs = generateSongs(
        seed,
        parseInt(page, 10),
        parseInt(pageSize, 10),
        lang,
        parseFloat(likes)
    )

    res.json({ songs, page: parseInt(page, 10) })
})

export default router