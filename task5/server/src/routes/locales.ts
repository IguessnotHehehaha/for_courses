import { Router, Request, Response } from 'express'
import { getAvailableLocales } from '../generators/localeLoader'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
    res.json(getAvailableLocales())
})

export default router