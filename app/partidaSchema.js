import mongoose from 'mongoose'

const partidaSchema = new mongoose.Schema({
  ganador: String,
  estado: String,
  sala: String,
  casillas: Number,
  turnoActual: String,
  ultimoEnTirarDado: String,
  numeroDado: Number,
  jugadoresActivos: [
    {
      id: String,
      nombre: String,
      color: String,
      posicion: Number,
    },
  ],
  jugadoresDesconectados: [
    {
      id: String,
      nombre: String,
      color: String,
      posicion: Number,
    },
  ],
  preguntas: [
    {
      pregunta: String,
      opciones: [String],
      correcta: Number,
      imagen: String,
      audio: String,
    },
  ],
})

export const Partida = mongoose.model('Partida', partidaSchema)
