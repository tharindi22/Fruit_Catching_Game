import { Link } from 'react-router-dom'

export default function HowToPlay() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <div className="w-full max-w-sm rounded-xl border border-yellow-400 bg-black/80 p-6 text-white shadow-2xl backdrop-blur-sm">
        <h1 className="mb-4 text-center text-3xl font-bold text-yellow-400">How to play</h1>

        <ol className="mb-6 list-decimal space-y-2 rounded-lg bg-white/10 py-4 pl-9 pr-4 text-sm">
          <li>Move the basket with your mouse or the left and right arrow keys.</li>
          <li>Catch fruit: 🍌 +3, 🍎 +2, other fruits +1.</li>
          <li>Touch a 💣 and the game ends straight away.</li>
          <li>When the timer reaches 0, a Banana puzzle appears.</li>
          <li>Solve it to get +15 seconds. A wrong answer ends the game.</li>
          <li>You can get a time bonus up to 2 times per game.</li>
        </ol>

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