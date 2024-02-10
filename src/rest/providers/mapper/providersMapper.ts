import { plainToClass } from 'class-transformer'
import { ProvidersEntity } from '../entities/providers.entity'
import { CreateProvidersDto } from '../dto/create-providers.dto'
import { UpdateProvidersDto } from '../dto/update-providers.dto'
import { ProvidersResponseDto } from '../dto/response-providers.dto'
import { Injectable } from '@nestjs/common'
/**
 * Mapeador de los DTOs de las entidades de proveedor
 */
@Injectable()
export class ProvidersMapper {
  /**
   * Mapeador de los DTOs de las entidades de proveedor para crearlos.
   * @param {CreateProvidersDto} createDto - El CreateProvidersDto a mapeador.
   * @returns {ProvidersEntity} La entidad de proveedores a sido creada.
   */
  toEntity(createDto: CreateProvidersDto) {
    return plainToClass(ProvidersEntity, createDto)
  }

  mapResponse(providers: ProvidersEntity): ProvidersResponseDto {
    const response = new ProvidersResponseDto()
    response.id = providers.id
    response.name = providers.name
    response.NIF = providers.NIF
    response.number = providers.number
    response.CreationDate = providers.CreationDate
    response.UpdateDate = providers.UpdateDate
    return response
  }
}
