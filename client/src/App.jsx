import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import GuestLimit from './pages/GuestLimit'
import ReadyToPlay from './pages/ReadyToPlay'
import HowToPlay from './pages/HowToPlay'
import LevelSelect from './pages/LevelSelect'
import Game from './pages/Game'
import LevelComplete from './pages/LevelComplete'
import GameOver from './pages/GameOver'

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
        <Route path="/levels" element={<LevelSelect />} />
        <Route path="/game/:level" element={<Game />} />
        <Route path="/level-complete" element={<LevelComplete />} />
        <Route path="/game-over" element={<GameOver />} />
        <Route path="/leaderboard" element={<p className="p-10 text-white">Leaderboard page</p>} />
      </Routes>
    </BrowserRouter>
  )
}