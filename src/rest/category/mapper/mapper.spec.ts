import { Test, TestingModule } from '@nestjs/testing'
import { CategoryMapper } from './category-mapper.service'

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
})
