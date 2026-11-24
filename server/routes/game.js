import express from 'express'
import db from '../db.js'
import { requireLogin } from '../middleware.js'

const router = express.Router()

const MAX_LEVEL = 5
const GUEST_MAX_LEVEL = 2

async function getProgress(userId) {
  await db.query('INSERT IGNORE INTO progress (user_id) VALUES (?)', [userId])
  const [[row]] = await db.query(
    `SELECT p.unlocked_level,
            (SELECT COALESCE(MAX(score), 0) FROM scores WHERE user_id = p.user_id) AS best_score
     FROM progress p WHERE p.user_id = ?`,
    [userId]
  )
  return row
}

router.get('/progress', requireLogin, async (req, res) => {
  try {
    const progress = await getProgress(req.user.id)
    res.json({ unlockedLevel: progress.unlocked_level, bestScore: progress.best_score })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

router.post('/game/start', async (req, res) => {
  try {
    const level = Number(req.body.level)
    if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
      return res.status(400).json({ message: 'Unknown level.' })
    }

    if (!req.user) {
      if (level > GUEST_MAX_LEVEL) {
        return res.status(403).json({ reason: 'guest', message: 'Create an account to play this level.' })
      }
      return res.json({ allowed: true, guest: true })
    }

    const progress = await getProgress(req.user.id)
    if (level > progress.unlocked_level) {
      return res.status(403).json({ reason: 'locked', message: 'This level is locked.' })
    }
    res.json({ allowed: true, guest: false })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

router.post('/game/finish', requireLogin, async (req, res) => {
  try {
    const level = Number(req.body.level)
    const score = Number(req.body.score)
    const completed = req.body.completed === true

    if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
      return res.status(400).json({ message: 'Unknown level.' })
    }
    if (!Number.isInteger(score) || score < 0 || score > 200) {
      return res.status(400).json({ message: 'Invalid score.' })
    }

    const progress = await getProgress(req.user.id)
    if (level > progress.unlocked_level) {
      return res.status(403).json({ message: 'This level is locked.' })
    }

    await db.query('INSERT INTO scores (user_id, level, score) VALUES (?, ?, ?)', [
      req.user.id,
      level,
      score,
    ])

    if (completed && level < MAX_LEVEL) {
      await db.query(
        'UPDATE progress SET unlocked_level = GREATEST(unlocked_level, ?) WHERE user_id = ?',
        [level + 1, req.user.id]
      )
    }
    res.json({ message: 'Saved.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

router.get('/leaderboard', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT SUBSTRING_INDEX(u.name, ' ', 1) AS player, MAX(s.score) AS best
       FROM scores s JOIN users u ON u.id = s.user_id
       GROUP BY u.id, u.name
       ORDER BY best DESC
       LIMIT 5`
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
})

export default router