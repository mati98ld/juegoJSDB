// ejercicio 16

let formImagen = document.getElementById('formularioImagen')
let inputImagen = document.getElementById('inputImagen')
let imagenes = [
  document.getElementById('imagen-1'),
  document.getElementById('imagen-2'),
  document.getElementById('imagen-3'),
]

formImagen.addEventListener('submit', function (event) {
  event.preventDefault()
  let imagen
  switch (inputImagen.value.toLowerCase()) {
    case 'imagen 1':
      imagen = imagenes[0]
      break
    case 'imagen 2':
      imagen = imagenes[1]
      break
    case 'imagen 3':
      imagen = imagenes[2]
  }
  if (inputImagen.value == '') alert('El campo está vacio')
  else if (imagen == null) alert('Por favor ingresar una imagen existente')
  else {
    esconderImagenes()
    imagen.classList.remove('esconder')
    imagen.classList.add('mostrar')
  }
})

const esconderImagenes = () => {
  imagenes.forEach((e) => {
    if (e.classList.contains('mostrar')) {
      e.classList.remove('mostrar')
      e.classList.add('esconder')
    }
  })
}

//ejercicio 17
let btnImg1 = document.getElementById('btn-img1')
let btnImg2 = document.getElementById('btn-img2')
let btnImg3 = document.getElementById('btn-img3')
let btnTodas = document.getElementById('btn-todas')
let btnNinguna = document.getElementById('btn-ninguna')

btnImg1.addEventListener('click', function () {
  esconderImagenes()
  let img1 = document.getElementById(btnImg1.value)
  img1.classList.add('mostrar')
})

btnImg2.addEventListener('click', () => {
  esconderImagenes()
  let img2 = document.getElementById(btnImg2.value)
  img2.classList.add('mostrar')
})

btnImg3.addEventListener('click', () => {
  esconderImagenes()
  let img3 = document.getElementById(btnImg3.value)
  img3.classList.add('mostrar')
})

btnTodas.addEventListener('click', () => {
  document.getElementById(btnImg1.value).classList.add('mostrar')
  document.getElementById(btnImg2.value).classList.add('mostrar')
  document.getElementById(btnImg3.value).classList.add('mostrar')
})

btnNinguna.addEventListener('click', esconderImagenes)

// ejercicio 18

let fondoSelector = document.getElementById('fondoSelector')
let btnEjer18 = document.getElementById('btnSelectorFondo')

const cambiarFondo = () => {
  document.body.style.backgroundColor = fondoSelector.value
  selectColor.value = fondoSelector.value
}

btnEjer18.addEventListener('click', cambiarFondo)

//ejercicio 19
let selectColor = document.getElementById('selectColor')

const cambiarColorFondo = () => {
  document.body.style.backgroundColor = selectColor.value
  fondoSelector.value = selectColor.value
}

selectColor.addEventListener('change', cambiarColorFondo)

window.onload = cambiarColorFondo
