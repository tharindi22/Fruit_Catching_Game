import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import GuestLimit from './pages/GuestLimit'
import ReadyToPlay from './pages/ReadyToPlay'
import HowToPlay from './pages/HowToPlay'
import Game from './pages/Game'

// Temporary page, we build the real Game Over page next
function GameOverTemp() {
  const { state } = useLocation()
  return (
    <div className="p-10 text-white">
      <p>Game over ({state?.reason}). Score: {state?.score}</p>
      <Link to="/ready-to-play" className="underline">Back to home</Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/guest-limit" element={<GuestLimit />} />
        <Route path="/ready-to-play" element={<ReadyToPlay />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game-over" element={<GameOverTemp />} />
        {/* Placeholders, we will replace these one by one */}
        <Route
          path="/levels"
          element={
            <Link to="/ready-to-play" className="block p-10 text-white underline">
              Level Select (coming later). Click here to continue.
            </Link>
          }
        />
        <Route path="/leaderboard" element={<p className="p-10 text-white">Leaderboard page</p>} />
      </Routes>
    </BrowserRouter>
  )
}