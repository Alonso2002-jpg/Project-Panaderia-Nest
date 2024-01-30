import { Test, TestingModule } from '@nestjs/testing'
import { CategoryService } from './category.service'
import { Repository } from 'typeorm'
import { Category } from './entities/category.entity'
import { CategoryMapper } from './mapper/category-mapper.service'
import { NotificationGateway } from '../../websockets/notification/notification.gateway'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { getRepositoryToken } from '@nestjs/typeorm'

describe('CategoryService', () => {
  let service: CategoryService
  let repository: Repository<Category>
  let mapper: CategoryMapper
  let notificationService: NotificationGateway
  let cacheManager: Cache

  const categoryMapper = {
    mapCategory: jest.fn(),
    mapCategoryUpd: jest.fn(),
    mapResponse: jest.fn(),
  }

  const categoryNotification = {
    sendMessage: jest.fn(),
  }

  const cacheMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryMapper, useValue: categoryMapper },
        { provide: getRepositoryToken(Category), useClass: Repository },
        { provide: NotificationGateway, useValue: categoryNotification },
        { provide: CACHE_MANAGER, useValue: cacheMock },
      ],
    }).compile()

    service = module.get<CategoryService>(CategoryService)

    repository = module.get<Repository<Category>>(getRepositoryToken(Category))
    mapper = module.get<CategoryMapper>(CategoryMapper)
    notificationService = module.get<NotificationGateway>(NotificationGateway)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [new Category(), new Category()]
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      jest.spyOn(repository, 'find').mockResolvedValue(categories)
    })
  })
})
