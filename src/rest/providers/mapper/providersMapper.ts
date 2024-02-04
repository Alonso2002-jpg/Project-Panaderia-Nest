import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { ProvidersEntity } from '../entities/providers.entity';
import { CreateProvidersDto } from '../dto/create-providers.dto';
import { UpdateProvidersDto } from '../dto/update-providers.dto';
import { ProvidersResponseDto } from '../dto/response-providers.dto';
import { Category } from "../../category/entities/category.entity";
import { ResponseCategoryDto } from "../../category/dto/response-category.dto";

/**
 * Mapeador de los DTOs de las entidades de proveedor
 */
export class ProvidersMapper {
  /**
   * Mapeador de los DTOs de las entidades de proveedor para crearlos.
   * @param {CreateProvidersDto} createDto - El CreateProvidersDto a mapeador.
   * @returns {ProvidersEntity} La entidad de proveedores a sido creada.
   */
  static toEntity(createDto: CreateProvidersDto): Promise<ProvidersEntity> {
    const entity = plainToClass(ProvidersEntity, createDto);
    return validateOrReject(entity).then(() => entity);
  }

  /**
   * Mapeador de los DTOs de las entidades de proveedor para la respuesta.
   * @param {ProvidersEntity} entity - La entidad de proveedor a mapeador.
   * @returns {ProvidersResponseDto} La entidad ProvidersResponseDto a sido creada.
   */
  static toDto(entity: ProvidersEntity): ProvidersResponseDto {
    return plainToClass(ProvidersResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Mapeador de los DTOs de las entidades de proveedor para actualizarlos.
   * @param {UpdateProvidersDto} updateDto - La entidad UpdateProvidersDto a mapeador.
   * @returns {ProvidersEntity} La entidad de ProvidersEntity fue actualizada.
   */
  static toEntityFromUpdate(
    updateDto: UpdateProvidersDto,
  ): Promise<ProvidersEntity> {
    const entity = plainToClass(ProvidersEntity, updateDto);
    return validateOrReject(entity).then(() => entity);
  }

  /**
   * Mapeador de los DTOs de las entidades de proveedor para actualizarlos.
   * @param {ProvidersEntity} entity - La entidad ProvidersEntity a mapeador.
   * @returns {UpdateProvidersDto} La entidad UpdateProvidersDto que fue actualizada.
   */
  static toUpdateDto(entity: ProvidersEntity): UpdateProvidersDto {
    return plainToClass(UpdateProvidersDto, entity, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Mapea un objeto parcial UpdateProvidersDto a una entidad ProvidersEntity existente.
   * @param {Partial<UpdateProvidersDto>} partialUpdateDto - El objeto parcial UpdateProvidersDto a mapear.
   * @param {ProvidersEntity} existingEntity - La entidad ProvidersEntity existente a actualizar.
   * @returns {ProvidersEntity} La entidad ProvidersEntity actualizada.
   */

  static toEntityFromPartialUpdate(
    partialUpdateDto: Partial<UpdateProvidersDto>,
    existingEntity: ProvidersEntity,
  ): Promise<ProvidersEntity> {
    const updatedEntity = Object.assign(
      new ProvidersEntity(),
      existingEntity,
      partialUpdateDto,
    );
    return validateOrReject(updatedEntity).then(() => updatedEntity);
  }

  /**
   * Mapea un objeto parcial UpdateProvidersDto a un UpdateProvidersDto.
   * @param {Partial<UpdateProvidersDto>} partialUpdateDto - El objeto parcial UpdateProvidersDto a mapear.
   * @param {ProvidersEntity} existingEntity - La entidad ProvidersEntity existente a actualizar.
   * @returns {UpdateProvidersDto} El UpdateProvidersDto actualizado.
   */

  static toUpdateDtoFromPartialUpdate(
    partialUpdateDto: Partial<UpdateProvidersDto>,
    existingEntity: ProvidersEntity,
  ): UpdateProvidersDto {
    return plainToClass(
      UpdateProvidersDto,
      { ...existingEntity, ...partialUpdateDto },
      { excludeExtraneousValues: true },
    );
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
