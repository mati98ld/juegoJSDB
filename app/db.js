import { connect } from 'mongoose'

export const connectDB = async () => {
  try {
    await connect(
      'mongodb+srv://mati98ld:lola3085@juegojsdb.b8lin.mongodb.net/?retryWrites=true&w=majority&appName=JuegoJSDB',
    )
    console.log('Conexión a la base de datos exitosa')
  } catch (error) {
    console.error('Error al conectar a la base de datos', error)
  }
}
