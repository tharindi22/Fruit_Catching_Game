import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'

const API = 'http://localhost:5000/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // One small function that sends data to the backend
  async function sendToServer(path, body) {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(API + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed.')
      navigate('/levels')
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

  // Email and password login
  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      return setError('Please enter your email and password.')
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError('Please enter a valid email address.')
    }
    sendToServer('/login', { email, password, remember })
  }

  // Google login: Google gives us a token, the server checks it
  function handleGoogleSuccess(response) {
    sendToServer('/google-login', { credential: response.credential })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-6"
      style={{
        backgroundImage:
          "url('/bg.jpg'), linear-gradient(#0b2a1a, #1f6b3a 75%, #14532d)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-yellow-400 bg-black/80 p-6 text-white"
      >
        <h1 className="text-center text-3xl font-bold text-yellow-400">Fruit Catch</h1>
        <p className="mt-1 mb-5 text-center text-sm">
          Welcome back! Log in to continue playing Fruit Catch.
        </p>

        <label htmlFor="email" className="mb-1 block text-sm">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
          className="mb-3 w-full rounded-md border border-white bg-transparent px-3 py-2 text-sm text-white placeholder-gray-300"
        />

        <label htmlFor="password" className="mb-1 block text-sm">Password</label>
        <div className="relative mb-3">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-md border border-white bg-transparent px-3 py-2 pr-14 text-sm text-white placeholder-gray-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="underline">Forgot Password</Link>
        </div>

        {error && (
          <p role="alert" className="mb-3 text-center text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-yellow-400 py-2 font-semibold text-black disabled:opacity-60"
        >
          {loading ? 'Please wait...' : 'Login'}
        </button>

        <div className="my-5 flex items-center gap-5">
          <div className="h-px flex-1 bg-white/30"></div>
          <span className="text-xs text-gray-300">or</span>
          <div className="h-px flex-1 bg-white/30"></div>
        </div>

        {/* Google button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed. Please try again.')}
            theme="filled_white"
            text="continue_with"
            width="336"
          />
        </div>

        <p className="mt-4 text-center text-sm">
          Not a player?{' '}
          <Link to="/create-account" className="text-yellow-400 underline">
            Create Account
          </Link>
        </p>
      </form>
    </div>
  )
}