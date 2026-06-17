const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
})

async function sendVerificationEmail(email, token, retries = 3) {
    const link = `${process.env.APP_URL}/api/auth/verify?token=${token}`

    for (let i = 0; i < retries; i++) {
        try {
            await transporter.sendMail({
                from: `"User App" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Verify your email',
                html: `
          <h2>Welcome!</h2>
          <p>Click the link below to verify your email address:</p>
          <a href="${link}">${link}</a>
        `
            })
            return
        } catch (err) {
            console.error(`Email attempt ${i + 1} failed:`, err.message)
            if (i < retries - 1) await new Promise(r => setTimeout(r, 2000))
        }
    }

    console.error('All email attempts failed')
}

module.exports = { sendVerificationEmail }