const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const prisma = require('../db')
const { sendVerificationEmail } = require('../services/email')

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password)
        return res.status(400).json({ error: 'All fields are required' })

    try {
        const hash = await bcrypt.hash(password, 10)

        const verifyToken = crypto.randomBytes(32).toString('hex')

        await prisma.user.create({
            data: { name, email, passwordHash: hash, verifyToken }
        })

        sendVerificationEmail(email, verifyToken).catch(err =>
            console.error('Failed to send verification email:', err)
        )

        res.json({ message: 'Registered successfully! Check your email to verify your account.' })
    } catch (err) {
        if (err.code === 'P2002')
            return res.status(409).json({ error: 'Email already in use' })
        res.status(500).json({ error: 'Server error' })
    }
})

router.get('/verify', async (req, res) => {
    const { token } = req.query

    if (!token)
        return res.status(400).send('Invalid verification link')

    try {
        const user = await prisma.user.findUnique({ where: { verifyToken: token } })

        if (!user)
            return res.status(404).send('Verification link is invalid or already used')

        const newStatus = user.status === 'blocked' ? 'blocked' : 'active'

        await prisma.user.update({
            where: { id: user.id },
            data: {
                status: newStatus,
                verifyToken: null
            }
        })

        res.redirect(`${process.env.CLIENT_URL}/login?verified=true`)
    } catch (err) {
        res.status(500).send('Server error')
    }
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user)
            return res.status(401).json({ error: 'Invalid email or password' })
        if (user.status === 'blocked')
            return res.status(403).json({ error: 'Your account has been blocked' })

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid)
            return res.status(401).json({ error: 'Invalid email or password' })

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        })

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' })

        // Note: returning token in body instead of cookie so Safari/incognito works
        res.json({ message: 'Logged in successfully', token })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

router.post('/verify-manual', require('../middleware/auth'), async (req, res) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { status: 'active', verifyToken: null }
        })
        res.json({ message: 'Account verified successfully' })
    } catch (err) {
        res.status(500).json({ error: 'Server error' })
    }
})

router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out' })
})

router.get('/me', require('../middleware/auth'), (req, res) => {
    const { id, name, email, status } = req.user
    res.json({ id, name, email, status })
})

module.exports = router