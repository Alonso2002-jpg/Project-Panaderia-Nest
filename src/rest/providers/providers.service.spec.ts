import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { StorageService } from '../storage/storage.service'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ProvidersService } from './providers.service'
import { ProvidersEntity } from './entities/providers.entity'
import { ProvidersMapper } from './mapper/providersMapper'
import { Paginated } from 'nestjs-paginate'
import { Category } from '../category/entities/category.entity'
import { UpdateProvidersDto } from './dto/update-providers.dto'
import { NotificationGateway } from '../../websockets/notification/notification.gateway'
describe('ProvidersService', () => {
  let service: ProvidersService
  let providersRepository: Repository<ProvidersEntity>
  let cacheManager: Cache

  const providersMapperMock = {
    toEntity: jest.fn(),
    toResponseDto: jest.fn(),
  }

  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithouUrl: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        NotificationGateway,
        { provide: getRepositoryToken(ProvidersEntity), useClass: Repository },
        { provide: ProvidersMapper, useValue: providersMapperMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<ProvidersService>(ProvidersService)
    providersRepository = module.get(getRepositoryToken(ProvidersEntity))
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return a page of Providers', async () => {
      // Create a mock PaginateQuery object
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'Providers',
      }
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([]),
      }

      jest
        .spyOn(providersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      const result: any = await service.findAll(paginateOptions)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.links.current).toEqual(
        `Providers?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=id:ASC`,
      )
      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    })

    it('should return cached result', async () => {
      // Create a mock PaginateQuery object
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'Providers',
      }
      const testProviders = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'Providers?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<ProvidersEntity>
      jest.spyOn(cacheManager, 'get').mockResolvedValue(testProviders)
      const result = await service.findAll(paginateOptions)
      expect(result).toEqual(testProviders)
    })
  })
  describe('findOne', () => {
    it('should find a provider by ID', async () => {
      const mockProvider = new ProvidersEntity()
      jest.spyOn(providersRepository, 'findOne').mockResolvedValue(mockProvider)

      const result = await service.findOne(1)

      expect(result).toBe(mockProvider)
      expect(providersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      })
    })

    it('should throw NotFoundException if provider does not exist', async () => {
      jest.spyOn(providersRepository, 'findOne').mockResolvedValue(undefined)
    })
  })
  describe('create', () => {
    it('should create a new provider and return the saved entity', async () => {
      const mockProvider: ProvidersEntity = {
        id: 1,
        name: 'Provider 1',
        NIF: '123456789',
        number: '123-45-6789',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }

      jest.spyOn(providersRepository, 'create').mockReturnValue(mockProvider)
      jest.spyOn(providersRepository, 'save').mockResolvedValue(mockProvider)
    })
  })
  describe('update', () => {
    it('should update an existing provider', async () => {
      const id = 1
      const updatedProviderDto: UpdateProvidersDto = {
        id: 0,
        NIF: '123456780',
        number: '123-45-6780',
        name: 'Provider 2',
      }
      const existingProvider = new ProvidersEntity()
      jest
        .spyOn(providersRepository, 'findOne')
        .mockResolvedValue(existingProvider)
      jest.spyOn(providersRepository, 'save').mockImplementation(jest.fn())
      jest.spyOn(service, 'onChange').mockImplementation(jest.fn())

      await service.update(id, updatedProviderDto)

      expect(providersRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      })
      expect(providersRepository.save).toHaveBeenCalledWith({
        ...existingProvider,
        ...updatedProviderDto,
      })
    })

    it('should throw an error when provider does not exist', async () => {
      const id = 1
      jest.spyOn(providersRepository, 'findOne').mockResolvedValue(null)

      await expect(
        service.update(id, {} as UpdateProvidersDto),
      ).rejects.toThrowError(`No se encontró el proveedor con ID ${id}`)

      expect(providersRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      })
    })
  })

  describe('remove', () => {
    it('should remove an existing provider', async () => {
      const id = 1
      const existingProvider = new ProvidersEntity()
      jest
        .spyOn(providersRepository, 'findOne')
        .mockResolvedValue(existingProvider)
      jest.spyOn(providersRepository, 'delete').mockResolvedValue(undefined)
      jest.spyOn(service, 'onChange').mockImplementation(jest.fn())

      await service.remove(id)

      expect(providersRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      })
      expect(providersRepository.delete).toHaveBeenCalledWith(id)
    })

    it('should log a warning when provider does not exist', async () => {
      const id = 1
      jest.spyOn(providersRepository, 'findOne').mockResolvedValue(null)

      await service.remove(id)

      expect(providersRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      })
    })
  })
})
