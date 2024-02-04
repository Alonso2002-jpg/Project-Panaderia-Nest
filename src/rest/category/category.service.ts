import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Repository } from 'typeorm'
import { Category } from './entities/category.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoryMapper } from './mapper/category-mapper.service'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  Notification,
  NotificationType,
} from '../../websockets/notification/model/notification.model'
import { ResponseCategoryDto } from './dto/response-category.dto'
import { NotificationGateway } from '../../websockets/notification/notification.gateway'

/**
 * Servicio para operaciones relacionadas con las categorías.
 */
@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name)
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationGateway: NotificationGateway,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly categoryMapper: CategoryMapper,
  ) {}
  /**
   * Crea una nueva categoría.
   * @param createCategoryDto Los datos de la categoría a crear.
   * @returns La categoría creada.
   * @throws BadRequestException Si la categoría ya existe.
   */
  async create(createCategoryDto: CreateCategoryDto) {
    const findCategory = await this.categoryRepository.findOneBy({
      nameCategory: createCategoryDto.nameCategory,
    })
    if (findCategory) {
      throw new BadRequestException(
        `Category already exists with name: ${createCategoryDto.nameCategory}`,
      )
    }
    await this.invalidateCacheKey('all_categories')
    const categorySaved = await this.categoryRepository.save(
      this.categoryMapper.mapCategory(createCategoryDto),
    )
    this.onChange(NotificationType.CREATE, categorySaved)
    return categorySaved
  }

  /**
   * Obtiene todas las categorías.
   * @returns Un arreglo con todas las categorías.
   */
  async findAll() {
    this.logger.log('Find All Categories')
    const cache: Category[] = await this.cacheManager.get('all_categories')
    if (cache) {
      this.logger.log('Cache Hit')
      return cache
    }
    const categories = await this.categoryRepository.find()
    await this.cacheManager.set('all_categories', categories, 60000)
    return categories
  }
  /**
   * Obtiene una categoría por su ID.
   * @param id El ID de la categoría a buscar.
   * @returns La categoría encontrada.
   * @throws NotFoundException Si la categoría no se encuentra.
   */
  async findOne(id: number) {
    this.logger.log(`Find Category with ID: ${id}`)
    const cache: Category = await this.cacheManager.get(`category_${id}`)
    if (cache) {
      this.logger.log('Cache Hit')
      return cache
    }

    const categoryFind = await this.categoryRepository.findOne({
      where: { id },
    })
    if (!categoryFind) {
      throw new NotFoundException(`Category not found with id: ${id}`)
    }
    await this.cacheManager.set(`category_${id}`, categoryFind, 60000)
    return categoryFind
  }
  /**
   * Actualiza una categoría existente.
   * @param id El ID de la categoría a actualizar.
   * @param updateCategoryDto Los datos actualizados de la categoría.
   * @returns La categoría actualizada.
   * @throws NotFoundException Si la categoría no se encuentra.
   */
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const categoryFind = await this.findOne(id)
    const categoryUpdated = await this.categoryRepository.save(
      this.categoryMapper.mapCategoryUpd(updateCategoryDto, categoryFind),
    )
    await this.invalidateCacheKey('all_categories')
    await this.invalidateCacheKey(`category_${id}`)
    this.onChange(NotificationType.UPDATE, categoryUpdated)
    return categoryUpdated
  }
  /**
   * Elimina una categoría.
   * @param id El ID de la categoría a eliminar.
   * @returns La categoría eliminada.
   * @throws NotFoundException Si la categoría no se encuentra.
   */
  async remove(id: number) {
    const categoryToRemove = await this.findOne(id)
    await this.invalidateCacheKey(`category_${id}`)
    this.onChange(NotificationType.DELETE, categoryToRemove)

    if (await this.findRelations(categoryToRemove)) {
      return await this.hardRemove(categoryToRemove)
    }
    return await this.softRemove(categoryToRemove)
  }
  /**
   * Elimina permanentemente una categoría.
   * @param cateToRemove La categoría a eliminar permanentemente.
   * @returns La categoría eliminada permanentemente.
   */
  async hardRemove(cateToRemove: Category) {
    return await this.categoryRepository.remove(cateToRemove)
  }
  /**
   * Marca una categoría como eliminada.
   * @param cateToRemove La categoría a marcar como eliminada.
   * @returns La categoría marcada como eliminada.
   */
  async softRemove(cateToRemove: Category) {
    cateToRemove.isDeleted = true
    return await this.categoryRepository.save(cateToRemove)
  }
  /**
   * Invalida una clave en la caché.
   * @param keyPattern El patrón de la clave a invalidar.
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
  /**
   * Verifica si una categoría tiene relaciones.
   * @param category La categoría a verificar.
   * @returns `true` si la categoría no tiene relaciones, `false` de lo contrario.
   */
  async findRelations(category: Category) {
    const categoryInstance = await this.categoryRepository.findOne({
      where: { id: category.id },
      relations: ['products', 'providers', 'personal'],
    })
    return !!(
      categoryInstance.products.length == 0 &&
      categoryInstance.personal.length == 0 &&
      categoryInstance.providers.length == 0
    )
  }
  /**
   * Notifica un cambio relacionado con una categoría.
   * @param type El tipo de notificación.
   * @param data Los datos de la categoría relacionada con el cambio.
   */
  onChange(type: NotificationType, data: Category) {
    const dataToSend = this.categoryMapper.mapResponse(data)
    const notification = new Notification<ResponseCategoryDto>(
      'CATEGORY',
      type,
      dataToSend,
      new Date(),
    )
    this.notificationGateway.sendMessage(notification)
  }
}
