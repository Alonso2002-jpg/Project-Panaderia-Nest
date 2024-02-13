import { Test, TestingModule } from '@nestjs/testing'
import { CategoryService } from './category.service'
import { Repository } from 'typeorm'
import { Category } from './entities/category.entity'
import { CategoryMapper } from './mapper/category-mapper.service'
import { NotificationGateway } from '../../websockets/notification/notification.gateway'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { getRepositoryToken } from '@nestjs/typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Product } from '../product/entities/product.entity'

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

      const res = await service.findAll()

      expect(res).toBeDefined()
      expect(res[0]).toBeInstanceOf(Category)
      expect(repository.find).toHaveBeenCalled()
      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    })

    it('should return an array of categories from cache', async () => {
      const categories = [new Category(), new Category()]
      jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValue(Promise.resolve(categories))

      const res = await service.findAll()

      expect(res).toBeDefined()
      expect(res[0]).toBeInstanceOf(Category)
      expect(cacheManager.get).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return a category', async () => {
      const category = new Category()
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      jest.spyOn(repository, 'findOne').mockResolvedValue(category)

      const res = await service.findOne(1)

      expect(res).toBeDefined()
      expect(res).toBeInstanceOf(Category)
      expect(repository.findOne).toHaveBeenCalled()
      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    })

    it('should return a category found by name', async () => {
      const category: Category = new Category()
      const findSpy = jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(category)

      const result = await service.findCategoryByName('test')

      expect(findSpy).toHaveBeenCalledWith({ nameCategory: 'TEST' })
      expect(result).toEqual(category)
    })

    it('should return a category from cache', async () => {
      const category = new Category()
      jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValue(Promise.resolve(category))

      const res = await service.findOne(1)
      expect(res).toBeDefined()
      expect(res).toBeInstanceOf(Category)
      expect(cacheManager.get).toHaveBeenCalled()
    })

    it('should throw an NotFoundExcepction when category is not found', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a category', async () => {
      const category = new Category()
      jest.spyOn(service, 'findCategoryByName').mockResolvedValue(null)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      jest.spyOn(mapper, 'mapCategory').mockReturnValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)

      const res = await service.create(new CreateCategoryDto())

      expect(res).toBeDefined()
      expect(res).toBeInstanceOf(Category)
      expect(mapper.mapCategory).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw a BadRequestException when category already exists', async () => {
      const category = new Category()
      jest.spyOn(service, 'findCategoryByName').mockResolvedValue(category)
      await expect(service.create(new CreateCategoryDto())).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('update', () => {
    it('should update a category', async () => {
      const category = new Category()
      jest.spyOn(repository, 'findOne').mockResolvedValue(category)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      jest.spyOn(mapper, 'mapCategoryUpd').mockReturnValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)

      const res = await service.update(1, new UpdateCategoryDto())

      expect(res).toBeDefined()
      expect(res).toBeInstanceOf(Category)
      expect(mapper.mapCategoryUpd).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw a NotFoundException when category is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)
      await expect(service.update(1, new UpdateCategoryDto())).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should remove a category with the hard way', async () => {
      const category = new Category()
      jest.spyOn(repository, 'findOne').mockResolvedValue(category)
      jest.spyOn(repository, 'remove').mockResolvedValue(category)

      const res = await service.hardRemove(category)

      expect(res).toBeDefined()
      expect(res).toBeInstanceOf(Category)
      expect(repository.remove).toHaveBeenCalled()
    })

    it('should remove a category with the soft way', async () => {
      const category = new Category()
      jest.spyOn(repository, 'findOne').mockResolvedValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)

      const res = await service.softRemove(category)

      expect(res).toBeDefined()
      expect(res).toBeInstanceOf(Category)
      expect(repository.save).toHaveBeenCalled()
    })
  })

  describe('findRelations', () => {
    it('should return true if has relations', async () => {
      const category = new Category()
      category.products = [new Product()]
      jest.spyOn(repository, 'findOne').mockResolvedValue(category)
      const res = await service.findRelations(category)
      expect(res).toBeDefined()
      expect(res).toBeFalsy()
    })

    it('should return false if has not relations', async () => {
      const category = new Category()
      category.products = []
      category.personal = []
      category.providers = []

      jest.spyOn(repository, 'findOne').mockResolvedValue(category)
      const res = await service.findRelations(category)
      expect(res).toBeDefined()
      expect(res).toBeTruthy()
    })
  })
})
