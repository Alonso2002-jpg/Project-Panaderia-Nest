import { Test, TestingModule } from '@nestjs/testing'
import { CategoryMapper } from './category-mapper.service'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { Category } from '../entities/category.entity'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { ResponseCategoryDto } from '../dto/response-category.dto'

describe('Mapper', () => {
  let provider: CategoryMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryMapper],
    }).compile()

    provider = module.get<CategoryMapper>(CategoryMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  describe('should be mapped to a category', () => {
    it('should be mapped to a category from create dto', () => {
      const category = provider.mapCategoria(new CreateCategoryDto())

      expect(category).toBeDefined()
      expect(category).toBeInstanceOf(Category)
    })

    it('should be mapped to a category from update DTO', () => {
      const category = provider.mapCategoriaUpd(
        new UpdateCategoryDto(),
        new Category(),
      )

      expect(category).toBeDefined()
      expect(category).toBeInstanceOf(Category)
    })

    it('should be mapped to a ResponseDTO from Category', () => {
      const category = new Category()
      const response = provider.mapResponse(category)

      expect(response).toBeDefined()
      expect(response).toBeInstanceOf(ResponseCategoryDto)
    })
  })
})
