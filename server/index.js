import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'

const app = express()

// Only our React app may call this server, and it may send cookies
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api', authRoutes)

app.listen(process.env.PORT, () => {
  console.log('Server running on http://localhost:' + process.env.PORT)
})