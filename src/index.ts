import express from 'express'
import routes from './routes'
import cors from 'cors'

const app = express()

app.use(
  cors({
    origin: '*',
    credentials: true
  })
)

app.use(express.json())

app.use('/api', routes)

app.listen(4000, '0.0.0.0', () => {
  console.log('Server running at 4000')
})
