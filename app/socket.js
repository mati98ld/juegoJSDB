import { Partida } from './partidaSchema.js'
import { Pregunta } from './preguntaSchema.js'
import fs from 'fs'

const CANTIDAD_MINIMA_JUGADORES = 2
const CANTIDAD_MAXIMA_JUGADORES = 6
const CANTIDAD_DE_CASILLAS = 20

const generarStringAleatorio = (longitud) => {
  let resultado = ''
  const caracteres =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const caracteresLongitud = caracteres.length
  for (let i = 0; i < longitud; i++) {
    resultado += caracteres.charAt(
      Math.floor(Math.random() * caracteresLongitud),
    )
  }
  return resultado
}

export default (io) => {
  const nuevoSuceso = (partida) => {
    let estadoPartida = {
      nombreSala: partida.sala,
      partidaLista:
        partida.jugadoresActivos.length >= CANTIDAD_MINIMA_JUGADORES,
      ganador: partida.ganador,
      casillas: partida.casillas,
      estado: partida.estado,
      numeroDado: partida.numeroDado,
      jugadores: partida.jugadoresActivos.map((jugador) => {
        return {
          nombre: jugador.nombre,
          color: jugador.color,
          posicion: jugador.posicion,
          turno: partida.turnoActual == jugador.id,
        }
      }),
    }
    partida.jugadoresActivos.forEach((jugador) => {
      if (partida.turnoActual == jugador.id) {
        estadoPartida.turnoActual = true
      } else estadoPartida.turnoActual = false
      io.to(jugador.id).emit('estadoPartida', estadoPartida)
    })
  }

  const obtenerPreguntaAleatoria = async (cantidadPreguntas) => {
    return await Pregunta.findOne()
      .skip(Math.floor(Math.random() * cantidadPreguntas))
      .limit(1)
  }

  const turnoAntes = (partida) => {
    return partida.jugadoresActivos.findIndex(
      (jugador) => jugador.id == partida.turnoActual,
    )
  }

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado: ' + socket.id)

    socket.on('crearPartida', async (jugador) => {
      if (jugador.nombre.length == 0) {
        socket.emit('nombreVacio')
      } else {
        jugador.id = socket.id
        jugador.posicion = 0
        let nombreSala = generarStringAleatorio(6)
        while (await Partida.findOne({ sala: nombreSala })) {
          nombreSala = generarStringAleatorio(6)
        }
        socket.join(nombreSala)
        const partida = new Partida({
          estado: 'creada',
          sala: nombreSala,
          casillas: CANTIDAD_DE_CASILLAS,
          turnoActual: null,
          jugadoresActivos: [jugador],
          jugadoresDesconectados: [],
          preguntas: [],
        })
        let response = {
          nombre: nombreSala,
          jugadores: [{ nombre: jugador.nombre, color: jugador.color }],
        }
        await partida.save()
        io.to(nombreSala).emit('partidaCreada', response)
      }
    })

    socket.on('unirSala', async (data) => {
      if (data.jugador.nombre.length == 0) {
        socket.emit('nombreVacio')
      } else {
        let jugador = data.jugador
        jugador.id = socket.id
        jugador.posicion = 0
        let partida = await Partida.findOne({ sala: data.nombreSala })
        if (partida) {
          if (partida.estado == 'iniciada') {
            socket.emit('partidaIniciada')
          } else if (
            partida.jugadoresActivos.length >= CANTIDAD_MAXIMA_JUGADORES
          ) {
            socket.emit('salaLlena')
          } else if (partida.estado == 'finalizada') {
            socket.emit('partidaFinalizada', partida.ganador)
          } else if (
            partida.jugadoresActivos.find(
              (jugador) => jugador.nombre == data.jugador.nombre,
            )
          ) {
            socket.emit('nombreRepetido')
          } else if (
            partida.jugadoresActivos.find((jugador) => jugador.id == socket.id)
          ) {
            socket.emit('yaEstasEnLaSala')
          } else if (
            partida.jugadoresActivos.find(
              (jugador) => jugador.color == data.jugador.color,
            )
          ) {
            socket.emit('colorRepetido')
          } else {
            socket.join(data.nombreSala)
            partida.jugadoresActivos.push(jugador)
            await partida.save()

            let response = {
              nombreSala: data.nombreSala,
              jugadores: partida.jugadoresActivos.map((jugador) => {
                return { nombre: jugador.nombre, color: jugador.color }
              }),
              partidaLista:
                partida.jugadoresActivos.length >= CANTIDAD_MINIMA_JUGADORES,
            }
            io.to(data.nombreSala).emit('nuevoJugador', response)
          }
        } else {
          socket.emit('salaInexistente')
        }
      }
    })

    socket.on('iniciarPartida', async () => {
      let partida = await Partida.findOne({ sala: Array.from(socket.rooms)[1] })
      if (partida) {
        if (partida.jugadoresActivos.length < CANTIDAD_MINIMA_JUGADORES) {
          socket.emit('faltanJugadores')
        } else if (partida.estado == 'creada') {
          partida.turnoActual = socket.id
          partida.estado = 'iniciada'
          partida.save()
          nuevoSuceso(partida)
        }
      }
    })

    socket.on('tirarDado', async () => {
      let partida = await Partida.findOne({ sala: Array.from(socket.rooms)[1] })
      if (partida.estado == 'finalizada') {
        socket.emit('partidaFinalizada', partida.ganador)
      } else {
        if (
          socket.id == partida.turnoActual &&
          socket.id != partida.ultimoEnTirarDado
        ) {
          let numeroDado = Math.floor(Math.random() * 6) + 1
          let cantidadPreguntas = await Pregunta.countDocuments()
          let pregunta = await obtenerPreguntaAleatoria(cantidadPreguntas)
          while (
            partida.preguntas.some((preg) => preg.pregunta == pregunta.pregunta)
          ) {
            pregunta = await obtenerPreguntaAleatoria(cantidadPreguntas)
          }
          partida.preguntas.push(pregunta)
          partida.ultimoEnTirarDado = socket.id
          partida.numeroDado = numeroDado
          await partida.save()
          const data = {
            numeroDado: partida.numeroDado,
            turnoActual: true,
            tiempo: 15,
            pregunta: partida.preguntas[partida.preguntas.length - 1].pregunta,
            opciones: partida.preguntas[partida.preguntas.length - 1].opciones,
          }
          if (partida.preguntas[partida.preguntas.length - 1].imagen) {
            data.imagen = partida.preguntas[partida.preguntas.length - 1].imagen
          }
          if (partida.preguntas[partida.preguntas.length - 1].audio) {
            data.audio = partida.preguntas[partida.preguntas.length - 1].audio
          }
          socket.emit('resultadoTirada', data)
          data.turnoActual = false
          socket.to(partida.sala).emit('resultadoTirada', data)
        } else {
          socket.emit('noEsTuTurno')
        }
      }
    })

    socket.on('finDeTurno', async (data) => {
      let partida = await Partida.findOne({ sala: Array.from(socket.rooms)[1] })
      if (partida.estado == 'finalizada') {
        socket.emit('partidaFinalizada', partida.ganador)
      } else {
        if (socket.id == partida.turnoActual) {
          let turnoAnterior = turnoAntes(partida)
          let response = {
            nombreJugador: partida.jugadoresActivos[turnoAnterior].nombre,
            respuesta:
              partida.preguntas[partida.preguntas.length - 1].opciones[
                partida.preguntas[partida.preguntas.length - 1].correcta
              ],
          }
          if (data.respuesta == 7) {
            io.to(partida.sala).emit('tiempoTerminado', response)
          } else if (
            data.respuesta ==
            partida.preguntas[partida.preguntas.length - 1].correcta
          ) {
            io.to(partida.sala).emit('respuestaCorrecta', response)
            if (
              partida.jugadoresActivos[turnoAnterior].posicion +
                partida.numeroDado >
              partida.casillas
            ) {
              partida.jugadoresActivos[turnoAnterior].posicion =
                partida.casillas + 1
              partida.ganador = partida.jugadoresActivos[turnoAnterior].nombre
              partida.estado = 'finalizada'
              nuevoSuceso(partida)
            } else {
              partida.jugadoresActivos[turnoAnterior].posicion +=
                partida.numeroDado
              nuevoSuceso(partida)
            }
          } else {
            io.to(partida.sala).emit('respuestaIncorrecta', response)
          }

          if (turnoAnterior == partida.jugadoresActivos.length - 1) {
            partida.turnoActual = partida.jugadoresActivos[0].id
          } else {
            partida.turnoActual = partida.jugadoresActivos[turnoAnterior + 1].id
          }

          await partida.save()
          nuevoSuceso(partida)
        } else {
          socket.emit('noEsTuTurno')
        }
      }
    })

    socket.on('disconnect', async () => {
      console.log('Cliente desconectado: ' + socket.id)
      let partida = await Partida.findOne({
        jugadoresActivos: { $elemMatch: { id: socket.id } },
      })
      if (partida) {
        let response = {
          nombreJugador: partida.jugadoresActivos.find(
            (jugador) => jugador.id == socket.id,
          ).nombre,
          cantJugadores: partida.jugadoresActivos.length - 1,
          ultimoEnTirarDado: partida.ultimoEnTirarDado == socket.id,
        }

        let turnoAnterior = turnoAntes(partida)

        if (partida.jugadoresActivos.length > 1) {
          if (partida.turnoActual == socket.id) {
            if (turnoAnterior == partida.jugadoresActivos.length - 1) {
              partida.turnoActual = partida.jugadoresActivos[0].id
            } else {
              partida.turnoActual =
                partida.jugadoresActivos[turnoAnterior + 1].id
            }
          }
        }

        if (partida.estado != 'creada')
          partida.jugadoresDesconectados.push(
            partida.jugadoresActivos.find((jugador) => jugador.id == socket.id),
          )

        partida.jugadoresActivos = partida.jugadoresActivos.filter(
          (jugador) => jugador.id != socket.id,
        )

        await partida.save()
        io.to(partida.sala).emit('jugadorDesconectado', response)

        nuevoSuceso(partida)

        if (
          partida.jugadoresActivos.length == 1 &&
          partida.estado == 'iniciada'
        ) {
          partida.estado = 'finalizada'
          partida.ganador = partida.jugadoresActivos[0].nombre
          await partida.save()
          nuevoSuceso(partida)
        }

        if (
          partida.jugadoresActivos.length == 0 &&
          partida.estado == 'creada'
        ) {
          await Partida.deleteOne({ sala: partida.sala })
        }
      }
    })

    socket.on('salirDePartida', async () => {
      let partida = await Partida.findOne({
        jugadoresActivos: {
          $elemMatch: { id: socket.id },
        },
      })

      socket.leave(partida.sala)

      if (partida) {
        let response = {
          nombreJugador: partida.jugadoresActivos.find(
            (jugador) => jugador.id == socket.id,
          ).nombre,
          cantJugadores: partida.jugadoresActivos.length - 1,
        }

        if (partida.estado != 'creada')
          partida.jugadoresDesconectados.push(
            partida.jugadoresActivos.find((jugador) => jugador.id == socket.id),
          )

        partida.jugadoresActivos = partida.jugadoresActivos.filter(
          (jugador) => jugador.id != socket.id,
        )

        await partida.save()
        io.to(partida.sala).emit('jugadorDesconectado', response)
        nuevoSuceso(partida)

        if (
          partida.jugadoresActivos.length == 0 &&
          partida.estado == 'creada'
        ) {
          await Partida.deleteOne({ sala: partida.sala })
        }
      }
    })

    socket.on('agregarPregunta', async (data) => {
      if (data.pregunta.length == 0) {
        socket.emit('preguntaVacia')
      } else if (data.opciones.length < 2) {
        socket.emit('opcionesInsuficientes')
      } else if (data.correcta < 0 || data.correcta >= data.opciones.length) {
        socket.emit('correctaInvalida')
      } else if (data.opciones.some((opcion) => opcion.length == 0)) {
        socket.emit('opcionVacia')
      } else if (await Pregunta.findOne({ pregunta: data.pregunta })) {
        socket.emit('preguntaRepetida')
      } else if (data.imagen && data.imagenData.length == 0) {
        socket.emit('imagenVacia')
      } else if (data.audio && data.audioData.length == 0) {
        socket.emit('audioVacio')
      } else {
        let pregunta = new Pregunta({
          pregunta: data.pregunta,
          opciones: data.opciones,
          correcta: data.correcta,
        })
        if (data.imagen) {
          let tipoArchivo = data.imagen.split('.').pop()
          let stringAleatorio = generarStringAleatorio(6)
          pregunta.imagen = socket.id + stringAleatorio + '.' + tipoArchivo
          fs.writeFileSync(
            'public/img/' + socket.id + stringAleatorio + '.' + tipoArchivo,
            data.imagenData,
            'base64',
          )
        }
        if (data.audio) {
          let tipoArchivo = data.audio.split('.').pop()
          let stringAleatorio = generarStringAleatorio(6)
          pregunta.audio = socket.id + stringAleatorio + '.' + tipoArchivo
          fs.writeFileSync(
            'public/audios/' + socket.id + stringAleatorio + '.' + tipoArchivo,
            data.audioData,
            'base64',
          )
        }
        await pregunta.save()
        socket.emit('preguntaGuardada')
      }
    })
  })
}

Partida.deleteMany({
  $or: [
    { estado: { $ne: 'finalizada' } },
    { jugadoresActivos: { $exists: true, $not: { $size: 0 } } },
  ],
}).then(() => {
  console.log('Partidas no finalizadas o con jugadores activos eliminadas')
})
