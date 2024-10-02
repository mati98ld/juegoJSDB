const toastElem = document.getElementById('liveToast')
const toastBody = document.getElementById('toastBody')
const toast = bootstrap.Toast.getOrCreateInstance(toastElem)
const pregunta = document.getElementById('pregunta')

const myModal = new bootstrap.Modal(document.getElementById('myModal'))

const cambiarColorToast = (color) => {
  toastElem.classList.remove(
    'text-bg-success',
    'text-bg-danger',
    'text-bg-warning',
    'top-0',
    'bottom-0',
  )

  if (color == 'final') {
    toastElem.classList.add('text-bg-warning', 'top-0')
  } else if (color != undefined)
    toastElem.classList.add(`text-bg-${color}`, 'bottom-0')
  else toastElem.classList.add('text-bg-warning', 'bottom-0')
}

socket.on('nombreVacio', () => {
  toastBody.innerHTML = 'El nombre no puede estar vacío'
  cambiarColorToast()
  toast.show()
})

socket.on('partidaIniciada', () => {
  toastBody.innerHTML = 'La partida ya ha sido iniciada'
  cambiarColorToast()
  toast.show()
})

socket.on('salaLlena', () => {
  toastBody.innerHTML = 'La sala está llena'
  cambiarColorToast()
  toast.show()
})

const notificarFinPartida = (ganador) => {
  toastBody.innerHTML = `La partida ha finalizado, el ganador es ${ganador}`
  cambiarColorToast('final')
  toast.show()
}

socket.on('partidaFinalizada', (ganador) => {
  myModal.hide()
  pregunta.innerHTML = ''
  notificarFinPartida(ganador)
})

socket.on('nombreRepetido', () => {
  toastBody.innerHTML = 'El nombre ya está en uso'
  cambiarColorToast()
  toast.show()
})

socket.on('yaEstasEnLaSala', () => {
  toastBody.innerHTML = 'Ya estás en la sala'
  cambiarColorToast()
  toast.show()
})

socket.on('colorRepetido', () => {
  toastBody.innerHTML = 'El color ya está en uso'
  cambiarColorToast()
  toast.show()
})

socket.on('salaInexistente', () => {
  toastBody.innerHTML = 'La sala no existe'
  cambiarColorToast()
  toast.show()
})

socket.on('faltanJugadores', () => {
  toastBody.innerHTML = 'Faltan jugadores para iniciar la partida'
  cambiarColorToast()
  toast.show()
})

socket.on('noEsTuTurno', () => {
  toastBody.innerHTML = 'No es tu turno'
  cambiarColorToast('danger')
  toast.show()
})

socket.on('jugadorDesconectado', (data) => {
  if (data.cantJugadores == 1) {
    myModal.hide()
    pregunta.innerHTML = ''
    toastBody.innerHTML = `${data.nombreJugador} se ha desconectado, no hay jugadores suficientes para continuar`
  } else {
    toastBody.innerHTML = `${data.nombreJugador} se ha desconectado, quedan ${data.cantJugadores} jugadores`
  }
  if (data.ultimoEnTirarDado) {
    myModal.hide()
    pregunta.innerHTML = ''
  }
  cambiarColorToast()
  toast.show()
})

socket.on('respuestaIncorrecta', (data) => {
  myModal.hide()
  pregunta.innerHTML = ''
  toastBody.innerHTML = `${data.nombreJugador} contestó mal, la respuesta correcta era ${data.respuesta}`
  cambiarColorToast('danger')
  toast.show()
})

socket.on('respuestaCorrecta', (data) => {
  myModal.hide()
  pregunta.innerHTML = ''
  toastBody.innerHTML = `${data.nombreJugador} contestó bien, la respuesta correcta era ${data.respuesta}`
  cambiarColorToast('success')
  toast.show()
})

socket.on('tiempoTerminado', (data) => {
  myModal.hide()
  pregunta.innerHTML = ''
  toastBody.innerHTML = `${data.nombreJugador} no llegó, la respuesta correcta era ${data.respuesta}`
  cambiarColorToast('danger')
  toast.show()
})

socket.on('preguntaVacia', () => {
  toastBody.innerHTML = 'La pregunta no puede estar vacía'
  cambiarColorToast()
  toast.show()
})

socket.on('opcionesInsuficientes', () => {
  toastBody.innerHTML = 'Deben haber tres opciones'
  cambiarColorToast()
  toast.show()
})

socket.on('opcionVacia', () => {
  toastBody.innerHTML = 'Las opciones no pueden estar vacias'
  cambiarColorToast()
  toast.show()
})

socket.on('correctaInvalida', () => {
  toastBody.innerHTML = 'La respuesta correcta no es válida'
  cambiarColorToast()
  toast.show()
})

socket.on('preguntaRepetida', () => {
  toastBody.innerHTML = 'La pregunta ya existe'
  cambiarColorToast()
  toast.show()
  document.getElementById('archivos').innerHTML = ''
  document.getElementById('formPregunta').reset()
})

socket.on('preguntaGuardada', () => {
  toastBody.innerHTML = 'Pregunta agregada correctamente'
  cambiarColorToast('success')
  toast.show()
  document.getElementById('archivos').innerHTML = ''
  document.getElementById('formPregunta').reset()
})

socket.on('imagenVacia', () => {
  toastBody.innerHTML = 'La imagen no puede estar vacía'
  cambiarColorToast()
  toast.show()
})

socket.on('audioVacio', () => {
  toastBody.innerHTML = 'El audio no puede estar vacío'
  cambiarColorToast()
  toast.show()
})
