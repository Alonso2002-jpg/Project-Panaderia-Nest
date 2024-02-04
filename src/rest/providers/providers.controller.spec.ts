import { Test, TestingModule } from '@nestjs/testing'
import { ProvidersController } from './providers.controller'
import { ProvidersService } from './providers.service'
import { ProvidersEntity } from './entities/providers.entity'
import { Paginated } from 'nestjs-paginate'
import { Category } from '../category/entities/category.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { NotFoundException } from '@nestjs/common'
import { UpdateProvidersDto } from './dto/update-providers.dto'
describe('ProvidersController', () => {
  let controller: ProvidersController
  let service: ProvidersService

  const providersServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ProvidersController],
      providers: [
        { provide: ProvidersService, useValue: providersServiceMock },
      ],
    }).compile()

    controller = module.get<ProvidersController>(ProvidersController)
    service = module.get<ProvidersService>(ProvidersService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should get all Providers', async () => {
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

      jest.spyOn(service, 'findAll').mockResolvedValue(testProviders)
      const result: any = await controller.findAll(paginateOptions)

      // console.log(result)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      // Expect the result to have the correct currentPage
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      // Expect the result to have the correct totalPages
      expect(result.meta.totalPages).toEqual(1) // You may need to adjust this value based on your test case
      // Expect the result to have the correct current link
      expect(result.links.current).toEqual(
        `Providers?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=nombre:ASC`,
      )
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should get one Provider', async () => {
      const id = 1
      const mockResult: ProvidersEntity = new ProvidersEntity()

      jest.spyOn(service, 'findOne').mockResolvedValue(mockResult)
      await controller.findOne(id)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(mockResult).toBeInstanceOf(ProvidersEntity)
    })

    it('should throw NotFoundException if provider does not exist', async () => {
      const id = 1
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a provider', async () => {
      const dto: ProvidersEntity = {
        id: 1,
        name: 'Provider 1',
        NIF: '123456789',
        number: '123-45-6789',
        CreationDate: undefined,
        UpdateDate: undefined,
        type: new Category(),
        products: [],
      }
      const mockResult: ProvidersEntity = new ProvidersEntity()
      jest.spyOn(service, 'create').mockResolvedValue(mockResult)
      await controller.create(dto)
      expect(service.create).toHaveBeenCalledWith(dto)
      expect(mockResult).toBeInstanceOf(ProvidersEntity)
    })
  })

  describe('update', () => {
    it('should update a provider', async () => {
      const id = 1
      const dto: UpdateProvidersDto = {
        id: 1,
        name: 'Provider 1',
        NIF: '123456789',
        number: '123-45-6789',
      }
      const mockResult: ProvidersEntity = new ProvidersEntity()
      jest.spyOn(service, 'update').mockResolvedValue(mockResult)
      await controller.update(id, dto)
      expect(service.update).toHaveBeenCalledWith(id, dto)
      expect(mockResult).toBeInstanceOf(ProvidersEntity)
    })

    it('should throw NotFoundException if provider does not exist', async () => {
      const id = 1
      const dto: UpdateProvidersDto = { NIF: '', id: 0, name: '', number: '' }
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())
      await expect(controller.update(id, dto)).rejects.toThrow(
        NotFoundException,
      )
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
        .mockRejectedValue(new NotFoundException('Provider not found'))
      await expect(
        controller.remove(nonExistingProviderId),
      ).rejects.toThrowError(NotFoundException)
    })
  })
})
