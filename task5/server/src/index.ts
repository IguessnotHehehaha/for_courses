import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import songsRouter from './routes/songs'
import coverRouter from './routes/cover'
import musicRouter from './routes/music'
import localesRouter from './routes/locales'


dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/songs', songsRouter)

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api/cover', coverRouter)

app.use('/api/music', musicRouter)

app.use('/api/locales', localesRouter)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})