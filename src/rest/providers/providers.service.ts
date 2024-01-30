import { Inject, Injectable, Logger } from "@nestjs/common";
import { ProvidersEntity } from './entities/providers.entity';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CACHE_MANAGER } from "@nestjs/common/cache";
import { Cache } from "cache-manager";

/**
 * Servicio de Providers a cargo de manejar las solicitudes de los proveedores
 * @Author: Laura Garrido
 */
@ApiTags('providers')
@Injectable()
export class ProvidersService {
//constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
//}
  /**
   * Instancia de ProvidersRepository
   */
  private readonly ProvidersRepository: ProvidersEntity[] = []
  /**
   *  Instancia de Logger
   */
  private readonly logger: Logger = new Logger(ProvidersService.name)

  /**
   * Encuentra todos los proveedores
   * @returns ProvidersEntity[]
   */
  @ApiOperation({
    summary: 'Get all providers from the service',
    description: 'Get a list of all providers from the service',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ProvidersEntity,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findAll(): Promise<ProvidersEntity[]> {
    this.logger.log('Obtaining all Providers.');
    return this.ProvidersRepository;
  }

  /**
   * Encuentra un proveedor por su ID
   * @param {number} id
   * @returns ProvidersEntity
   */
  @ApiOperation({
    summary: 'Get a provider by ID from the service',
    description: 'Get a provider by its ID from the service',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Success', type: ProvidersEntity })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findOne(id: number): Promise<ProvidersEntity | undefined> {
    this.logger.log(`Searching Providers by ID: ${id}`)
    return this.ProvidersRepository.find((Providers) => Providers.id === id)
  }

  /**
   * Crea un nuevo proveedor
   * @param {ProvidersEntity} Providers
   * @returns ProvidersEntity
   */
  @ApiOperation({
    summary: 'Create a new provider from the service',
    description: 'Create a new provider from the service',
  })
  @ApiResponse({ status: 201, description: 'Created', type: ProvidersEntity })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async create(Providers: ProvidersEntity): Promise<ProvidersEntity> {
    this.logger.log('Creating a new Providers.')
    const newProviders = { ...Providers, id: this.getNextId() }
    this.ProvidersRepository.push(newProviders)
    return newProviders
  }

  /**
   * Actualizar un proveedor por su ID
   * @param {number} id
   * @param {ProvidersEntity} Providers
   * @returns ProvidersEntity
   */
  @ApiOperation({
    summary: 'Update a provider from the service',
    description: 'Update a provider by its ID from the service',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Success', type: ProvidersEntity })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async update(
    id: number,
    Providers: ProvidersEntity,
  ): Promise<ProvidersEntity | undefined> {
    this.logger.log(`Updating Provider with ID: ${id}`)
    const index = this.ProvidersRepository.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.ProvidersRepository[index] = { ...Providers, id }
      return this.ProvidersRepository[index]
    }
    return undefined;
  }

  /**
   * Elimina un proveedor por su ID
   * @param {number} id
   * @returns void
   */
  // Deletes a Provider from the list in memory by its ID.
  @ApiOperation({
    summary: 'Delete a provider from the service',
    description: 'Delete a provider by its ID from the service',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting Providers with ID: ${id}`)
    const index = this.ProvidersRepository.findIndex((p) => p.id === id)
    if (index !== -1) {
      this.ProvidersRepository.splice(index, 1)
    }
  }

  /**
   * Consigue el siguiente id disponible
   * @returns number
   */
  // Private Method to obtain the next ID available.
  private getNextId(): number {
    const maxId = Math.max(...this.ProvidersRepository.map((p) => p.id), 0)
    return maxId + 1
  }
}
