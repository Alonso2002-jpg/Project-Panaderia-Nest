import { Test, TestingModule } from '@nestjs/testing'
import { ProvidersService } from './providers.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { DeepPartial, Repository } from 'typeorm'
import { ProvidersEntity } from './entities/providers.entity'
import { CreateProvidersDto } from './dto/create-providers.dto'
import { UpdateProvidersDto } from './dto/update-providers.dto'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { Category } from '../category/entities/category.entity'
import { NotificationGateway } from '../../websockets/notification/notification.gateway'
import { ProvidersMapper } from './mapper/providersMapper'
import { CacheModule } from '@nestjs/cache-manager'
import { PaginateQuery } from 'nestjs-paginate'

describe('ProvidersService', () => {
  let service: ProvidersService
  let repository: Repository<ProvidersEntity>
  let categoryRepository: Repository<Category>
  let notificationGateway: NotificationGateway
  let providersMapper: ProvidersMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: getRepositoryToken(ProvidersEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        NotificationGateway,
        ProvidersMapper,
      ],
      imports: [CacheModule.register()],
    }).compile()

    service = module.get<ProvidersService>(ProvidersService)
    repository = module.get<Repository<ProvidersEntity>>(
      getRepositoryToken(ProvidersEntity),
    )
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
    notificationGateway = module.get<NotificationGateway>(NotificationGateway)
    providersMapper = module.get<ProvidersMapper>(ProvidersMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('should return all providers', async () => {
      // Arrange
      const query: PaginateQuery = {
        filter: {},
        page: 1,
        limit: 10,
        path: '/providers',
      }
      const expectedResult = [
        { id: 1, name: 'Provider 1' },
        { id: 2, name: 'Provider 2' },
      ]
      jest
        .spyOn(repository, 'find')
        .mockResolvedValueOnce(expectedResult as ProvidersEntity[])
    })

    describe('findOne', () => {
      it('should return a provider by ID', async () => {
        const id = 1
        const expectedResult = {
          id: 1,
          NIF: '12345678A',
          number: '123456789',
          name: '<NAME>',
          type: {
            id: 1,
            name: 'Personal',
          },
        }
        jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValueOnce(expectedResult),
        } as any)

        const result = await service.findOne(id)
      })

      it('should throw NotFoundException if provider is not found', async () => {
        const id = 1
        jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValueOnce(undefined),
        } as any)

        await expect(service.findOne(id)).rejects.toThrowError(
          NotFoundException,
        )
      })
    })

    describe('create', () => {
      it('should create a new provider', async () => {
        const providerDto: CreateProvidersDto = {
          NIF: '123456789',
          name: 'Provider',
          number: '123-456-455',
          type: 'Category1',
        }
        const expectedResult = {}
        jest
          .spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValueOnce({}),
          } as any)
        jest
          .spyOn(repository, 'save')
          .mockResolvedValueOnce(
            {} as DeepPartial<ProvidersEntity> & ProvidersEntity,
          )
        jest.spyOn(notificationGateway, 'sendMessage').mockImplementation()

        const result = await service.create(providerDto)
      })

      it('should throw BadRequestException if type is not found', async () => {
        const providerDto: CreateProvidersDto = {
          NIF: '123456789',
          name: 'Provider',
          number: '123-456-455',
          type: 'Category1',
        }
        jest
          .spyOn(categoryRepository, 'createQueryBuilder')
          .mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValueOnce(undefined),
          } as any)

        await expect(service.create(providerDto)).rejects.toThrowError(
          BadRequestException,
        )
      })
    })

    describe('update', () => {
      it('should update a provider by ID', async () => {
        const id = 1
        const updatedProvider: UpdateProvidersDto = {
          name: 'Provider 2',
          number: '123-456-466',
          type: 'Category2',
          NIF: '123456879',
        }
        const existingProvider = {
          id: 1,
          name: 'Provider 1',
          number: '123-456-455',
          type: 'Category1',
          NIF: '123456789',
        }
        const expectedResult = {
          name: 'Provider 1',
          number: '123-456-455',
          type: 'Category1',
          NIF: '123456789',
        }
        jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValueOnce(existingProvider),
        } as any)
        jest.spyOn(notificationGateway, 'sendMessage').mockImplementation()
      })

      it('should throw BadRequestException if provider is not found', async () => {
        const id = 1
        const updatedProvider: UpdateProvidersDto = {
          name: 'Provider 2',
          number: '123-456-466',
          type: 'Category2',
          NIF: '123456879',
        }
        jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValueOnce(undefined),
        } as any)

        await expect(service.update(id, updatedProvider)).rejects.toThrowError(
          BadRequestException,
        )
      })
    })

    describe('remove', () => {
      it('should remove a provider by ID', async () => {
        const id = 1
        jest.spyOn(repository, 'delete').mockResolvedValueOnce(undefined)
        jest.spyOn(notificationGateway, 'sendMessage').mockImplementation()
      })

      it('should throw BadRequestException if provider is not found', async () => {
        const id = 1
        jest.spyOn(repository, 'findOne').mockResolvedValueOnce(undefined)

        await expect(service.remove(id)).rejects.toThrowError(
          BadRequestException,
        )
      })
    })
  })
})
