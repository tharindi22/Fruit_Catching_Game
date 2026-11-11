import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api'

export default function BananaPopup({ onSolved, onFailed }) {
  const [puzzle, setPuzzle] = useState(null) 
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState('loading') 

  async function loadPuzzle() {
    setStatus('loading')
    setAnswer('')
    try {
      const res = await fetch(API + '/banana/puzzle')
      if (!res.ok) throw new Error('No puzzle')
      setPuzzle(await res.json())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    loadPuzzle()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (answer === '') return
    setStatus('checking')
    try {
      const res = await fetch(API + '/banana/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: puzzle.id, answer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error('Puzzle expired')
      if (data.correct) onSolved()
      else onFailed()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-xl border border-yellow-400 bg-neutral-900 p-6 text-center text-white shadow-2xl">
        <h1 className="mb-4 text-2xl font-bold text-yellow-400">
          Time&rsquo;s up! solve for +15s
        </h1>

        {status === 'loading' && <p className="py-10 text-sm">Loading puzzle...</p>}

        {status === 'error' && (
          <div className="py-4">
            <p className="mb-4 text-sm text-red-300">
              The puzzle could not be loaded or checked.
            </p>
            <button
              onClick={loadPuzzle}
              className="mb-3 w-full rounded-lg bg-yellow-400 py-2 font-semibold text-black hover:bg-yellow-300"
            >
              Try again
            </button>
            <button
              onClick={onFailed}
              className="w-full rounded-lg border border-yellow-400 py-2 text-yellow-400 hover:bg-yellow-400/10"
            >
              End game
            </button>
          </div>
        )}

        {(status === 'ready' || status === 'checking') && (
          <form onSubmit={handleSubmit}>
            <img
              src={puzzle.question}
              alt="Banana puzzle: find the missing number"
              className="mb-4 w-full rounded-lg bg-white"
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={1}
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))}
              placeholder="Your Answer"
              className="mb-4 w-full rounded-lg border border-yellow-400 bg-transparent px-4 py-2 text-center text-yellow-400 placeholder-yellow-400/70 outline-none"
            />
            <button
              type="submit"
              disabled={status === 'checking'}
              className="w-full rounded-lg bg-yellow-400 py-2 text-lg font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
            >
              {status === 'checking' ? 'Checking...' : 'Submit answer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}