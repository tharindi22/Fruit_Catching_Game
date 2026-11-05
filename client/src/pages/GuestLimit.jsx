import { Link } from 'react-router-dom'

export default function GuestLimit() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <div className="w-full max-w-sm rounded-xl border border-yellow-400 bg-black/80 p-6 text-center text-white shadow-2xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-yellow-400">Nice Catching!</h1>
        <p className="mb-6 mt-2 text-sm text-gray-200">
          Guests can play levels 1 and 2. Create an account to unlock level 3 and keep your progress.
        </p>

        <Link
          to="/create-account"
          className="mb-3 block w-full rounded-lg bg-yellow-400 py-2 text-lg font-semibold text-black"
        >
          Create account
        </Link>

        <Link
          to="/"
          className="block w-full rounded-lg border border-yellow-400 py-2 text-lg text-yellow-400 hover:bg-yellow-400/10"
        >
          Back to menu
        </Link>
      </div>
    </div>
  )
}