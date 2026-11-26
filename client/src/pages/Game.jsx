import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import Pause from './Pause'
import BananaPopup from './BananaPopup'
import { LEVELS } from '../levels'
import { loadSounds, playSound, isMuted, setMuted } from '../sounds'
import { loadImages, drawIcon } from '../images'

const API = 'http://localhost:5000/api'
const EXTRA_SECONDS = 15

const FRUITS = [
  { icon: 'banana', points: 3 },
  { icon: 'red-apple', points: 2 },
  { icon: 'watermelon', points: 1 },
  { icon: 'grapes', points: 1 },
  { icon: 'tangerine', points: 1 },
]

export default function Game() {
  const { level } = useParams()
  const levelNumber = Number(level)
  const [check, setCheck] = useState({ level: null })

  useEffect(() => {
    if (!LEVELS[levelNumber - 1]) return
    fetch(API + '/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ level: levelNumber }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) setCheck({ level: levelNumber, status: 'allowed', isGuest: data.guest })
        else setCheck({ level: levelNumber, status: data.reason })
      })
      .catch(() => setCheck({ level: levelNumber, status: 'offline' }))
  }, [levelNumber])

  if (!LEVELS[levelNumber - 1]) return <Navigate to="/ready-to-play" replace />
  if (check.level !== levelNumber) return <p className="p-10 text-white">Loading...</p>
  if (check.status === 'guest') return <Navigate to="/guest-limit" replace />
  if (check.status === 'locked') return <Navigate to="/levels" replace />
  if (check.status === 'offline') {
    return (
      <p className="p-10 text-white">
        Cannot reach the server.{' '}
        <Link to="/" className="underline">Back to menu</Link>
      </p>
    )
  }

  return <GameScreen key={levelNumber} levelNumber={levelNumber} isGuest={check.isGuest} />
}

function GameScreen({ levelNumber, isGuest }) {
  const navigate = useNavigate()
  const level = LEVELS[levelNumber - 1]
  const canvasRef = useRef(null)

  const pausedRef = useRef(false)
  const puzzleRef = useRef(false)
  const overRef = useRef(false)
  const scoreRef = useRef(0)
  const timeRef = useRef(level.time)

  const [paused, setPaused] = useState(false)
  const [puzzleOpen, setPuzzleOpen] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(level.time)
  const [soundOn, setSoundOn] = useState(!isMuted())

  function togglePause() {
    if (puzzleRef.current) return
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  function toggleSound() {
    setMuted(soundOn)
    setSoundOn(!soundOn)
  }

  async function saveResult(completed) {
    if (isGuest) return
    try {
      await fetch(API + '/game/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ level: levelNumber, score: scoreRef.current, completed }),
      })
    } catch {
    }
  }

  async function endGame(reason) {
    if (overRef.current) return
    overRef.current = true
    if (reason === 'bomb') playSound('bomb')
    await saveResult(false)
    navigate('/game-over', { state: { score: scoreRef.current, reason, level: levelNumber } })
  }

  async function finishLevel() {
    if (overRef.current) return
    overRef.current = true
    await saveResult(true)

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

  function timeIsUp() {
    puzzleRef.current = true
    pausedRef.current = true
    setPuzzleOpen(true)
  }

  function puzzleSolved() {
    timeRef.current += EXTRA_SECONDS
    setTimeLeft(timeRef.current)
    puzzleRef.current = false
    pausedRef.current = false
    setPuzzleOpen(false)
  }

  function puzzleFailed() {
    endGame('wrong')
  }

  useEffect(() => {
    loadSounds()
    loadImages()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const basket = { x: canvas.width / 2, y: canvas.height - 50, speed: 8 }
    const keys = { left: false, right: false }
    let items = []
    let lastSpawn = 0
    let stopped = false
    let frameId

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      basket.x = (e.clientX - rect.left) * (canvas.width / rect.width)
    }

    function handleKeyDown(e) {
      if (puzzleRef.current) return
      if (e.key === 'ArrowLeft') keys.left = true
      if (e.key === 'ArrowRight') keys.right = true
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault()
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') togglePause()
    }
    function handleKeyUp(e) {
      if (e.key === 'ArrowLeft') keys.left = false
      if (e.key === 'ArrowRight') keys.right = false
    }

    function loop(now) {
      if (stopped || overRef.current) return

      if (pausedRef.current) {
        frameId = requestAnimationFrame(loop)
        return
      }

      if (keys.left) basket.x -= basket.speed
      if (keys.right) basket.x += basket.speed
      basket.x = Math.max(40, Math.min(canvas.width - 40, basket.x))


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

      for (const item of items) {
        item.y += item.speed
        const caught =
          item.y > basket.y - 30 &&
          item.y < basket.y + 30 &&
          Math.abs(item.x - basket.x) < 45
        if (caught) {
          if (item.isBomb) return endGame('bomb')
          playSound('catch')
          scoreRef.current += item.points
          setScore(scoreRef.current)
          item.caught = true
          if (scoreRef.current >= level.target) return finishLevel()
        }
      }
      items = items.filter((i) => !i.caught && i.y < canvas.height + 30)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      items.forEach((i) => drawIcon(ctx, i.icon, i.x, i.y, 44))
      drawIcon(ctx, 'basket', basket.x, basket.y, 70)

      frameId = requestAnimationFrame(loop)
    }

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

    return () => {
      stopped = true
      cancelAnimationFrame(frameId)
      clearInterval(timer)
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const pill =
    'rounded-full border border-yellow-400 px-4 py-1 text-sm text-yellow-400'

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-4">
      <div className="w-full max-w-3xl rounded-xl border border-yellow-400 bg-black/80 p-4 shadow-2xl">

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