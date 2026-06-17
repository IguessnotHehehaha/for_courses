const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.options('*', cors({
    origin: process.env.CLIENT_URL,
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})