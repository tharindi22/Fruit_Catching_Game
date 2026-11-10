import express from 'express'
import crypto from 'crypto'


const BANANA_URL = 'https://marcconrad.com/uob/banana/api.php?out=json'

const router = express.Router()

const puzzles = new Map() 

router.get('/banana/puzzle', async (req, res) => {
  try {
    const response = await fetch(BANANA_URL, { signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error('Banana API error')
    const data = await response.json() 

    const id = crypto.randomUUID()
    puzzles.set(id, { solution: String(data.solution), expires: Date.now() + 2 * 60 * 1000 })

    
    for (const [key, p] of puzzles) {
      if (p.expires < Date.now()) puzzles.delete(key)
    }

    res.json({ id, question: data.question }) 
  } catch (err) {
    console.error(err)
    res.status(502).json({ message: 'Puzzle service is not available.' })
  }
})


router.post('/banana/answer', (req, res) => {
  const { id, answer } = req.body
  const puzzle = puzzles.get(id)

  if (!puzzle || puzzle.expires < Date.now()) {
    return res.status(400).json({ message: 'This puzzle has expired.' })
  }

  puzzles.delete(id) 
  res.json({ correct: String(answer) === puzzle.solution })
})

export default router