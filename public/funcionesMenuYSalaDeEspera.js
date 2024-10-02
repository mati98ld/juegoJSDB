const socket = io()

const dibujarMenu = () => {
  btnCrearSala = document.createElement('button')
  btnCrearSala.innerHTML = 'Crear sala'
  btnCrearSala.type = 'button'
  btnCrearSala.id = 'btnCrearSala'
  btnCrearSala.classList.add('btn', 'btn-warning', 'mb-5')

  btnUnirme = document.createElement('button')
  btnUnirme.innerHTML = 'Unirme'
  btnUnirme.type = 'button'
  btnUnirme.classList.add('btn', 'btn-warning', 'm-2', 'mb-3')
  btnUnirme.addEventListener('click', () => {
    let jugadorDatos = {
      nombre: document.getElementById('nombre').value,
      color: document.getElementById('selectorColor').value,
    }
    let data = {
      nombreSala: document.getElementById('nombreSala').value,
      jugador: jugadorDatos,
    }
    socket.emit('unirSala', data)
  })

  containerGame.innerHTML = `
    <h1>Menu</h1>
    <div class="grid gap-3">
    <div class="p-2 g-col-6">
    <input type="text" id="nombre" placeholder="Nombre jugador" class="text-center" required>
    <div class="m-1">
    <label for="selectorColor">Elija color de ficha:</label>
    <input type="color" id="selectorColor" value="#ff0000" required>
    </div>
    </div>`
  containerGame.appendChild(btnCrearSala)

  containerGame.innerHTML += `
    <h2 class="mt-1">Unirme a una sala</h2>
    <div class="p-2 g-col-6">
    <input type="text" id="nombreSala" placeholder="Codigo de la sala" class="text-center" required>
    </div>
    </div>
    `
  containerGame.appendChild(btnUnirme)

  document.getElementById('btnCrearSala').addEventListener('click', () => {
    let jugadorDatos = {
      nombre: document.getElementById('nombre').value,
      color: document.getElementById('selectorColor').value,
    }
    socket.emit('crearPartida', jugadorDatos)
  })

  let gestorPreguntas = document.createElement('div')
  gestorPreguntas.id = 'gestorPreguntas'
  gestorPreguntas.style.display = 'none'
  gestorPreguntas.classList.add('mt-5', 'p-1')
  gestorPreguntas.innerHTML = `
  <h2>Gestor de preguntas</h2>
  <button class="btn btn-warning" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample" id="toggleCard">
   Abrir gestor
  </button>
  <div class="collapse" id="collapseExample">
  <form id="formPregunta">
  <div class="card card-body gestor">
  <select class="form-select bg-black text-warning" id="tipoPregunta">
  <option selected value="clasic">Sin multimedia</option>
  <option value="image">Con imagen</option>
  <option value="audio">Con audio</option>
  </select>
  <div id="archivos"></div>
  <div class="input-group">
  <span class="input-group-text text-warning bg-black">Escriba una pregunta :</span>
      <input type="text" class="form-control text-center text-warning bg-black" id="pregunta" placeholder="¿Ejemplo de pregunta?" required>
    </div>
    <div class="input-group">
    <span class="input-group-text text-warning bg-black">Opcion 1</span>
      <input type="text" class="form-control text-center text-warning bg-black" id="opcion1" placeholder="Escriba una opcion" required>
      </div>
      <div class="input-group">
      <span class="input-group-text text-warning bg-black">Opcion 2</span>
      <input type="text" class="form-control text-center text-warning bg-black" id="opcion2" placeholder="Escriba una opcion" required>
      </div>
      <div class="input-group">
      <span class="input-group-text text-warning bg-black">Opcion 3</span>
      <input type="text" class="form-control text-center text-warning bg-black" id="opcion3" placeholder="Escriba una opcion" required>
    </div>
    <div class="input-group">
    <span class="input-group-text text-warning bg-black">Seleccione la opcion correcta</span>
    <select class="form-select form-control text-center text-warning bg-black" id="correcta" required>
    <option value="0">Opcion 1</option>
        <option value="1">Opcion 2</option>
        <option value="2">Opcion 3</option>
      </select>
    </div>
    <button type="submit" class="btn btn-warning">Agregar pregunta</button>
  </div>
  </form>
  </div>
    `

  containerGame.appendChild(gestorPreguntas)
  document.getElementById('formPregunta').addEventListener('submit', (e) => {
    e.preventDefault()
    let data = {
      pregunta: document.getElementById('pregunta').value,
      opciones: [
        document.getElementById('opcion1').value,
        document.getElementById('opcion2').value,
        document.getElementById('opcion3').value,
      ],
      correcta: document.getElementById('correcta').value,
    }
    if (document.getElementById('image')) {
      data.imagen = document.getElementById('image').files[0].name
      data.imagenData = document.getElementById('image').files[0]
    }
    if (document.getElementById('audio')) {
      data.audio = document.getElementById('audio').files[0].name
      data.audioData = document.getElementById('audio').files[0]
    }
    socket.emit('agregarPregunta', data)
  })

  let collapse = document.getElementById('collapseExample')
  let btnToggle = document.getElementById('toggleCard')
  collapse.addEventListener('shown.bs.collapse', () => {
    btnToggle.classList.remove('btn-warning')
    btnToggle.classList.add('btn-outline-warning')
    btnToggle.innerHTML = 'Cerrar gestor'
  })
  collapse.addEventListener('hidden.bs.collapse', () => {
    btnToggle.classList.remove('btn-outline-warning')
    btnToggle.classList.add('btn-warning')
    btnToggle.innerHTML = 'Abrir gestor'
  })

  let tipoPregunta = document.getElementById('tipoPregunta')
  tipoPregunta.addEventListener('change', () => {
    let archivos = document.getElementById('archivos')
    let div = document.createElement('div')
    div.classList.add('input-group')
    let span = document.createElement('span')
    span.classList.add('input-group-text', 'text-warning', 'bg-black')
    let input = document.createElement('input')
    input.classList.add('form-control')
    input.type = 'file'
    input.id = 'audio'
    input.required = true
    if (tipoPregunta.value == 'image') {
      span.innerHTML = 'Subi tu imagen acá :'
      input.id = 'image'
      input.accept = '.jpg, .jpeg, .png, .webp'
      archivos.innerHTML = ''
      div.appendChild(span)
      div.appendChild(input)
      archivos.appendChild(div)
    } else if (tipoPregunta.value == 'audio') {
      span.innerHTML = 'Subi tu audio acá :'
      input.accept = '.mp3'
      archivos.innerHTML = ''
      div.appendChild(span)
      div.appendChild(input)
      archivos.appendChild(div)
    } else {
      archivos.innerHTML = ''
    }
  })
}

const containerGame = document.getElementById('containerGame')

const btnVolerAlMenu = () => {
  let btnVolver = document.createElement('button')
  btnVolver.innerHTML = 'Volver al menu'
  btnVolver.type = 'button'
  btnVolver.classList.add('btn', 'btn-warning', 'm-2')
  btnVolver.addEventListener('click', () => {
    dibujarMenu()
    socket.emit('salirDePartida')
  })
  return btnVolver
}

const dibujarSalaDeEspera = (nombre, dataJugadores, partidaLista) => {
  containerGame.innerHTML = ''
  const salaEspera = document.createElement('div')
  salaEspera.id = 'salaEspera'
  salaEspera.innerHTML = `
    <h1>Sala de espera</h1>
    <h2>Codigo de la sala: ${nombre}</h2>
    <p>Esperando jugadores...</p>
  `
  let jugadoresConectados = document.createElement('ul')
  jugadoresConectados.id = 'jugadoresConectados'
  salaEspera.appendChild(jugadoresConectados)
  containerGame.appendChild(salaEspera)

  let jugadores = document.getElementById('jugadoresConectados')
  jugadores.innerHTML = ''
  dataJugadores.forEach((jugador) => {
    jugadores.innerHTML += `<li style="color: ${jugador.color}">${jugador.nombre}</li>`
  })

  if (partidaLista) {
    if (!document.getElementById('btnIniciar')) {
      let btnIniciar = document.createElement('button')
      btnIniciar.type = 'button'
      btnIniciar.classList.add('btn', 'btn-warning', 'm-2')
      btnIniciar.innerHTML = 'Iniciar partida'
      btnIniciar.id = 'btnIniciar'
      btnIniciar.addEventListener('click', () => {
        socket.emit('iniciarPartida')
      })
      containerGame.appendChild(btnIniciar)
    }
  }

  let regresar = document.createElement('div')
  regresar.classList.add('mt-5')
  let btnVolver = btnVolerAlMenu()
  btnVolver.classList.add('mt-5')
  regresar.appendChild(btnVolver)
  containerGame.appendChild(regresar)
}
