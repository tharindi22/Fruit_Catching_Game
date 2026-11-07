import { Link, useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

 
  function playAsGuest() {
    sessionStorage.setItem('player', 'guest')
    navigate('/ready-to-play')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <div className="w-full max-w-sm rounded-xl border border-yellow-400 bg-black/80 p-6 text-white shadow-2xl backdrop-blur-sm">
        <h1 className="text-center text-4xl font-bold text-yellow-400">Fruit Catch</h1>
        <p className="mb-8 mt-1 text-center text-sm text-gray-200">
          Catch the fruit. Dodge the bombs.
        </p>

        <button
          onClick={playAsGuest}
          className="mb-3 w-full rounded-lg border border-yellow-400 py-2 text-lg text-yellow-400 hover:bg-yellow-400/10"
        >
          Play as guest
        </button>

        <Link
          to="/login"
          className="mb-3 block w-full rounded-lg bg-yellow-400 py-2 text-center text-lg font-semibold text-black "
        >
          Login
        </Link>

        <Link
          to="/create-account"
          className="block w-full rounded-lg border border-yellow-400 py-2 text-center text-lg text-yellow-400 hover:bg-yellow-400/10"
        >
          Create Account
        </Link>

        <p className="mt-6 text-center text-sm text-gray-200">
          Guests can play level 1 and 2 only.
        </p>
      </div>
    </div>
  )
}