import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Pause from './Pause'

// Level 1 settings (we will move these to levels.js in the levels branch)
const level = { time: 30, fallSpeed: 3, bombChance: 0.2, spawnEvery: 800 }

// Fruits and the points each one gives
const FRUITS = [
  { emoji: '🍌', points: 3 },
  { emoji: '🍎', points: 2 },
  { emoji: '🍉', points: 1 },
  { emoji: '🍇', points: 1 },
  { emoji: '🍊', points: 1 },
]

export default function Game() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const pausedRef = useRef(false) // the game loop reads this
  const [paused, setPaused] = useState(false) // the screen reads this
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(level.time)
  const bonusLeft = 2 // Banana puzzle bonuses (we add the puzzle later)

  // Pause or resume
  function togglePause() {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const basket = { x: canvas.width / 2, y: canvas.height - 50, speed: 8 }
    const keys = { left: false, right: false }
    let items = [] // falling fruits and bombs
    let total = 0
    let time = level.time
    let lastSpawn = 0
    let over = false
    let frameId

    function endGame(reason) {
      if (over) return
      over = true
      navigate('/game-over', { state: { score: total, reason } })
    }

    // EVENT: mouse moves, so the basket follows the pointer
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      basket.x = (e.clientX - rect.left) * (canvas.width / rect.width)
    }

    // EVENTS: arrow keys pressed and released, Escape or P pauses
    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft') keys.left = true
      if (e.key === 'ArrowRight') keys.right = true
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault()
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') togglePause()
    }
    function handleKeyUp(e) {
      if (e.key === 'ArrowLeft') keys.left = false
      if (e.key === 'ArrowRight') keys.right = false
    }

    // The game loop: runs about 60 times every second
    function loop(now) {
      if (over) return

      // While paused, do nothing but keep the loop alive
      if (pausedRef.current) {
        frameId = requestAnimationFrame(loop)
        return
      }

      // 1. Move the basket (arrow keys) and keep it inside the screen
      if (keys.left) basket.x -= basket.speed
      if (keys.right) basket.x += basket.speed
      basket.x = Math.max(40, Math.min(canvas.width - 40, basket.x))

      // 2. Add a new fruit or bomb every so often
      if (now - lastSpawn > level.spawnEvery) {
        lastSpawn = now
        const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)]
        const isBomb = Math.random() < level.bombChance
        items.push({
          x: 30 + Math.random() * (canvas.width - 60),
          y: -30,
          speed: level.fallSpeed + Math.random() * 1.5,
          emoji: isBomb ? '💣' : fruit.emoji,
          points: fruit.points,
          isBomb,
        })
      }

      // 3. Move everything down and check if the basket caught it
      for (const item of items) {
        item.y += item.speed
        const caught =
          item.y > basket.y - 30 &&
          item.y < basket.y + 30 &&
          Math.abs(item.x - basket.x) < 45
        if (caught) {
          if (item.isBomb) return endGame('bomb') // EVENT: bomb caught
          total += item.points // EVENT: fruit caught
          setScore(total)
          item.caught = true
        }
      }
      items = items.filter((i) => !i.caught && i.y < canvas.height + 30)

      // 4. Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '40px serif'
      items.forEach((i) => ctx.fillText(i.emoji, i.x, i.y))
      ctx.font = '60px serif'
      ctx.fillText('🧺', basket.x, basket.y)

      frameId = requestAnimationFrame(loop)
    }

    // EVENT: the timer ticks every second (it waits while paused)
    const timer = setInterval(() => {
      if (pausedRef.current) return
      time -= 1
      setTimeLeft(time)
      if (time <= 0) endGame('time') // later: the Banana puzzle appears here
    }, 1000)

    canvas.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    frameId = requestAnimationFrame(loop)

    // Clean up when the page closes
    return () => {
      over = true
      cancelAnimationFrame(frameId)
      clearInterval(timer)
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [navigate])

  const pill =
    'rounded-full border border-yellow-400 px-5 py-1 text-sm text-yellow-400'

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-4">
      <div className="w-full max-w-3xl rounded-xl border border-yellow-400 bg-black/80 p-4 shadow-2xl">
        {/* Top bar */}
        <div className="mb-3 flex items-center justify-between">
          <span className={pill}>Score {score}</span>
          <span className={pill}>{timeLeft}s</span>
          <span className={pill}>Bonus {bonusLeft}</span>
          <button onClick={togglePause} className={pill + ' hover:bg-yellow-400/10'}>
            Pause
          </button>
        </div>

        {/* Game area */}
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="w-full rounded-lg bg-black/40"
        />

        <p className="mt-2 text-center text-xs text-gray-300">
          Move with the mouse or the left and right arrow keys. Press Esc to pause.
        </p>
      </div>

      {paused && <Pause onResume={togglePause} />}
    </div>
  )
}