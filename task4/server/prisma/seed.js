const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
    const users = [
        { name: 'Alice Johnson', email: 'alice@example.com', status: 'active' },
        { name: 'Bob Smith', email: 'bob@example.com', status: 'active' },
        { name: 'Carol White', email: 'carol@example.com', status: 'blocked' },
        { name: 'David Brown', email: 'david@example.com', status: 'unverified' },
        { name: 'Emma Davis', email: 'emma@example.com', status: 'active' },
        { name: 'Frank Miller', email: 'frank@example.com', status: 'blocked' },
        { name: 'Grace Wilson', email: 'grace@example.com', status: 'unverified' },
        { name: 'Henry Moore', email: 'henry@example.com', status: 'active' },
        { name: 'Isla Taylor', email: 'isla@example.com', status: 'unverified' },
        { name: 'Jack Anderson', email: 'jack@example.com', status: 'active' },
    ]

    const hash = await bcrypt.hash('pass', 10)

    for (const [i, user] of users.entries()) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                ...user,
                passwordHash: hash,
                lastLogin: new Date(Date.now() - i * 60 * 60 * 1000)
            }
        })
    }

    console.log('Seeded 10 users')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())