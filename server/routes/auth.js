import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const router = express.Router()

// Create a token and save it in an httpOnly cookie
function setLoginCookie(res, user, remember) {
  const days = remember ? 7 : 1
  const token = jwt.sign(
    { id: user.id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: days + 'd' }
  )
  res.cookie('token', token, {
    httpOnly: true, // JavaScript in the browser cannot read it
    sameSite: 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  })
}

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const [found] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (found.length > 0) {
      return res.status(409).json({ message: 'This email is already registered.' })
    }

    const passwordHash = await bcrypt.hash(password, 10) // never store the plain password
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    )

    setLoginCookie(res, { id: result.insertId, name }, false)
    res.status(201).json({ message: 'Account created.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter your email and password.' })
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    const user = rows[0]

    // Same message for both cases, so nobody can guess which emails exist
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Wrong email or password.' })
    }
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ message: 'Wrong email or password.' })
    }

    setLoginCookie(res, user, remember)
    res.json({ message: 'Logged in.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

// LOGOUT
router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out.' })
})

// WHO AM I (checks the cookie)
router.get('/me', (req, res) => {
  try {
    const user = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
    res.json({ id: user.id, name: user.name })
  } catch {
    res.status(401).json({ message: 'Not logged in.' })
  }
})

// GOOGLE LOGIN (also used for Google sign up)
router.post('/google-login', async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) {
      return res.status(400).json({ message: 'Google token is missing.' })
    }

    
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const { email, name, email_verified } = ticket.getPayload()

    if (!email_verified) {
      return res.status(401).json({ message: 'Your Google email is not verified.' })
    }

    
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    let user = rows[0]

    if (!user) {
      const [result] = await db.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email]
      )
      user = { id: result.insertId, name }
    }

    setLoginCookie(res, user, true)
    res.json({ message: 'Logged in with Google.' })
  } catch (err) {
    console.error(err)
    res.status(401).json({ message: 'Google login failed. Please try again.' })
  }
})

export default router