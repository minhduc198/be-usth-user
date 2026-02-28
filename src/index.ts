import express from 'express'
import routes from './routes'
import cors from 'cors'

const app = express()

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API is running 🚀')
})

app.use('/api', routes)

const PORT = Number(process.env.PORT) || 4000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
