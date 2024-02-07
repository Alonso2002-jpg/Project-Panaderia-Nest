import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as dotenv from 'dotenv'
import * as process from 'process'

dotenv.config() // Cargamos las variables de entorno
async function bootstrap() {
  if (process.env.NODE_ENV === 'dev') {
    console.log('🛠️ Iniciando Nestjs Modo desarrollo 🛠️')
    console.log(process.env.DATABASE_USER)
    console.log(process.env.DATABASE_PASSWORD)
  } else {
    console.log('🚗 Iniciando Nestjs Modo producción 🚗')
  }

  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000)
}
bootstrap().then(() =>
  console.log(
    `🥖 Miga de Oro API escuchando en puerto: ${
      process.env.API_PORT || 3000
    } y perfil: ${process.env.NODE_ENV} 🫓`,
  ),
)
