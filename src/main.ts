import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as dotenv from 'dotenv'
import * as process from 'process'
import {readFileSync} from "fs";
import path from "path";

dotenv.config() // Cargamos las variables de entorno
async function bootstrap() {
  if (process.env.NODE_ENV === 'dev') {
    console.log('🛠️ Iniciando Nestjs Modo desarrollo 🛠️')
    console.log(process.env.DATABASE_USER)
    console.log(process.env.DATABASE_PASSWORD)
  } else {
    console.log('🚗 Iniciando Nestjs Modo producción 🚗')
  }
  const httpsOptions = {
    key: readFileSync(path.resolve(process.env.SSL_KEY)),
    cert: readFileSync(path.resolve(process.env.SSL_CERT)),
  }
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.setGlobalPrefix(process.env.API_VERSION || 'v1')
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
