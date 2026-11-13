import express from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { sendResetEmail } from '../mail.js'

const router = express.Router()

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex')

router.post('/forgot-password', async (req, res) => {
  const email = String(req.body.email || '').trim()
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' })
  }

  try {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email])

    if (rows.length > 0) {
      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 15 * 60 * 1000)

      await db.query(
        'UPDATE users SET reset_token_hash = ?, reset_expires_at = ? WHERE id = ?',
        [sha256(token), expires, rows[0].id]
      )

      try {
        await sendResetEmail(email, process.env.CLIENT_URL + '/reset-password?token=' + token)
      } catch (err) {
        console.error('Could not send the email:', err.message)
      }
    }

    res.json({ message: 'If this email is registered, a reset link has been sent.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const token = String(req.body.token || '')
    const password = String(req.body.password || '')

    if (!token || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const [rows] = await db.query(
      'SELECT id, reset_expires_at FROM users WHERE reset_token_hash = ?',
      [sha256(token)]
    )
    const user = rows[0]

    if (!user || new Date(user.reset_expires_at) < new Date()) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await db.query(
      'UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_expires_at = NULL WHERE id = ?',
      [passwordHash, user.id]
    )

    res.json({ message: 'Password changed. You can log in now.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

export default router