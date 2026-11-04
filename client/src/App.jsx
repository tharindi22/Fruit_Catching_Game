import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<p className="p-10">Create Account page</p>} />
        <Route path="/levels" element={<p className="p-10">Level Select page</p>} />
      </Routes>
    </BrowserRouter>
  )
}