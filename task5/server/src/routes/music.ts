import { Router, Request, Response } from 'express'
import { generateMidi } from '../generators/musicGenerator'

const router = Router()

router.get('/', (req: Request, res: Response) => {
    const {
        seed = '12345',
        title = 'Unknown',
    } = req.query as Record<string, string>

    const buffer = generateMidi(`${seed}`, title)

    res.set('Content-Type', 'audio/midi')
    res.set('Cache-Control', 'public, max-age=31536000')
    res.send(buffer)
})

export default router