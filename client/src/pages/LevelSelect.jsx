import { Link } from 'react-router-dom'
import { LEVELS, getUnlocked } from '../levels'

export default function LevelSelect() {
  const current = getUnlocked() 

  const tile = 'flex h-24 w-20 flex-col items-center justify-center rounded-lg border text-sm'

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <div className="w-full max-w-lg rounded-xl border border-yellow-400 bg-black/80 p-6 text-center text-white shadow-2xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-yellow-400">Choose Your Level</h1>
        <p className="mb-6 mt-2 text-sm text-gray-200">
          Pick up where you left off. Levels unlock as you complete the ones before.
        </p>

        <div className="mb-6 flex justify-center gap-2">
          {LEVELS.map((_, i) => {
            const n = i + 1

            
            if (n > current) {
              return (
                <div key={n} className={tile + ' border-white/80 text-gray-200'}>
                  <span>level</span>
                  <span className="text-3xl font-bold">{n}</span>
                  <span>Locked</span>
                </div>
              )
            }

            const isCurrent = n === current
            return (
              <Link
                key={n}
                to={'/game/' + n}
                className={
                  tile +
                  (isCurrent
                    ? ' border-yellow-400 bg-yellow-400 text-black'
                    : ' border-yellow-400 text-yellow-400 hover:bg-yellow-400/10')
                }
              >
                <span>level</span>
                <span className="text-3xl font-bold">{n}</span>
                <span>{isCurrent ? 'Current' : 'Completed'}</span>
              </Link>
            )
          })}
        </div>

        <Link
          to={'/game/' + current}
          className="block w-full rounded-lg bg-yellow-400 py-2 text-lg font-semibold text-black hover:bg-yellow-300"
        >
          Continue Level {current}
        </Link>

        <Link to="/ready-to-play" className="mt-4 block text-sm text-yellow-400 underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}