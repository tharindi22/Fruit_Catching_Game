import { useState } from 'react'
import { Link } from 'react-router-dom'

const API = 'http://localhost:5000/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email) return setError('Please enter your email.')
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email address.')

    setLoading(true)
    try {
      const res = await fetch(API + '/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Something went wrong.')
      setMessage(data.message)
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
    'w-full rounded-lg border border-white/80 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-300 outline-none focus:border-yellow-400'

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-yellow-400 bg-black/80 p-6 text-white"
      >
        <h1 className="text-center text-3xl font-bold text-yellow-400">Fruit Catch</h1>
        <p className="mb-5 mt-1 text-center text-sm">
          Enter your email and we will send you a link to reset your password.
        </p>

        <label htmlFor="email" className="mb-1 block text-sm">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
          className={inputStyle + ' mb-4'}
        />

        {message && <p className="mb-3 text-center text-sm text-green-300">{message}</p>}
        {error && (
          <p role="alert" className="mb-3 text-center text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-yellow-400 py-2 font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
        >
          {loading ? 'Please wait...' : 'Send reset link'}
        </button>

        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-yellow-400 underline">Back to login</Link>
        </p>
      </form>
    </div>
  )
}