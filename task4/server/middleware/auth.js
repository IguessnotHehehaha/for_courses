const jwt = require('jsonwebtoken')
const prisma = require('../db')

module.exports = async (req, res, next) => {
    const token = req.cookies.token
    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await prisma.user.findUnique({ where: { id: decoded.id } })

        if (!user || user.status === 'blocked') {
            res.clearCookie('token')
            return res.status(403).json({ error: 'Access denied' })
        }

        req.user = user
        next()
    } catch (err) {
        res.clearCookie('token')
        return res.status(401).json({ error: 'Invalid token' })
    }
}