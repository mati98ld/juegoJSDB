import ejs from 'ejs'
import express from 'express'
import { fileURLToPath } from 'url'
import indexRouter from './routes/index.js'
import path from 'path'
import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'
import { connectDB } from './db.js'
import socket from './socket.js'

connectDB()

const app = express()
app.use(cors())
const port = process.env.PORT || 3030
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Crear servidor HTTP a partir de la aplicación Express
const server = createServer(app)

// Configuración de vistas: lee los archivos .ejs de la carpeta views
app.set('views', path.join(__dirname, '..', 'views'))
app.engine('html', ejs.renderFile)
app.set('view engine', 'ejs')

// Middleware para parsear el body de las peticiones
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')))

// Configuración de rutas
app.use('/', indexRouter)

// Cambiar app.listen por server.listen para integrar socket.io
const httpServer = server.listen(port, () => {
  console.log(`Servidor escuchando en ${port}`)
})

// Adjuntar socket.io al servidor HTTP
const io = new SocketIOServer(httpServer)
socket(io)
