import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Repository } from 'typeorm'
import { Category } from './entities/category.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoryMapper } from './mapper/category-mapper.service'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly categoryMapper: CategoryMapper,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    return await this.categoryRepository.save(
      this.categoryMapper.mapCategoria(createCategoryDto),
    )
  }

  async findAll() {
    const cache = await this.cacheManager.get('all_categories')
    if (cache) {
      return cache
    }
    const categories = await this.categoryRepository.find()
    await this.cacheManager.set('all_categories', categories)
    return categories
  }

  async findOne(id: number) {
    const categoryFind = await this.categoryRepository.findOne({
      where: { id },
    })
    if (!categoryFind) {
      throw new NotFoundException(`Category not found with id: ${id}`)
    }
    return categoryFind
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const categoryFind = await this.findOne(id)
    return await this.categoryRepository.save(
      this.categoryMapper.mapCategoriaUpd(updateCategoryDto, categoryFind),
    )
  }

  async remove(id: number) {
    const categoryToRemove = await this.findOne(id)
    if (await this.findRelations(categoryToRemove)) {
      return await this.hardRemove(categoryToRemove)
    }
    return await this.softRemove(categoryToRemove)
  }

  async hardRemove(cateToRemove: Category) {
    return await this.categoryRepository.remove(cateToRemove)
  }

  async softRemove(cateToRemove: Category) {
    cateToRemove.isDeleted = true
    return await this.categoryRepository.save(cateToRemove)
  }

  async findRelations(category: Category) {
    // return await this.categoryRepository.findOne({
    //   where: { id: category.id },
    //   relations: ['products', 'funkos'],
    // })
    return true
  }
}
