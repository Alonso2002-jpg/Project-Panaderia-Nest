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
 * Service for operations related to categories.
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
   * Creates a new category.
   * @param createCategoryDto The data of the category to create.
   * @returns The created category.
   * @throws BadRequestException If the category already exists.
   */
  async create(createCategoryDto: CreateCategoryDto) {
    const findCategory = await this.findCategoryByName(
      createCategoryDto.nameCategory,
    )
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
   * Gets all categories.
   * @returns An array with all categories.
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
   * Gets a category by its ID.
   * @param id The ID of the category to search for.
   * @returns The found category.
   * @throws NotFoundException If the category is not found.
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
   * Updates an existing category.
   * @param id The ID of the category to update.
   * @param updateCategoryDto The updated data of the category.
   * @returns The updated category.
   * @throws NotFoundException If the category is not found.
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
   * Deletes a category.
   * @param id The ID of the category to delete.
   * @returns The deleted category.
   * @throws NotFoundException If the category is not found.
   */
  async remove(id: number) {
    const categoryToRemove = await this.findOne(id)
    await this.invalidateCacheKey('all_categories')
    await this.invalidateCacheKey(`category_${id}`)
    this.onChange(NotificationType.DELETE, categoryToRemove)

    if (await this.findRelations(categoryToRemove)) {
      return await this.hardRemove(categoryToRemove)
    }
    return await this.softRemove(categoryToRemove)
  }
  async findCategoryByName(nameCategory: string) {
    return await this.categoryRepository.findOneBy({
      nameCategory: nameCategory.toUpperCase(),
    })
  }
  /**
   * Permanently deletes a category.
   * @param cateToRemove The category to be permanently deleted.
   * @returns The category permanently deleted.
   */
  async hardRemove(cateToRemove: Category) {
    return await this.categoryRepository.remove(cateToRemove)
  }
  /**
   * Marks a category as deleted.
   * @param cateToRemove The category to mark as deleted.
   * @returns The category marked as deleted.
   */
  async softRemove(cateToRemove: Category) {
    cateToRemove.isDeleted = true
    return await this.categoryRepository.save(cateToRemove)
  }
  /**
   * Invalidates a key in the cache.
   * @param keyPattern The pattern of the key to invalidate.
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
  /**
   * Checks if a category has relations.
   * @param category The category to check.
   * @returns `true` if the category has no relations, `false` otherwise.
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
   * Notifies a change related to a category.
   * @param type The type of notification.
   * @param data The data of the category related to the change.
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
