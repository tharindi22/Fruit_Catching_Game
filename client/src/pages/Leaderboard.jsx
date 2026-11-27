import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'

export default function Leaderboard() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(API + '/leaderboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then(setRows)
      .catch(() => setError('Could not load the leaderboard.'))
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <div className="w-full max-w-sm rounded-xl border border-yellow-400 bg-black/80 p-6 text-white shadow-2xl backdrop-blur-sm">
        <h1 className="mb-4 text-center text-3xl font-bold text-yellow-400">Leaderboard</h1>

        <div className="mb-6 rounded-lg bg-white/10 p-4">
          {error && <p className="text-center text-sm text-red-300">{error}</p>}
          {!error && rows === null && <p className="text-center text-sm">Loading...</p>}
          {rows && rows.length === 0 && (
            <p className="text-center text-sm">No scores yet. Be the first!</p>
          )}

          {rows && rows.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/60">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Player</th>
                  <th className="pb-2">Best</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-white/30">
                    <td className="py-2 text-yellow-400">{i + 1}</td>
                    <td className="py-2">{row.player}</td>
                    <td className="py-2">{row.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Link
          to="/ready-to-play"
          className="block w-full rounded-lg bg-yellow-400 py-2 text-center text-lg font-semibold text-black hover:bg-yellow-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}