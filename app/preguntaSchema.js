import mongoose from 'mongoose'

const preguntaSchema = new mongoose.Schema({
  pregunta: String,
  opciones: [String],
  correcta: Number,
  imagen: String,
  audio: String,
})

export const Pregunta = mongoose.model('Pregunta', preguntaSchema)
