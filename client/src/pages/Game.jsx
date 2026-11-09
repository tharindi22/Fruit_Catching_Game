import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Pause from './Pause'
import { LEVELS, getUnlocked, unlockLevel } from '../levels'


const FRUITS = [
  { emoji: '🍌', points: 3 },
  { emoji: '🍎', points: 2 },
  { emoji: '🍉', points: 1 },
  { emoji: '🍇', points: 1 },
  { emoji: '🍊', points: 1 },
]


export default function Game() {
  const { level } = useParams()
  const levelNumber = Number(level)
  const isGuest = sessionStorage.getItem('player') === 'guest'

  if (!LEVELS[levelNumber - 1]) return <Navigate to="/ready-to-play" replace />
  if (isGuest && levelNumber > 2) return <Navigate to="/guest-limit" replace />
  if (!isGuest && levelNumber > getUnlocked()) return <Navigate to="/levels" replace />

  
  return <GameScreen key={levelNumber} levelNumber={levelNumber} isGuest={isGuest} />
}

function GameScreen({ levelNumber, isGuest }) {
  const navigate = useNavigate()
  const level = LEVELS[levelNumber - 1]
  const canvasRef = useRef(null)
  const pausedRef = useRef(false) 
  const [paused, setPaused] = useState(false) 
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(level.time)
  const bonusLeft = 2 

  
  function togglePause() {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const basket = { x: canvas.width / 2, y: canvas.height - 50, speed: 8 }
    const keys = { left: false, right: false }
    let items = [] 
    let total = 0
    let time = level.time
    let lastSpawn = 0
    let over = false
    let frameId

    function endGame(reason) {
      if (over) return
      over = true
      navigate('/game-over', { state: { score: total, reason, level: levelNumber } })
    }

    
    function finishLevel() {
      if (over) return
      over = true
      if (!isGuest) unlockLevel(levelNumber + 1)
      
      if (isGuest && levelNumber >= 2) return navigate('/guest-limit')

      const stars = time >= level.time / 2 ? 3 : time >= level.time / 4 ? 2 : 1
      navigate('/level-complete', {
        state: { level: levelNumber, score: total, bonus: bonusLeft, timeLeft: time, stars },
      })
    }

    
    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      basket.x = (e.clientX - rect.left) * (canvas.width / rect.width)
    }

    
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

    
    function loop(now) {
      if (over) return

      
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
          emoji: isBomb ? '💣' : fruit.emoji,
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
          total += item.points // EVENT: fruit caught
          setScore(total)
          item.caught = true
          if (total >= level.target) return finishLevel() 
        }
      }
      items = items.filter((i) => !i.caught && i.y < canvas.height + 30)

      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '40px serif'
      items.forEach((i) => ctx.fillText(i.emoji, i.x, i.y))
      ctx.font = '60px serif'
      ctx.fillText('🧺', basket.x, basket.y)

      frameId = requestAnimationFrame(loop)
    }

    
    const timer = setInterval(() => {
      if (pausedRef.current) return
      time -= 1
      setTimeLeft(time)
      if (time <= 0) endGame('time') 
    }, 1000)

    canvas.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    frameId = requestAnimationFrame(loop)

    
    return () => {
      over = true
      cancelAnimationFrame(frameId)
      clearInterval(timer)
      canvas.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [navigate, level, levelNumber, isGuest])

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