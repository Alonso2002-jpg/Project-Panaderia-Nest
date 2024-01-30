import { Test, TestingModule } from '@nestjs/testing'
import { CategoryService } from './category.service'
import { Repository } from 'typeorm'
import { Category } from './entities/category.entity'
import { CategoryMapper } from './mapper/category-mapper.service'

describe('CategoryService', () => {
  let service: CategoryService
  let repository: Repository<Category>
  let mapper: CategoryMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService],
    }).compile()

    service = module.get<CategoryService>(CategoryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
