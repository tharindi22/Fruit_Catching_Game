import { Link, Navigate, useLocation } from 'react-router-dom'
import { LEVELS } from '../levels'

export default function LevelComplete() {
  const { state } = useLocation()

  
  if (!state) return <Navigate to="/ready-to-play" replace />

  const { level, score, bonus, timeLeft, stars } = state
  const next = level < LEVELS.length ? level + 1 : null

  const pill = 'rounded-full border border-yellow-400 px-4 py-1 text-sm text-yellow-400'

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <div className="w-full max-w-sm rounded-xl border border-yellow-400 bg-black/80 p-6 text-center text-white shadow-2xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-yellow-400">Level {level} Complete!</h1>

        {/* Stars */}
        <p className="my-4 text-4xl" aria-label={stars + ' stars'}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= stars ? 'text-yellow-400' : 'text-gray-600'}>
              ★{' '}
            </span>
          ))}
        </p>

        <div className="mb-6 flex justify-center gap-2">
          <span className={pill}>Score {score}</span>
          <span className={pill}>Bonus {bonus}</span>
          <span className={pill}>Time {timeLeft}s</span>
        </div>

        {next ? (
          <Link
            to={'/game/' + next}
            className="mb-3 block w-full rounded-lg bg-yellow-400 py-2 text-lg font-semibold text-black hover:bg-yellow-300"
          >
            Next Level
          </Link>
        ) : (
          <Link
            to="/levels"
            className="mb-3 block w-full rounded-lg bg-yellow-400 py-2 text-lg font-semibold text-black hover:bg-yellow-300"
          >
            You finished all levels! Level Select
          </Link>
        )}

        <Link
          to="/leaderboard"
          className="block w-full rounded-lg border border-yellow-400 py-2 text-yellow-400 hover:bg-yellow-400/10"
        >
          Leaderboard
        </Link>
      </div>
    </div>
  )
}