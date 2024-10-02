socket.on('partidaCreada', (data) => {
  dibujarSalaDeEspera(data.nombre, data.jugadores)
})

socket.on('nuevoJugador', (data) => {
  dibujarSalaDeEspera(data.nombreSala, data.jugadores, data.partidaLista)
})

socket.on('resultadoTirada', (data) => {
  let btnDado = document.getElementById('btnDado')
  if (btnDado) btnDado.remove()
  let dado = document.getElementById('dado')
  dado.src = `/img/dado.gif`
  setTimeout(() => {
    dado.src = `/img/dado${data.numeroDado}.png`
    setTimeout(() => {
      dibujarResultadoTirada(data)
      myModal.show()
      updateClock(data.tiempo, data.turnoActual)
    }, 2000)
  }, 2500)
})

socket.on('estadoPartida', (data) => {
  if (data.estado == 'creada') {
    dibujarSalaDeEspera(data.nombreSala, data.jugadores, data.partidaLista)
  } else {
    dibujarTablero(data.casillas, data.jugadores, data.numeroDado, data.estado)
    let btnDado = document.getElementById('btnDado')
    if (data.turnoActual && data.estado != 'finalizada') {
      if (!btnDado) {
        btnDado = document.createElement('button')
        btnDado.id = 'btnDado'
        btnDado.innerHTML = 'Tirar dado'
        btnDado.type = 'button'
        btnDado.classList.add('btn', 'btn-warning', 'm-2')
        btnDado.addEventListener('click', () => {
          socket.emit('tirarDado')
        })
        document.getElementById('dadoSector').appendChild(btnDado)
      }
    } else {
      if (btnDado) {
        btnDado.remove()
      }
    }

    if (data.estado == 'finalizada') {
      notificarFinPartida(data.ganador)
      let h1 = document.createElement('h1')
      h1.id = 'finPartida'
      h1.innerHTML = 'Fin de la partida, el ganador es: ' + data.ganador
      let footer = document.getElementById('footer')
      footer.appendChild(h1)
      let btnVolver = btnVolerAlMenu()
      footer.appendChild(btnVolver)
    }
  }
})

window.onload = dibujarMenu()
