import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/juego.html'))
})

router.post('/', (req, res) => {
  console.log(req)
  res.send('Request POST')
})

router.put('/', (req, res) => {
  res.send('Request PUT')
})

router.delete('/', (req, res) => {
  console.log(req)
  res.send('Request DELETE')
})

export default router
