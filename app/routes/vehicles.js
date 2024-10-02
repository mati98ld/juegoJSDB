import express from 'express'
import vehiclesData from '../../data/vehicles.json' assert { type: 'json' }
import fs from 'fs'

const router = express.Router()

const distanceTotal = (array) => {
  return array.reduce((acc, vehicle) => {
    return acc + vehicle.distance
  }, 0)
}

router.get('/', async (req, res) => {
  res.json(vehiclesData)
})

router.get('/totaldistance', async (req, res) => {
  res.json({ totalDistance: distanceTotal(vehiclesData) })
})

router.get('/averagedistance', async (req, res) => {
  let response = {}
  vehiclesData.forEach((vehicleActual) => {
    if (!response[vehicleActual.type]) {
      let vehiculoPorTipo = vehiclesData.filter((vehicle) => {
        return vehicle.type == vehicleActual.type
      })
      response[vehicleActual.type] =
        distanceTotal(vehiculoPorTipo) / vehiculoPorTipo.length
    }
  })
  res.json(response)
})

router.get('/maxfuelconsumption', async (req, res) => {
  let maximosGastadores = vehiclesData
    .filter((vehicle) => {
      return vehicle.fuelConsumption
    })
    .sort((a, b) => {
      return a.distance / a.fuelConsumption - b.distance / b.fuelConsumption
    })
  res.json(maximosGastadores[0])
})

router.get('/maxdistance', async (req, res) => {
  res.json(
    vehiclesData.sort((a, b) => {
      return b.distance - a.distance
    })[0],
  )
})

router.post('/', async (req, res) => {
  if (!req.body.type || !req.body.distance) {
    return res.send(
      'Los atributos "type" y "distance" son requeridos obligatoriamente.',
    )
  } else {
    let newVehicle = req.body
    newVehicle.id = vehiclesData.length + 1
    vehiclesData.push(newVehicle)

    fs.writeFile(
      'data/vehicles.json',
      JSON.stringify(
        vehiclesData.sort((a, b) => {
          return a.id - b.id
        }),
      ),
      (err) => {
        if (err) {
          console.log('Ha ocurrido un error al escribir en el archivo', err)
        }

        return res.status(200).send('Vehiculo agregado correctamente')
      },
    )
  }
})

export default router
