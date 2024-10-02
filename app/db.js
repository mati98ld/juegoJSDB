import { connect } from 'mongoose'
import { config as dotenv } from 'dotenv'

dotenv()

export const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI)
    console.log('Conexión a la base de datos exitosa')
  } catch (error) {
    console.error('Error al conectar a la base de datos', error)
  }
}
