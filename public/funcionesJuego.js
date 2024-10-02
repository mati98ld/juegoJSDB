const updateClock = (totalTime, turno) => {
  let countdaown = document.getElementById('countdown')
  if (!countdaown) return
  countdaown.innerHTML = totalTime
  if (totalTime == 0) {
    if (turno) socket.emit('finDeTurno', { respuesta: 7 })
  } else {
    totalTime -= 1
    setTimeout(() => updateClock(totalTime, turno), 1000)
  }
}

const dibujarTablero = (cantCasillas, jugadores, numeroDado, estado) => {
  containerGame.innerHTML = '<h1>Tablero</h1>'
  let tablero = document.createElement('div')
  tablero.id = 'tablero'
  let cabecera = document.createElement('div')
  cabecera.id = 'cabecera'
  let dado = document.createElement('img')
  dado.id = 'dado'
  if (numeroDado) {
    dado.src = `/img/dado${numeroDado}.png`
  } else {
    dado.src = `/img/dadoInicial.png`
  }
  let dadoSector = document.createElement('div')
  dadoSector.id = 'dadoSector'
  dadoSector.appendChild(dado)

  let divJugadores = document.createElement('div')
  divJugadores.id = 'divJugadores'
  const listarJugadores = (jugadores) => {
    let jugadoresList = document.createElement('ul')
    jugadoresList.classList.add('list-group', 'list-group-flush')
    jugadores.forEach((jugador) => {
      let jugadorItem = document.createElement('li')
      jugadorItem.classList.add('list-group-item')
      if (jugador.turno && estado != 'finalizada')
        jugadorItem.innerHTML = `${jugador.nombre} (Turno actual)`
      else jugadorItem.innerHTML = jugador.nombre
      jugadorItem.style.color = jugador.color
      jugadoresList.appendChild(jugadorItem)
    })
    divJugadores.appendChild(jugadoresList)
  }

  if (jugadores.length > 3) {
    listarJugadores(jugadores.slice(0, 3))
    listarJugadores(jugadores.slice(3))
  } else {
    listarJugadores(jugadores)
  }

  let largada = document.createElement('div')
  largada.id = 'largada'
  largada.innerHTML = 'Largada'
  largada.classList.add('casilla', 'm-2', 'largada')
  let llegada = document.createElement('div')
  llegada.id = 'llegada'
  llegada.classList.add('casilla', 'm-2', 'llegada')
  llegada.innerHTML = 'Llegada'
  for (let i = 0; i <= cantCasillas + 1; i++) {
    let casilla = document.createElement('div')
    if (!(i == 0 || i == cantCasillas + 1)) {
      casilla.innerHTML = i
      casilla.classList.add('casilla')
      tablero.appendChild(casilla)
    }
    let jugadoresEnCasilla = jugadores.filter(
      (jugador) => jugador.posicion == i,
    )
    if (jugadoresEnCasilla.length > 0) {
      jugadoresEnCasilla.forEach((jugador, index) => {
        let ficha = document.createElement('div')
        ficha.style.backgroundColor = jugador.color
        ficha.classList.add('ficha', `ficha${index}`)
        if (i == 0) largada.appendChild(ficha)
        else if (i == cantCasillas + 1) llegada.appendChild(ficha)
        else casilla.appendChild(ficha)
      })
    }
  }
  let footer = document.createElement('div')
  footer.id = 'footer'
  footer.appendChild(llegada)
  cabecera.appendChild(largada)
  cabecera.appendChild(dadoSector)
  cabecera.appendChild(divJugadores)
  containerGame.appendChild(cabecera)
  containerGame.appendChild(tablero)
  containerGame.appendChild(footer)
}

const dibujarResultadoTirada = (data) => {
  let pregunta = document.getElementById('pregunta')
  let form = document.createElement('form')
  form.id = 'formRespuesta'
  form.classList.add('form-check')
  let header = document.createElement('div')
  let h3 = document.createElement('h3')
  h3.innerHTML = data.pregunta
  header.appendChild(h3)
  let countdown = document.createElement('div')
  countdown.id = 'countdown'
  header.appendChild(countdown)
  if (data.imagen) {
    let img = document.createElement('img')
    img.src = `/img/${data.imagen}`
    header.appendChild(img)
  }
  if (data.audio) {
    let sound = document.createElement('audio')
    sound.controls = true
    sound.autoplay = true
    let source = document.createElement('source')
    source.src = `/audios/${data.audio}`
    source.type = 'audio/mp3'
    sound.appendChild(source)
    header.appendChild(sound)
  }
  form.appendChild(header)
  let opciones = document.createElement('div')
  opciones.id = 'opciones'
  data.opciones.forEach((opcion, index) => {
    let div = document.createElement('div')
    let input = document.createElement('input')
    input.type = 'radio'
    input.name = 'respuesta'
    input.value = index
    input.classList.add('form-check-input')
    if (data.turnoActual) div.appendChild(input)
    let label = document.createElement('label')
    label.innerHTML = opcion
    label.classList.add('form-check-label')
    div.appendChild(label)
    opciones.appendChild(div)
  })
  form.appendChild(opciones)
  let btnResponder = document.createElement('button')
  btnResponder.innerHTML = 'Responder'
  btnResponder.type = 'submit'
  btnResponder.id = 'btnResponder'
  btnResponder.classList.add('btn', 'btn-warning', 'm-2')
  if (data.turnoActual) form.appendChild(btnResponder)
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    let respuesta = {
      respuesta: form.elements['respuesta'].value
        ? form.elements['respuesta'].value
        : 5,
    }
    socket.emit('finDeTurno', respuesta)
    pregunta.innerHTML = ''
  })
  pregunta.appendChild(form)
}
