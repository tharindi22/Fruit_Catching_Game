import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        {/* Placeholders, we will replace these one by one */}
        <Route path="/ready-to-play" element={<p className="p-10">Ready to Play page</p>} />
        <Route path="/levels" element={<p className="p-10">Level Select page</p>} />
      </Routes>
    </BrowserRouter>
  )
}