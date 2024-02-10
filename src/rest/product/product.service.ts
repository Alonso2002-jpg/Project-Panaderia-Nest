import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductMapper } from './mappers/product-mapper'
import { Product } from './entities/product.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from '../category/entities/category.entity'
import { ResponseProductDto } from './dto/response-product.dto'
import { hash } from 'typeorm/util/StringUtils'
import { v4 as uuidv4 } from 'uuid'
import { ProvidersEntity } from '../Providers/entities/Providers.entity'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { NotificationGateway } from '../../websockets/notification/notification.gateway'
import {
  Notification,
  NotificationType,
} from '../../websockets/notification/model/notification.model'
import { StorageService } from '../storage/storage.service'

/**
 * Servicio de gestiOn de productos.
 * Este servicio proporciona mEtodos para realizar operaciones CRUD en productos,
 * asI como mEtodos para buscar productos, crear, actualizar y eliminar productos.
 */
@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name)

  /**
   * Constructor del servicio ProductService.
   * @param productRepository Repositorio para acceder a los datos de los productos.
   * @param categoryRepository Repositorio para acceder a los datos de las categorIas.
   * @param providerRepository Repositorio para acceder a los datos de los proveedores.
   * @param productMapper Mapper para convertir entre DTO y entidades de productos.
   * @param storageService Servicio para la gestiOn de almacenamiento de archivos.
   * @param productsNotifications Servicio para enviar notificaciones relacionadas con productos.
   * @param cacheManager Administrador de cachE para almacenar en cachE los resultados de consulta.
   */
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProvidersEntity)
    private readonly providerRepository: Repository<ProvidersEntity>,
    private readonly productMapper: ProductMapper,
    private readonly storageService: StorageService,
    private readonly productsNotifications: NotificationGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Metodo para buscar todos los productos.
   * @param query Objeto de consulta para paginacion y filtrado.
   * @returns Una lista paginada de productos.
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Finding all products')

    const cache = await this.cacheManager.get(
      `all_products_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Products obtained from the cache')
      return cache
    }

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.provider', 'provider')

    const pagination = await paginate(query, queryBuilder, {
      sortableColumns: ['name', 'price', 'stock'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['name', 'price', 'stock'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        price: true,
        stock: true,
        isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })

    const res = {
      data: (pagination.data ?? []).map((product) =>
        this.productMapper.toProductResponse(product),
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
   * Metodo para crear un nuevo producto.
   *
   * @param createProductDto DTO que contiene los datos para crear el producto.
   * @return DTO del producto creado.
   * @throws BadRequestException Si ya existe un producto con el mismo nombre y no esta eliminado.
   */
  async create(
    createProductDto: CreateProductDto,
  ): Promise<ResponseProductDto> {
    this.logger.log(`Creating product ${JSON.stringify(createProductDto)}`)
    let idTemp: string
    const productNameExist: Product = await this.findProductByName(
      createProductDto.name,
    )
    if (productNameExist) {
      if (!productNameExist.isDeleted) {
        throw new BadRequestException(
          `A product with the name ${createProductDto.name} already exists`,
        )
      } else {
        idTemp = productNameExist.id
      }
    }
    const category = await this.findCategory(createProductDto.category)
    const provider = await this.findProvider(createProductDto.provider)
    const productToCreate = this.productMapper.toProductCreate(
      createProductDto,
      category,
      provider,
    )
    const productCreated = await this.productRepository.save({
      ...productToCreate,
      id: idTemp || uuidv4(),
    })
    const response: ResponseProductDto =
      this.productMapper.toProductResponse(productCreated)
    this.onChange(NotificationType.CREATE, response)
    await this.invalidateCacheKey('all_products')
    return response
  }

  /**
   * Metodo privado para buscar un producto por su nombre en la base de datos.
   *
   * @param productName El nombre del producto a buscar.
   * @return Una promesa que se resuelve con el producto encontrado o undefined si no se encuentra.
   */
  private async findProductByName(productName: string) {
    return await this.productRepository
      .createQueryBuilder()
      .where('UPPER(name) = UPPER(:name)', {
        name: productName.toUpperCase(),
      })
      .getOne()
  }

  /**
   * Recupera un producto de la base de datos mediante su identificador unico.
   *
   * Este metodo recupera una entidad de producto por su ID, poblandola con entidades de categoria y proveedor asociadas.
   * Si el producto se encuentra en la cache, se devuelve directamente. De lo contrario, se obtiene de la base de datos.
   *
   * @param id El identificador unico del producto a recuperar.
   * @return Una promesa que resuelve al ResponseProductDto que representa el producto recuperado.
   * @throws NotFoundException Si no se encuentra ningun producto con el ID especificado o si esta marcado como eliminado.
   */
  async findOne(id: string): Promise<ResponseProductDto> {
    this.logger.log(`Find product by id:${id}`)
    const cache: ResponseProductDto = await this.cacheManager.get(
      `product_${id}`,
    )
    if (cache) {
      this.logger.log('Obtained from the cache')
      return cache
    }
    const productFound = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.provider', 'provider')
      .where('producty.id = :id', { id })
      .getOne()
    if (!productFound || productFound.isDeleted) {
      this.logger.log(`Product with id ${id} not found.`)
      throw new NotFoundException(`Product with id ${id} not found.`)
    }
    const productsResponse = this.productMapper.toProductResponse(productFound)
    await this.cacheManager.set(`product_${id}`, productsResponse, 60)
    return productsResponse
  }

  /**
   * Actualiza un producto existente en la base de datos.
   *
   * Este metodo actualiza los detalles de un producto existente, identificado por su ID unico,
   * con la informacion proporcionada en el objeto UpdateProductDto.
   *
   * @param id El ID unico del producto a actualizar.
   * @param updateProductDto El objeto que contiene los detalles actualizados del producto.
   * @return Una promesa que resuelve al ResponseProductDto que representa el producto actualizado.
   * @throws NotFoundException Si no se encuentra el producto con el ID especificado o si está marcado como eliminado.
   * @throws BadRequestException Si se intenta cambiar el nombre del producto a uno que ya existe y no esta eliminado.
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ResponseProductDto> {
    this.logger.log(
      `Updating product by id ${id} with ${JSON.stringify(updateProductDto)}`,
    )
    const actualProduct: Product = await this.exists(id)
    if (!actualProduct) {
      this.logger.log(`Product with id ${id} not found.`)
      throw new NotFoundException(`Product with id ${id} not found.`)
    } else if (
      actualProduct.isDeleted &&
      (updateProductDto.isDeleted == null || updateProductDto.isDeleted)
    ) {
      this.logger.log(`Product with id ${id} not found.`)
      throw new NotFoundException(`Product with id ${id} not found.`)
    }
    const category: Category = updateProductDto.category
      ? await this.findCategory(updateProductDto.category)
      : actualProduct.category
    const provider: ProvidersEntity = updateProductDto.provider
      ? await this.findProvider(updateProductDto.provider)
      : actualProduct.provider
    if (updateProductDto.name) {
      const nameAlreadyExist: Product = await this.findProductByName(
        updateProductDto.name,
      )
      if (
        nameAlreadyExist &&
        nameAlreadyExist.id != id &&
        !nameAlreadyExist.isDeleted
      ) {
        throw new BadRequestException(
          `A product with the name ${updateProductDto.name} already exists`,
        )
      }
    }
    const productToUpdate: Product = this.productMapper.toProductUpdate(
      updateProductDto,
      actualProduct,
      category,
      provider,
    )
    const productUpdated: Product =
      await this.productRepository.save(productToUpdate)
    const productResponse: ResponseProductDto =
      this.productMapper.toProductResponse(productUpdated)
    this.onChange(NotificationType.UPDATE, productResponse)
    await this.invalidateCacheKey(`product_${id}`)
    await this.invalidateCacheKey(`product_entity_${id}`)
    await this.invalidateCacheKey(`all_products`)
    return productResponse
  }

  /**
   * Elimina un producto de la base de datos.
   *
   * Este metodo marca un producto como eliminado en la base de datos, identificado por su ID unico.
   * Si el producto no se encuentra o ya esta marcado como eliminado, se lanza una excepcion NotFoundException.
   *
   * @param id El ID unico del producto a eliminar.
   * @return El DTO del producto eliminado.
   * @throws NotFoundException Si no se encuentra el producto con el ID especificado o si ya esta marcado como eliminado.
   */
  async remove(id: string) {
    this.logger.log(`Removing product by id: ${id}`)
    const productToRemove = await this.exists(id)
    if (!productToRemove || productToRemove.isDeleted) {
      this.logger.log(`Product with id ${id} not found.`)
      throw new NotFoundException(`Product with id ${id} not found.`)
    }
    const productRemoved = await this.productRepository.save({
      ...productToRemove,
      isDeleted: true,
    })
    const response = this.productMapper.toProductResponse(productRemoved)
    this.onChange(NotificationType.DELETE, response)
    await this.invalidateCacheKey(`product_${id}`)
    await this.invalidateCacheKey(`product_entity_${id}`)
    await this.invalidateCacheKey('all_products')
    return response
  }

  /**
   * Busca una categoria en la base de datos por su nombre.
   *
   * Este metodo busca una categoria por su nombre en la base de datos.
   * Si la categoria se encuentra en la cache, se devuelve directamente. De lo contrario, se busca en la base de datos.
   * Si la categoria no se encuentra o esta marcada como eliminada, se lanza una excepcion BadRequestException.
   *
   * @param nameCategory El nombre de la categoria a buscar.
   * @return Una promesa que se resuelve con la categoria encontrada.
   * @throws BadRequestException Si la categoria no se encuentra o esta marcada como eliminada.
   */
  async findCategory(nameCategory: string): Promise<Category> {
    const cache: Category = await this.cacheManager.get(
      `category_${nameCategory}`,
    )
    if (cache) {
      this.logger.log(`Obtained from the cache`)
      return cache
    }
    const category = await this.categoryRepository
      .createQueryBuilder()
      .where('LOWER(nameCategory) = LOWER(:nameCategory)', {
        name: nameCategory.toLowerCase(),
      })
      .getOne()

    if (!category || category.isDeleted) {
      this.logger.log(`Category ${nameCategory} doesn't exist`)
      throw new BadRequestException(`Category ${nameCategory} doesn't exist`)
    }
    await this.cacheManager.set(`category_${nameCategory}`, category, 60)
    return category
  }

  /**
   * Busca un proveedor en la base de datos.
   *
   * Este metodo busca un proveedor por su NIF en la base de datos.
   * Si el proveedor se encuentra en la cache, se devuelve directamente. De lo contrario, se busca en la base de datos.
   * Si el proveedor no se encuentra, se lanza una excepcion BadRequestException.
   *
   * @param nifProvider El NIF del proveedor a buscar.
   * @return Una promesa que se resuelve con el proveedor encontrado.
   * @throws BadRequestException Si el proveedor no se encuentra.
   */
  async findProvider(nifProvider: string): Promise<ProvidersEntity> {
    const cache: ProvidersEntity = await this.cacheManager.get(
      `provider_${nifProvider}`,
    )
    if (cache) {
      this.logger.log(`Obtained from the cache`)
      return cache
    }
    const provider: ProvidersEntity = await this.providerRepository
      .createQueryBuilder()
      .where('LOWER(NIF) = LOWER(:nifProvider)', {
        nif: nifProvider.toLowerCase(),
      })
      .getOne()

    if (!provider) {
      this.logger.log(`Provider ${nifProvider} doesn't exist`)
      throw new BadRequestException(`Provider ${nifProvider} doesn't exist`)
    }
    await this.cacheManager.set(`provider_${nifProvider}`, provider, 60)
    return provider
  }

  /**
   * Envia una notificacion de cambio de producto a traves del servicio de notificaciones.
   *
   * Este metodo crea una notificacion de cambio de producto con el tipo y los datos proporcionados,
   * y luego la envia a traves del servicio de notificaciones.
   *
   * @param tipo El tipo de cambio de producto (CREATE, UPDATE o DELETE).
   * @param data Los datos del producto afectado por el cambio.
   */
  private onChange(tipo: NotificationType, data: ResponseProductDto) {
    const notificacion = new Notification<ResponseProductDto>(
      'PRODUCTS',
      tipo,
      data,
      new Date(),
    )
    this.productsNotifications.sendMessage(notificacion)
  }

  /**
   * Actualiza la imagen de un producto en la base de datos.
   *
   * Este metodo actualiza la imagen de un producto existente identificado por su ID unico.
   * Primero verifica si el producto existe y no esta marcado como eliminado.
   * Si el producto tiene una imagen predeterminada, la elimina del almacenamiento.
   * Luego, guarda la nueva imagen proporcionada en el producto y actualiza el registro en la base de datos.
   * Finalmente, notifica sobre la actualizacion de la imagen y actualiza las claves de cache relacionadas con el producto.
   *
   * @param id El ID unico del producto cuya imagen se va a actualizar.
   * @param file El archivo de imagen proporcionado para actualizar la imagen del producto.
   * @return El DTO del producto con la imagen actualizada.
   * @throws NotFoundException Si no se encuentra el producto con el ID especificado o si esta marcado como eliminado.
   * @throws BadRequestException Si el archivo de imagen no se proporciona.
   */
  public async updateImage(id: string, file: Express.Multer.File) {
    this.logger.log(`Updating product img by id: ${id}`)
    const productToUpdate = await this.exists(id)
    if (!productToUpdate || productToUpdate.isDeleted == true) {
      this.logger.log(`Product with id ${id} not found.`)
      throw new NotFoundException(`Product with id ${id} not found.`)
    }

    if (productToUpdate.image !== Product.IMAGE_DEFAULT) {
      this.logger.log(`Deleting image ${productToUpdate.image}`)
      const imagePath: string = productToUpdate.image

      try {
        this.storageService.removeFile(imagePath)
      } catch (error) {
        this.logger.error(error)
      }
    }

    if (!file) {
      throw new BadRequestException('File not found.')
    }

    productToUpdate.image = file.filename
    const productUpdated: Product =
      await this.productRepository.save(productToUpdate)
    const productResponse: ResponseProductDto =
      this.productMapper.toProductResponse(productUpdated)
    this.onChange(NotificationType.UPDATE, productResponse)
    await this.invalidateCacheKey(`product_${id}`)
    await this.invalidateCacheKey(`product_entity_${id}`)
    await this.invalidateCacheKey('all_products')
    return productResponse
  }

  /**
   * Verifica la existencia de un producto en la base de datos por su ID.
   *
   * Este metodo verifica si un producto existe en la base de datos utilizando su ID unico.
   * Primero verifica si el producto esta en la cache y lo devuelve si se encuentra.
   * Si no esta en la cache, busca el producto en la base de datos.
   * Si se encuentra en la base de datos y no está marcado como eliminado, lo guarda en la caché y lo devuelve.
   *
   * @param id El ID unico del producto a verificar.
   * @return Una promesa que se resuelve con el producto si existe; de lo contrario, se resuelve con null.
   */
  public async exists(id: string): Promise<Product> {
    const cache: Product = await this.cacheManager.get(`product_entity_${id}`)
    if (cache) {
      this.logger.log(`Obtained from the cache`)
      return cache
    }
    const product: Product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.provider', 'provider')
      .where('product.id = :id', { id })
      .getOne()
    if (product && !product.isDeleted) {
      await this.cacheManager.set(`product_entity_${id}`, product, 60000)
    }
    return product
  }

  /**
   * Invalida las claves de cache que coinciden con el patron especificado.
   *
   * Este metodo invalida todas las claves de cache que coinciden con el patron proporcionado.
   * Primero obtiene todas las claves de cache del almacenamiento.
   * Luego filtra las claves que coinciden con el patron especificado.
   * Finalmente, elimina las claves de cache filtradas.
   *
   * @param keyPattern El patron de clave de cache que se utilizara para invalidar las claves.
   * @return Una promesa que se resuelve una vez que se han invalidado todas las claves de cache correspondientes.
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
