import { Test, TestingModule } from '@nestjs/testing'
import { ProvidersController } from './providers.controller'
import { ProvidersService } from './providers.service'
import { ProvidersEntity } from './entities/providers.entity'
import { PaginateQuery } from 'nestjs-paginate'
import { Category } from '../category/entities/category.entity'

describe('ProvidersController', () => {
  let controller: ProvidersController
  let service: ProvidersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [ProvidersService],
    }).compile()

    controller = module.get<ProvidersController>(ProvidersController)
    service = module.get<ProvidersService>(ProvidersService)
  })

  describe('findAll', () => {
    it('should return a list of providers', async () => {
      const query: PaginateQuery = {
        page: 1,
        limit: 10,
        path: '',
      }
      const expectedResult: any = {
        data: [{ id: 1, name: 'Provider 1' }],
        meta: {},
        links: {},
      }

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult)

      const result = await controller.findAll(query)

      expect(result).toBe(expectedResult)
    })
  })

  describe('findOne', () => {
    it('should return a single provider by ID', async () => {
      const providerId = '1'
      const expectedResult: ProvidersEntity = {
        id: 1,
        name: 'Provider 1',
        NIF: '123456789',
        number: '123-45-6789',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult)

      const result = await controller.findOne(providerId)

      expect(result).toBe(expectedResult)
    })

    it('should throw a 404 error for non-existing provider ID', async () => {
      const nonExistingProviderId = '999'

      jest.spyOn(service, 'findOne').mockResolvedValue(undefined)

      await expect(
        controller.findOne(nonExistingProviderId),
      ).rejects.toThrowError('Provider not found')
    })
  })

  describe('create', () => {
    it('should create a new provider', async () => {
      const newProvider: ProvidersEntity = {
        name: 'New Provider',
        id: 0,
        NIF: '123456789',
        number: ' 123-45-6789',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }
      const expectedResult: ProvidersEntity = {
        id: 1,
        name: 'New Provider',
        NIF: ' 123456789',
        number: '123-45-6789',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult)

      const result = await controller.create(newProvider)

      expect(result).toBe(expectedResult)
    })
  })

  describe('update', () => {
    it('should update an existing provider by ID', async () => {
      const providerId = '1'
      const updatedProvider: ProvidersEntity = {
        id: 1,
        name: 'Updated Provider',
        NIF: '123456789',
        number: '123-45-6789',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }
      const expectedResult: ProvidersEntity = {
        id: 1,
        name: 'Updated Provider',
        NIF: '123456789',
        number: '123-45-6789',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult)

      const result = await controller.update(providerId, updatedProvider)

      expect(result).toBe(expectedResult)
    })

    it('should throw a 404 error for non-existing provider ID during update', async () => {
      const nonExistingProviderId = '999'
      const updatedProvider: ProvidersEntity = {
        id: 1,
        name: 'Updated Provider',
        NIF: '123456789',
        number: '123-45-6789',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }

      jest.spyOn(service, 'update').mockResolvedValue(undefined)

      await expect(
        controller.update(nonExistingProviderId, updatedProvider),
      ).rejects.toThrowError('Provider not found')
    })
  })

  describe('remove', () => {
    it('should remove an existing provider by ID', async () => {
      const providerId = '1'

      jest.spyOn(service, 'remove').mockResolvedValue(undefined)

      const result = await controller.remove(providerId)

      expect(result).toBeUndefined()
    })

    it('should throw a 404 error for non-existing provider ID during removal', async () => {
      const nonExistingProviderId = '999'

      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new Error('Provider not found'))

      await expect(
        controller.remove(nonExistingProviderId),
      ).rejects.toThrowError('Provider not found')
    })
  })
})
