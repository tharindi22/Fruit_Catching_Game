import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!password || !confirm) return setError('Please fill in all fields.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      const res = await fetch(API + '/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Something went wrong.')
      setDone(true)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot reach the server. Please try again later.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  const inputStyle =
    'w-full rounded-lg border border-white/80 bg-white/5 px-4 py-2 pr-10 text-sm text-white placeholder-gray-300 outline-none focus:border-yellow-400'

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <div className="w-full max-w-sm rounded-lg border border-yellow-400 bg-black/80 p-6 text-white">
        <h1 className="text-center text-3xl font-bold text-yellow-400">Fruit Catch</h1>

        {!token && (
          <div className="mt-5 text-center">
            <p className="mb-4 text-sm text-red-300">This reset link is not valid.</p>
            <Link to="/forgot-password" className="text-yellow-400 underline">
              Ask for a new link
            </Link>
          </div>
        )}

        {token && done && (
          <div className="mt-5 text-center">
            <p className="mb-4 text-sm text-green-300">Password changed. You can log in now.</p>
            <Link
              to="/login"
              className="block w-full rounded-md bg-yellow-400 py-2 font-semibold text-black hover:bg-yellow-300"
            >
              Go to login
            </Link>
          </div>
        )}

        {token && !done && (
          <form onSubmit={handleSubmit}>
            <p className="mb-5 mt-1 text-center text-sm">Choose a new password.</p>

            <label htmlFor="password" className="mb-1 block text-sm">New password</label>
            <div className="relative mb-3">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                {show ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <label htmlFor="confirm" className="mb-1 block text-sm">Confirm password</label>
            <input
              id="confirm"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type your password again"
              className={inputStyle + ' mb-4'}
            />

            {error && (
              <p role="alert" className="mb-3 text-center text-sm text-red-300">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-yellow-400 py-2 font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : 'Change password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}