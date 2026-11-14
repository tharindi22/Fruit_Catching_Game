import { Link } from 'react-router-dom'


export default function Pause({ onResume }) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-yellow-400 bg-black/90 p-6 text-center text-white shadow-2xl">
        <h1 className="text-3xl font-bold text-yellow-400">Paused</h1>
        <p className="mb-6 mt-2 text-sm text-gray-200">
          Move the basket with your mouse or the left and right arrow keys.
        </p>

        <button
          onClick={onResume}
          className="mb-3 block w-full rounded-lg bg-yellow-400 py-2 text-lg font-semibold text-black hover:bg-yellow-300"
        >
          Resume
        </button>

        <a
          href="/how-to-play"
          target="_blank"
          rel="noreferrer"
          className="mb-3 block w-full rounded-lg border border-yellow-400 py-2 text-yellow-400 hover:bg-yellow-400/10"
        >
          How to play
        </a>

        <Link
          to="/ready-to-play"
          className="block w-full rounded-lg border border-yellow-400 py-2 text-yellow-400 hover:bg-yellow-400/10"
        >
          Quit to menu
        </Link>
      </div>
    </div>
  )
}