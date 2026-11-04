
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff } from 'lucide-react'

const API = 'http://localhost:5000/api'

// Eye button for password visibility
function EyeButton({ show, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
    >
      {show ? <Eye size={20} /> : <EyeOff size={20} />}
    </button>
  )
}

export default function CreateAccount() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Send data to backend
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

      if (!res.ok) throw new Error(data.message || 'Could not create account.')

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

  function handleSubmit(e) {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields.')
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError('Please enter a valid email address.')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.')
    }

    sendToServer('/register', { name, email, password })
  }

  function handleGoogleSuccess(response) {
    sendToServer('/google-login', { credential: response.credential })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-900 bg-[url('/bg.jpg')] bg-cover bg-center px-4 py-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-yellow-400 bg-black/80 p-5 text-white shadow-2xl backdrop-blur-sm"
      >
        <h1 className="text-center text-3xl font-bold text-yellow-400">
          Fruit Catch
        </h1>

        <p className="mb-4 mt-1 text-center text-sm text-gray-200">
          Create your account and start playing Fruit Catch!
        </p>

        {/* Name */}
        <label htmlFor="name" className="mb-1 block text-sm">
          Name
        </label>

        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mb-3 w-full rounded-lg border border-white/80 bg-white/5 px-4 py-2 text-white text-sm placeholder-gray-300 outline-none focus:border-yellow-400"
        />

        {/* Email */}
        <label htmlFor="email" className="mb-1 block text-sm">
          Email
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
          className="mb-3 w-full rounded-lg border border-white/80 bg-white/5 px-4 py-2 text-white text-sm placeholder-gray-300 outline-none focus:border-yellow-400"
        />

        {/* Password */}
        <label htmlFor="password" className="mb-1 block text-sm">
          Password
        </label>

        <div className="relative mb-3">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-lg border border-white/80 bg-white/5 px-4 py-2 pr-10 text-white text-sm placeholder-gray-300 outline-none focus:border-yellow-400"
          />

          <EyeButton
            show={showPassword}
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        {/* Confirm Password */}
        <label htmlFor="confirmPassword" className="mb-1 block text-sm">
          Confirm Password
        </label>

        <div className="relative mb-5">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full rounded-lg border border-white/80 bg-white/5 px-4 py-2 pr-10 text-white text-sm placeholder-gray-300 outline-none focus:border-yellow-400"
          />

          <EyeButton
            show={showConfirm}
            onClick={() => setShowConfirm(!showConfirm)}
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="mb-3 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-yellow-400 py-2 font-semibold text-black disabled:opacity-60"
        >
          {loading ? 'Please wait...' : 'Create Account'}
        </button>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/30"></div>
          <span className="text-xs text-gray-300">or</span>
          <div className="h-px flex-1 bg-white/30"></div>
        </div>

        {/* Google button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign up failed. Please try again.')}
            theme="filled_white"
            text="signup_with"
            width="336"
          />
        </div>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-400 underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  )
}
