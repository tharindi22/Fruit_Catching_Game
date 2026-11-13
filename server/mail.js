import nodemailer from 'nodemailer'

export async function sendResetEmail(to, link) {
  if (!process.env.SMTP_HOST) {
    console.log('Password reset link for ' + to + ': ' + link)
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'Reset your Fruit Catch password',
    text: 'Click this link to choose a new password (it works for 15 minutes):\n' + link,
    html:
      '<p>Click the link below to choose a new password. It works for 15 minutes.</p>' +
      '<p><a href="' + link + '">Reset my password</a></p>',
  })
}