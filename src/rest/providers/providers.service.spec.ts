import { Test, TestingModule } from '@nestjs/testing'
import { ProvidersService } from './providers.service'
import { ProvidersEntity } from './entities/providers.entity'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Category } from '../category/entities/category.entity'

describe('ProvidersService', () => {
  let service: ProvidersService
  let repository: Repository<ProvidersEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: getRepositoryToken(ProvidersEntity),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<ProvidersService>(ProvidersService)
    repository = module.get<Repository<ProvidersEntity>>(
      getRepositoryToken(ProvidersEntity),
    )
  })

  describe('findAll', () => {
    it('should return an array of providers', async () => {
      const query = {} // Provide your paginate query object here
      const expectedProviders: ProvidersEntity[] = [
        /* Mock providers data */
      ]
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getManyAndCount: async () => ({
          data: expectedProviders,
          meta: {},
          links: {},
        }),
      } as any)

      const result = await service.findAll(query)

      expect(result).toEqual({
        data: expectedProviders,
        meta: {},
        links: {},
      })
    })
  })

  describe('findOne', () => {
    it('should return a single provider by ID', async () => {
      const mockProvider: ProvidersEntity = {
        id: 1,
        NIF: '123456789',
        number: '123-45-6789',
        name: 'Provider 1',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockProvider)

      const result = await service.findOne(1)

      expect(result).toEqual(mockProvider)
    })

    it('should return undefined for non-existing provider ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(undefined)

      const result = await service.findOne(999)

      expect(result).toBeUndefined()
    })
  })

  describe('create', () => {
    it('should create a new provider', async () => {
      const mockProvider: ProvidersEntity = {
        id: 0,
        NIF: '123456789',
        number: '123-45-6789',
        name: 'Provider 1',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }
      jest.spyOn(repository, 'create').mockReturnValueOnce(mockProvider)
      jest.spyOn(repository, 'save').mockResolvedValueOnce(mockProvider)

      const result = await service.create(mockProvider)

      expect(result).toEqual(mockProvider)
    })
  })

  describe('update', () => {
    it('should update an existing provider by ID', async () => {
      const mockProviderId = 1
      const mockUpdatedProvider: ProvidersEntity = {
        id: 0,
        NIF: '123456789',
        number: '123-45-6789',
        name: 'Provider 1',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }
      const mockExistingProvider: ProvidersEntity = {
        id: mockProviderId /* Mock existing data */,
        NIF: ' 123456789',
        number: ' 123-45-6789',
        name: ' Provider 1',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockExistingProvider)
      jest.spyOn(repository, 'save').mockResolvedValueOnce(mockUpdatedProvider)

      const result = await service.update(mockProviderId, mockUpdatedProvider)

      expect(result).toEqual(mockExistingProvider) // Returns existing provider after update
    })

    it('should return undefined for non-existing provider ID during update', async () => {
      const nonExistingProviderId = 999
      const mockUpdatedProvider: ProvidersEntity = {
        id: 0,
        NIF: ' 123456789',
        number: ' 123-45-6789',
        name: ' Provider 1',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(undefined)

      const result = await service.update(
        nonExistingProviderId,
        mockUpdatedProvider,
      )

      expect(result).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('should remove an existing provider by ID', async () => {
      const mockProviderId = 1
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce({ raw: {}, affected: 1 } as any)

      await expect(service.remove(mockProviderId)).resolves.not.toThrow()
    })

    it('should not throw an error for non-existing provider ID during removal', async () => {
      const nonExistingProviderId = 999
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValueOnce({ raw: {}, affected: 0 } as any)

      await expect(service.remove(nonExistingProviderId)).resolves.not.toThrow()
    })
  })
})
export { ProvidersService }
