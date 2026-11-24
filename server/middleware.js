import jwt from 'jsonwebtoken'

export function readUser(req, res, next) {
  try {
    req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
  } catch {
    req.user = null
  }
  next()
}

export function requireLogin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Please log in.' })
  next()
}