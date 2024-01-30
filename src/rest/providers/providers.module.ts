import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
/**
 * El decorador @Module del paquete @nestjs/common se utiliza para definir un módulo en el framework NestJS.
 * Las propiedades controllers y providers contienen una matriz de los controladores y proveedores que forman parte de este módulo.
 * La propiedad controllers contiene una matriz de los controladores que forman parte de este módulo, mientras que la propiedad providers contiene una matriz de los proveedores que forman parte de este módulo.
 * La matriz controllers contiene la clase ProvidersController, que es un controlador que maneja las solicitudes al endpoint /providers.
 * La matriz providers contiene la clase ProvidersService, que es un servicio que proporciona lógica de negocio para el módulo de proveedores.
 */

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService],
})
export class ProvidersModule {}
