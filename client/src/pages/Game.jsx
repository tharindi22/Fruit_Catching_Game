// Written with help from an AI assistant (Claude).
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Pause from './Pause'
import BananaPopup from './BananaPopup'
import { LEVELS, getUnlocked, unlockLevel } from '../levels'
import { loadSounds, playSound, isMuted, setMuted } from '../sounds'
import { loadImages, drawIcon } from '../images'

const EXTRA_SECONDS = 15 // time gained for a correct Banana answer

// Fruits: the picture name (asked from the Iconify API) and the points each one gives
const FRUITS = [
  { icon: 'banana', points: 3 },
  { icon: 'red-apple', points: 2 },
  { icon: 'watermelon', points: 1 },
  { icon: 'grapes', points: 1 },
  { icon: 'tangerine', points: 1 },
]

// This part only checks that the player may open this level
export default function Game() {
  const { level } = useParams()
  const levelNumber = Number(level)
  const isGuest = sessionStorage.getItem('player') === 'guest'

  if (!LEVELS[levelNumber - 1]) return <Navigate to="/ready-to-play" replace />
  if (isGuest && levelNumber > 2) return <Navigate to="/guest-limit" replace />
  if (!isGuest && levelNumber > getUnlocked()) return <Navigate to="/levels" replace />

  // "key" makes the game start fresh every time the level changes
  return <GameScreen key={levelNumber} levelNumber={levelNumber} isGuest={isGuest} />
}

function GameScreen({ levelNumber, isGuest }) {
  const navigate = useNavigate()
  const level = LEVELS[levelNumber - 1]
  const canvasRef = useRef(null)

  // Values the game loop and the buttons both need
  const pausedRef = useRef(false)
  const puzzleRef = useRef(false)
  const overRef = useRef(false)
  const scoreRef = useRef(0)
  const timeRef = useRef(level.time)

  // Values shown on the screen
  const [paused, setPaused] = useState(false)
  const [puzzleOpen, setPuzzleOpen] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(level.time)
  const [soundOn, setSoundOn] = useState(!isMuted())

  // Pause or resume (not allowed while the Banana puzzle is open)
  function togglePause() {
    if (puzzleRef.current) return
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  // Sound on or off (the choice is remembered)
  function toggleSound() {
    setMuted(soundOn)
    setSoundOn(!soundOn)
  }

  // The game ended (a bomb was caught, or the Banana answer was wrong)
  function endGame(reason) {
    if (overRef.current) return
    overRef.current = true
    if (reason === 'bomb') playSound('bomb') // SOUND: bomb caught
    navigate('/game-over', { state: { score: scoreRef.current, reason, level: levelNumber } })
  }

  // The full score was reached, so the level is complete
  function finishLevel() {
    if (overRef.current) return
    overRef.current = true
    if (!isGuest) unlockLevel(levelNumber + 1)

    // Guests can only play levels 1 and 2
    if (isGuest && levelNumber >= 2) return navigate('/guest-limit')

    const time = timeRef.current
    const stars = time >= level.time / 2 ? 3 : time >= level.time / 4 ? 2 : 1
    navigate('/level-complete', {
      state: {
        level: levelNumber,
        score: scoreRef.current,
        timeLeft: time,
        stars,
      },
    })
  }

  // EVENT: the timer reached 0, so the Banana puzzle pops up
  function timeIsUp() {
    puzzleRef.current = true
    pausedRef.current = true
    setPuzzleOpen(true)
  }

  // EVENT: the Banana answer was correct, so add 15 seconds and carry on
  function puzzleSolved() {
    timeRef.current += EXTRA_SECONDS
    setTimeLeft(timeRef.current)
    puzzleRef.current = false
    pausedRef.current = false
    setPuzzleOpen(false)
  }

  // EVENT: the Banana answer was wrong (or the puzzle failed), so the game ends
  function puzzleFailed() {
    endGame('wrong')
  }

  useEffect(() => {
    loadSounds() // ask the server for the sound links (it only runs once)
    loadImages() // ask the Iconify API for the fruit, bomb and basket pictures

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const basket = { x: canvas.width / 2, y: canvas.height - 50, speed: 8 }
    const keys = { left: false, right: false }
    let items = [] // falling fruits and bombs
    let lastSpawn = 0
    let stopped = false
    let frameId

    // EVENT: mouse moves, so the basket follows the pointer
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      basket.x = (e.clientX - rect.left) * (canvas.width / rect.width)
    }

    // EVENTS: arrow keys pressed and released, Escape or P pauses
    function handleKeyDown(e) {
      if (puzzleRef.current) return // the player is typing the puzzle answer
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
      if (stopped || overRef.current) return

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
          icon: isBomb ? 'bomb' : fruit.icon,
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
          playSound('catch') // SOUND: fruit caught
          scoreRef.current += item.points // EVENT: fruit caught
          setScore(scoreRef.current)
          item.caught = true
          if (scoreRef.current >= level.target) return finishLevel() // EVENT: full score reached
        }
      }
      items = items.filter((i) => !i.caught && i.y < canvas.height + 30)

      // 4. Draw everything with the pictures from the API
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      items.forEach((i) => drawIcon(ctx, i.icon, i.x, i.y, 44))
      drawIcon(ctx, 'basket', basket.x, basket.y, 70)

      frameId = requestAnimationFrame(loop)
    }

    // EVENT: the timer ticks every second (it waits while paused)
    const timer = setInterval(() => {
      if (pausedRef.current) return
      timeRef.current -= 1
      setTimeLeft(timeRef.current)
      if (timeRef.current <= 0) timeIsUp()
    }, 1000)

    canvas.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    frameId = requestAnimationFrame(loop)

    // Clean up when the page closes
    return () => {
      stopped = true
      cancelAnimationFrame(frameId)
      clearInterval(timer)
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pill =
    'rounded-full border border-yellow-400 px-4 py-1 text-sm text-yellow-400'

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-4">
      <div className="w-full max-w-3xl rounded-xl border border-yellow-400 bg-black/80 p-4 shadow-2xl">
        {/* Top bar */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={pill}>Level {levelNumber}</span>
          <span className={pill}>
            Score {score}/{level.target}
          </span>
          <span className={pill}>{timeLeft}s</span>
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

        <div className="mt-2 flex items-center justify-between text-xs text-gray-300">
          <span>Move with the mouse or the arrow keys. Press Esc to pause.</span>
          <button onClick={toggleSound} className="underline">
            Sound: {soundOn ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {paused && <Pause onResume={togglePause} />}
      {puzzleOpen && <BananaPopup onSolved={puzzleSolved} onFailed={puzzleFailed} />}
    </div>
  )
}