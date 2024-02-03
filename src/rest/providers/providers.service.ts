import { Inject, Injectable, Logger } from '@nestjs/common'
import { ProvidersEntity } from './entities/providers.entity'
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger'
import { ProvidersMapper } from './mapper/providersMapper'
import { CACHE_MANAGER } from '@nestjs/common/cache'
import { Cache } from 'cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UpdateProvidersDto } from './dto/update-providers.dto'

/**
 * Servicio de Providers a cargo de manejar las solicitudes de los proveedores
 * @Author: Laura Garrido
 */
@ApiTags('providers')
@Injectable()
export class ProvidersService {
  constructor(
    /**
     * Instancia de Cache
     */
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    /**
     * Instancia de ProvidersRepository
     */
    @InjectRepository(ProvidersEntity)
    private readonly ProvidersRepository: Repository<ProvidersEntity>,
  ) {}
  /**
   * Instancia de ProvidersRepository
   */
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
  async findAll(query: NonNullable<unknown>) {
    this.logger.log('Finding all providers')
    const cache = await this.cacheManager.get(
      `all_products_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Providers obtained from the cache')
      return cache
    }
    const queryBuilder = this.ProvidersRepository.createQueryBuilder(
      'providers',
    ).leftJoinAndSelect('providers.category', 'type')

    const pagination = await paginate(<PaginateQuery>query, queryBuilder, {
      sortableColumns: ['NIF', 'number', 'name'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['NIF', 'number', 'name'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        number: true,
        NIF: true,
        isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })

    const res = {
      data: (pagination.data ?? []).map((provider) =>
        ProvidersMapper.toEntity(provider),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }

    await this.cacheManager.set(
      `all_products_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    )

    return res
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
  async findOne(id: number): Promise<ProvidersEntity> {
    this.logger.log(`Searching Providers by ID: ${id}`)
    return this.ProvidersRepository.findOne({ where: { id } })
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
  async create(Providers: ProvidersEntity): Promise<ProvidersEntity> {
    this.logger.log('Creating a new Providers.')
    const newProviders = this.ProvidersRepository.create(Providers)
    newProviders.id = await this.getNextId()
    const savedProviders = await this.ProvidersRepository.save(newProviders)
    return savedProviders
  }
  /**
   * Actualizar un proveedor por su ID
   * @param {number} id
   * @returns ProvidersEntity
   */
  @ApiOperation({
    summary: 'Update a provider from the service',
    description: 'Update a provider by its ID from the service',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Success', type: ProvidersEntity })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async update(
    id: number,
    updatedProvider: UpdateProvidersDto,
  ): Promise<ProvidersEntity | undefined> {
    this.logger.log(`Updating Provider with ID: ${id}`)

    const existingProvider = await this.ProvidersRepository.findOne({
      where: { id },
    })

    if (existingProvider) {
      // Si encontramos el proveedor, actualizamos sus propiedades
      await this.ProvidersRepository.save({
        ...existingProvider,
        ...updatedProvider,
      })

      return existingProvider
    }
    // Si no encontramos el proveedor, devolvemos undefined
    return undefined
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
    await this.ProvidersRepository.delete(id)
  }
  /**
   * Consigue el siguiente id disponible
   * @returns number
   */
  // Private Method to obtain the next ID available.
  private async getNextId(): Promise<number> {
    const providers = await this.ProvidersRepository.find({
      order: { id: 'DESC' },
      take: 1,
    })
    const maxId = providers.length > 0 ? providers[0].id : 0
    return maxId + 1
  }
}
