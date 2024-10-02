function init() {
  let sincroBtn = document.getElementById('sincronizar')

  let audio = document.getElementById('cancion')
  document.body.addEventListener('click', () => audio.play())

  for (let i = 1; i <= 9; i++) {
    document.getElementById(`page${i}`).addEventListener('click', () => {
      obtenerPersonajesPorPagina(i)
    })
  }

  const desclickearBtn = () => {
    for (let i = 1; i <= 9; i++) {
      if (document.getElementById(`page${i}`).value == 'true') {
        document.getElementById(`page${i}`).value = false
        document.getElementById(`page${i}`).classList.remove('active')
      }
    }
  }

  const obtenerPersonajesPorPagina = (pagina) => {
    fetch('https://swapi.dev/api/people/?page=' + pagina)
      .then((response) => response.json())
      .then((data) => {
        agregarPersonajes(data)
        desclickearBtn()
        document.getElementById(`page${pagina}`).value = true
        document.getElementById(`page${pagina}`).classList.add('active')
      })
      .catch((error) => console.error('Error:', error))
  }

  const desclickearPersonajes = () => {
    let lista = document.getElementById('personajes').children
    Array.from(lista).forEach((elem) => {
      if (elem.value) {
        elem.value = false
        elem.classList.remove('active')
      }
    })
  }

  const agregarPersonajes = (data) => {
    let listaPersonajes = document.getElementById('personajes')
    listaPersonajes.innerHTML = ''

    data.results.forEach((personaje) => {
      let unPersonaje = document.createElement('li')
      unPersonaje.innerHTML = personaje.name
      unPersonaje.id = personaje.url.match(/\d+/)[0]
      unPersonaje.addEventListener('click', () => {
        obtenerDetalles(unPersonaje.id)
        desclickearPersonajes()
        unPersonaje.value = true
        unPersonaje.classList.add('active')
        sincroBtn.classList.remove('none')
      })
      listaPersonajes.appendChild(unPersonaje)
    })
  }

  const obtenerDetalles = (id) => {
    sincroBtn.value = id
    fetch(`https://swapi.dev/api/people/${id}`)
      .then((response) => response.json())
      .then((data) => {
        mostrarInformacion(data)
      })
      .catch((error) => console.error('Error:', error))
  }

  const obtenerPeliculas = (urls, peliculas) => {
    urls.forEach((url) => {
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          let li = document.createElement('li')
          li.innerHTML = 'Episodio ' + data.episode_id + ': ' + data.title
          peliculas.appendChild(li)
        })
        .catch((error) => console.error('Error: ', error))
    })
  }

  const obtenerPlaneta = (url, planeta) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        planeta.innerHTML = `Planeta: <span>${data.name}<span/>`
      })
      .catch((error) => console.error('Error: ', error))
  }

  const obtenerEspeciesLenguaje = (urls, especies) => {
    let h3 = document.createElement('h3')
    h3.innerHTML = 'Especie: '
    if (urls.length != 0) {
      urls.forEach((url) => {
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            let span = document.createElement('span')
            span.innerHTML = data.name
            h3.appendChild(span)
            especies.appendChild(h3)
            if (data.language != 'n/a') {
              let lenguaje = document.createElement('h3')
              lenguaje.innerHTML = `Lenguaje: <span>${data.language}<span/>`
              especies.appendChild(lenguaje)
            }
          })
          .catch((error) => console.error('Error: ', error))
      })
    }
  }

  const mostrarInformacion = (personaje) => {
    let detalle = document.getElementById('detalle')
    detalle.innerHTML = ''
    let name = document.createElement('h1')
    name.id = 'name'
    name.innerHTML = personaje.name
    detalle.appendChild(name)

    let descripcion = document.createElement('ul')
    let alto = document.createElement('li')
    alto.innerHTML = `Alto: ${personaje.height} cm`
    let colorPelo = document.createElement('li')
    colorPelo.innerHTML = `Color de pelo: ${personaje.hair_color}`
    let colorOjos = document.createElement('li')
    colorOjos.innerHTML = `Color de ojos: ${personaje.eye_color}`
    let genero = document.createElement('li')
    genero.innerHTML = `Género: ${personaje.gender}`

    descripcion.innerHTML = '<h3>Descripción<h3/>'
    descripcion.appendChild(alto)
    descripcion.appendChild(colorPelo)
    descripcion.appendChild(colorOjos)
    descripcion.appendChild(genero)

    detalle.appendChild(descripcion)

    let peliculas = document.createElement('ul')
    peliculas.innerHTML = '<h3>Películas: <h3/>'
    obtenerPeliculas(personaje.films, peliculas)
    detalle.appendChild(peliculas)

    let planeta = document.createElement('h3')
    obtenerPlaneta(personaje.homeworld, planeta)

    let ultSeccion = document.createElement('div')
    ultSeccion.appendChild(planeta)

    obtenerEspeciesLenguaje(personaje.species, ultSeccion)
    ultSeccion.id = 'ultSeccion'
    detalle.appendChild(ultSeccion)
  }

  obtenerPersonajesPorPagina(1)

  let socket = new WebSocket(
    'wss://oak738x1eh.execute-api.us-east-2.amazonaws.com/production/',
  )

  sincroBtn.addEventListener('click', () => {
    let msg = {
      action: 'sendmessage',
      id: sincroBtn.value,
    }
    socket.send(JSON.stringify(msg))
    console.log('Mensaje enviado: ', msg.id)
  })

  socket.onmessage = function (e) {
    let personaje = JSON.parse(e.data)
    console.log('Mensaje recibido: ', personaje.id)
    obtenerDetalles(personaje.id)
    desclickearPersonajes()
    sincroBtn.value = personaje.id
    let personLista = document.getElementById(personaje.id)
    if (personLista != undefined) {
      personLista.value = true
      personLista.classList.add('active')
    }
  }
}

window.onload = init
