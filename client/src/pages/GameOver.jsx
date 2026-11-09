import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'


const messages = {
  bomb: 'You caught a bomb 💣',
  time: 'Time is up ⏰',
  wrong: 'Wrong answer 🍌',
}

export default function GameOver() {
  const { state } = useLocation()
  const score = state?.score ?? 0

  
  const [best] = useState(() => {
    const old = Number(localStorage.getItem('bestScore')) || 0
    const newBest = Math.max(old, score)
    localStorage.setItem('bestScore', newBest)
    return newBest
  })

  
  if (!state) return <Navigate to="/ready-to-play" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <div className="w-full max-w-sm rounded-xl border border-yellow-400 bg-black/80 p-6 text-center text-white shadow-2xl backdrop-blur-sm">
        <h1 className="mb-4 text-3xl font-bold text-yellow-400">Game over</h1>

        <div className="mb-6 rounded-lg bg-white/10 py-4">
          <p className="text-sm">{messages[state.reason]}</p>
          <p className="my-1 text-5xl font-bold text-yellow-400">{score}</p>
          <p className="text-sm">
            Best: <span className="font-bold">{best}</span>
          </p>
        </div>

        <Link
          to={'/game/' + (state.level || 1)}
          className="mb-3 block w-full rounded-lg bg-yellow-400 py-2 text-lg font-semibold text-black hover:bg-yellow-300"
        >
          Play Again
        </Link>
        <Link
          to="/leaderboard"
          className="mb-3 block w-full rounded-lg border border-yellow-400 py-2 text-yellow-400 hover:bg-yellow-400/10"
        >
          Leaderboard
        </Link>
        <Link
          to="/ready-to-play"
          className="block w-full rounded-lg border border-yellow-400 py-2 text-yellow-400 hover:bg-yellow-400/10"
        >
          Home
        </Link>
      </div>
    </div>
  )
}