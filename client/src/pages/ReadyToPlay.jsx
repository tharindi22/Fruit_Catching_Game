import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API = 'http://localhost:5000/api'

export default function ReadyToPlay() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const bestScore = Number(localStorage.getItem('bestScore')) || 0 

  
  useEffect(() => {
    async function checkPlayer() {
      try {
        const res = await fetch(API + '/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          return setName(data.name.split(' ')[0])
        }
      } catch {
        
      }
      if (sessionStorage.getItem('player') === 'guest') {
        setName('Guest')
      } else {
        navigate('/')
      }
    }
    checkPlayer()
  }, [navigate])

  async function handleLogout() {
    try {
      await fetch(API + '/logout', { method: 'POST', credentials: 'include' })
    } catch {
     
    }
    sessionStorage.removeItem('player')
    navigate('/')
  }

  if (!name) return null 
  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <div className="w-full max-w-sm rounded-xl border border-yellow-400 bg-black/80 p-6 text-center text-white shadow-2xl backdrop-blur-sm">
        {/* Top row */}
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full border border-yellow-400 px-4 py-1 text-sm text-yellow-400">
            Hi {name}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full bg-yellow-400 px-4 py-1 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            Log Out
          </button>
        </div>

        <img
          src="/fruits.png"
          alt=""
          onError={(e) => (e.target.style.display = 'none')}
          className="mx-auto mb-4 h-40 object-contain"
        />

        <h1 className="text-3xl font-bold text-yellow-400">Ready to play</h1>
        <p className="mb-6 mt-1 text-sm">
          Your best score: <span className="font-bold">{bestScore}</span>
        </p>

        <Link
          to="/game"
          className="mb-3 block w-full rounded-lg bg-yellow-400 py-2 text-lg font-semibold text-black hover:bg-yellow-300"
        >
          Play Game
        </Link>
        <Link
          to="/how-to-play"
          className="mb-3 block w-full rounded-lg border border-yellow-400 py-2 text-yellow-400 hover:bg-yellow-400/10"
        >
          How to play
        </Link>
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