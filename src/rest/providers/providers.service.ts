import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ProvidersEntity } from './entities/providers.entity'
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ProvidersMapper } from './mapper/providersMapper'
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
import {
  Notification,
  NotificationType,
} from '../../websockets/notification/model/notification.model'
import { NotificationGateway } from '../../websockets/notification/notification.gateway'
import { ProvidersResponseDto } from './dto/response-providers.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { CreateProvidersDto } from './dto/create-providers.dto'
import {Category} from "../category/entities/category.entity";

/**
 * Servicio de Providers a cargo de manejar las solicitudes de los proveedores
 */
@ApiTags('providers')
@Injectable()
export class ProvidersService {
  constructor(
    /**
     * Instancia de Notification
     */
    private readonly notificationGateway: NotificationGateway,
    /**
     * Instancia de ProvidersMapper
     */
    private readonly providersMapper: ProvidersMapper,
    /**
     * Instancia de Cache
     */
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    /**
     * Instancia de ProvidersRepository
     */
    @InjectRepository(ProvidersEntity)
    private readonly providersRepository: Repository<ProvidersEntity>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
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
  async findAll(query: PaginateQuery) {
    this.logger.log('Finding all providers')
    const cache = await this.cacheManager.get(
      `all_providers_page${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Providers obtained from the cache')
      return cache
    }
    const queryBuilder = this.providersRepository
      .createQueryBuilder('providers')
      .leftJoinAndSelect('providers.type', 'type')

    const pagination = await paginate(query, queryBuilder, {
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
        this.providersMapper.mapResponse(provider),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }

    await this.cacheManager.set(
      `all_providers_page${hash(JSON.stringify(query))}`,
      res,
      60,
    )
    return res
  }

  /**
   * Encuentra un proveedor por su ID
   * @param {number} id - Identificador unico del proveedor a buscar
   * @returns ProvidersEntity - El proveedor encontrado
   * @throws {NotFoundException} - Si no se encuentra el proveedor con el ID especificado
   */
  @ApiOperation({
    summary: 'Get a provider by ID from the service',
    description: 'Get a provider by its ID from the service',
  })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Success', type: ProvidersEntity })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async findOne(id: number) {
    this.logger.log(`Searching Providers by ID: ${id}`)
    const providerFind = await this.providersRepository
        .createQueryBuilder('provider')
        .leftJoinAndSelect('provider.type', 'type')
        .where('provider.id = :id', {id})
        .getOne()

    if (!providerFind) {
      throw new NotFoundException(`Provider not found with ID ${id}`)
    }

    return this.providersMapper.mapResponse(providerFind)
  }
  /**
   * Crea un nuevo proveedor
   * @param {ProvidersEntity} provider El proveedor a crear
   * @returns ProvidersEntity El proveedor creado
   */
  @ApiOperation({
    summary: 'Create a new provider from the service',
    description: 'Create a new provider from the service',
  })
  @ApiResponse({ status: 201, description: 'Created', type: ProvidersEntity })
  async create(provider: CreateProvidersDto) {
    this.logger.log('Creating a new Providers.')
    const type = await this.findType(provider.type)
    const newProviders = this.providersMapper.toEntity(provider)
    const savedProviders = await this.providersRepository.save({
      ...newProviders,
      type: type,
    })
    this.onChange(NotificationType.CREATE, savedProviders)
    return this.providersMapper.mapResponse(savedProviders)
  }

  private async findType(type: string): Promise<Category> {
    const typeFound = await this.categoryRepository
        .createQueryBuilder()
        .where('LOWER(name_category) = LOWER(:type)', {
          type : type.toLowerCase(),
        })
        .getOne()
    if (!typeFound || typeFound.isDeleted) {
      this.logger.log(`Type ${type} doesn't exist`)
      throw new BadRequestException(`Type ${type} doesn't exist`)
    }
    return typeFound
  }

  /**
   * Actualiza un proveedor por su ID en el servicio
   * @param id el id del proveedor a actualizar
   * @param updatedProvider las propiedades del proveedor a actualizar
   * @returns El Provedor actualizado.
   * @throws {BadRequestException} Si el proveedor no se encuentra.
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
  ): Promise<ProvidersResponseDto> {
    this.logger.log(`Updating Provider with ID: ${id}`)
    const existingProvider = await this.providersRepository
        .createQueryBuilder('provider')
        .leftJoinAndSelect('provider.type', 'type')
        .where('provider.id = :id', {id})
        .getOne()
    if (existingProvider) {
      // Si encontramos el proveedor, actualizamos sus propiedades
      let type : Category;
      if(updatedProvider.type){
        type = await this.findType(updatedProvider.type)
      } else {
        type = existingProvider.type;
      }
      const updatedEntity = await this.providersRepository.save({
        ...existingProvider,
        ...updatedProvider,
        type : type
      })
      const res = this.providersMapper.mapResponse(updatedEntity)
      this.onChange(NotificationType.UPDATE, updatedEntity)
      return res
    }
    // Si no encontramos el proveedor, podrías lanzar una excepción o manejar de otra manera.
    throw new BadRequestException(`No se encontró el proveedor con ID ${id}`)
  }

  /**
   * Elimina un Proveedor de la lista en memoria mediante su ID.
   * @param id El ID del Proveedor a eliminar.
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
  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting Providers with ID: ${id}`)
    const providerToDelete = await this.providersRepository.findOne({
      where: { id },
    })

    if (providerToDelete) {
      this.onChange(NotificationType.DELETE, providerToDelete)
      await this.providersRepository.delete(id)
    }
    // Si no encontramos el proveedor, podrías lanzar una excepción o manejar de otra manera.
    throw new BadRequestException(`No se encontró el proveedor con ID ${id}`)
  }

  /**
   * Envía una notificación a los clientes de WebSocket cuando se crea, actualiza o elimina un Proveedor.
   * @param type El tipo de notificación a enviar.
   * @param data La información del proveedor que se notificará.
   */
  onChange(type: NotificationType, data: ProvidersEntity) {
    const dataToSend = this.providersMapper.mapResponse(data)
    const notification = new Notification<ProvidersResponseDto>(
      'PROVIDER',
      type,
      dataToSend,
      new Date(),
    )
    this.notificationGateway.sendMessage(notification)
  }
}
