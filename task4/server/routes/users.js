const router = require('express').Router()
const prisma = require('../db')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
    const allowedSortFields = ['name', 'email', 'status', 'lastLogin', 'createdAt']
    const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'lastLogin'
    const order = req.query.order === 'asc' ? 'asc' : 'desc'

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, name: true, email: true,
                status: true, lastLogin: true, createdAt: true
            },
            orderBy: sortBy === 'lastLogin'
                ? { lastLogin: { sort: order, nulls: 'last' } }
                : { [sortBy]: order }
        })
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

router.patch('/block', async (req, res) => {
    const { ids } = req.body
    try {
        const users = await prisma.user.findMany({ where: { id: { in: ids } } })

        await Promise.all(users.map(user =>
            prisma.user.update({
                where: { id: user.id },
                data: {
                    previousStatus: user.status,
                    status: 'blocked'
                }
            })
        ))
        res.json({ message: 'Users blocked successfully' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to block users' })
    }
})

router.patch('/unblock', async (req, res) => {
    const { ids } = req.body
    try {
        // Note: restore each user's status to what it was before being blocked
        await Promise.all(ids.map(async id => {
            const user = await prisma.user.findUnique({ where: { id } })
            return prisma.user.update({
                where: { id },
                data: { status: user.previousStatus }
            })
        }))
        res.json({ message: 'Users unblocked successfully' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to unblock users' })
    }
})

router.delete('/', async (req, res) => {
    const { ids } = req.body
    try {
        await prisma.user.deleteMany({ where: { id: { in: ids } } })
        res.json({ message: 'Users deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete users' })
    }
})

router.delete('/unverified', async (req, res) => {
    try {
        await prisma.user.deleteMany({ where: { status: 'unverified' } })
        res.json({ message: 'Unverified users deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete unverified users' })
    }
})

module.exports = router