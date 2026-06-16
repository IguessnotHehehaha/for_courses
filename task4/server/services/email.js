const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

async function sendVerificationEmail(email, token) {
    const link = `${process.env.APP_URL}/api/auth/verify?token=${token}`

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
}

module.exports = { sendVerificationEmail }