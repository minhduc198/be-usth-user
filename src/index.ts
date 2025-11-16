import express from 'express'
import routes from './routes'

const app = express()
app.use(express.json())

app.use('/api', routes)

app.listen(4000, () => {
  console.log(`Server started on http://localhost:4000`)
})
