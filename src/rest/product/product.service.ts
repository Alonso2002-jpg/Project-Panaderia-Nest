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

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name)

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

  private async findProductByName(productName: string) {
    return await this.productRepository
      .createQueryBuilder()
      .where('UPPER(name) = UPPER(:name)', {
        name: productName.toUpperCase(),
      })
      .getOne()
  }

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

  private onChange(tipo: NotificationType, data: ResponseProductDto) {
    const notificacion = new Notification<ResponseProductDto>(
      'PRODUCTS',
      tipo,
      data,
      new Date(),
    )
    this.productsNotifications.sendMessage(notificacion)
  }

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

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
