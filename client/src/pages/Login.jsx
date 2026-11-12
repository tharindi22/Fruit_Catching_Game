
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  
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
        sessionStorage.removeItem('player')

      navigate('/ready-to-play')
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
        <h1 className="text-center text-3xl font-bold text-yellow-400">
          Fruit Catch
        </h1>

        <p className="mt-1 mb-5 text-center text-sm">
          Welcome back! Log in to continue playing Fruit Catch.
        </p>

        {/* Email */}
        <label htmlFor="email" className="mb-1 block text-md">
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
          className="mb-3 w-full rounded-lg border border-white/80 bg-white/5 px-4 py-2 text-white text-sm placeholder-gray-300 outline-none focus:border-yellow-400"
        />

        {/* Password */}
        <label htmlFor="password" className="mb-1 block text-md">
          Password
        </label>

        <div className="relative mb-3">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-lg border border-white/80 bg-white/5 px-4 py-2 pr-10 text-white text-sm placeholder-gray-300 outline-none focus:border-yellow-400"
          />

          {/* Show / Hide Password */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        {/* Remember me and Forgot Password */}
        <div className="mb-4 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>

          <Link to="/forgot-password" className="underline">
            Forgot Password
          </Link>
        </div>

         {/* Loading message */}
        {loading && (
          <p className="mb-3 text-center text-sm text-yellow-300">Signing</p>
        )}

        {/* Error message */}
        {error && (
          <p role="alert" className="mb-3 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Login button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-yellow-400 py-2 font-semibold text-black disabled:opacity-60"
        >
          {loading ? 'Please wait...' : 'Login'}
        </button>

        {/* Divider */}
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
