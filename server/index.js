import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import bananaRoutes from './routes/banana.js'
import soundRoutes from './routes/sounds.js'
import passwordRoutes from './routes/password.js'

const app = express()

app.use(cors({ 
  origin: process.env.CLIENT_URL, credentials: true 
}))
app.use(express.json())
app.use(cookieParser())
app.use('/api', authRoutes)
app.use('/api', bananaRoutes)
app.use('/api', soundRoutes)
app.use('/api', passwordRoutes)

app.listen(process.env.PORT, () => {
  console.log('Server running on http://localhost:' + process.env.PORT)
})