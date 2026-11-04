import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import GuestLimit from './pages/GuestLimit'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/ready-to-play" element={<p className="p-10">Ready to Play page</p>} />
        <Route path="/levels" element={<p className="p-10">Level Select page</p>} />
        <Route path="/guest-limit" element={<GuestLimit />} />
      </Routes>
    </BrowserRouter>
  )
}