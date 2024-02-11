import { Test, TestingModule } from '@nestjs/testing'
import { ProvidersController } from './providers.controller'
import { ProvidersService } from './providers.service'
import { ProvidersEntity } from './entities/providers.entity'
import { CreateProvidersDto } from './dto/create-providers.dto'
import { UpdateProvidersDto } from './dto/update-providers.dto'
import { PaginateQuery } from 'nestjs-paginate'
import { ProvidersResponseDto } from './dto/response-providers.dto'
import { CacheModule } from '@nestjs/cache-manager'

describe('ProvidersController', () => {
  let controller: ProvidersController
  let service: ProvidersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [
        {
          provide: ProvidersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
      imports: [CacheModule.register()],
    }).compile()

    controller = module.get<ProvidersController>(ProvidersController)
    service = module.get<ProvidersService>(ProvidersService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of providers', async () => {
      const result: ProvidersEntity[] = [
        {
          id: 1,
          NIF: '123456789',
          number: '123',
          name: 'Proveedor 1',
          CreationDate: new Date('2024-02-11T12:00:00Z'),
          UpdateDate: new Date('2024-02-11T12:00:00Z'),
          type: {
            id: 1,
            nameCategory: 'Category',
            createdAt: undefined,
            updatedAt: undefined,
            isDeleted: false,
            products: [],
            providers: [],
            personal: [],
          },
          products: [
            {
              id: '1',
              name: 'Producto 1',
              price: 10,
              stock: 10,
              image: 'https://via.placeholder.com/150',
              category: undefined,
              createdAt: new Date('2024-02-11T12:00:00Z'),
              updatedAt: new Date('2024-02-11T12:00:00Z'),
              isDeleted: false,
              provider: {
                id: 1,
                NIF: '123456789',
                number: '123',
                name: 'Proveedor 1',
                CreationDate: new Date('2024-02-11T12:00:00Z'),
                UpdateDate: new Date('2024-02-11T12:00:00Z'),
                type: {
                  id: 1,
                  nameCategory: 'Category',
                  createdAt: undefined,
                  updatedAt: undefined,
                  isDeleted: false,
                  products: [],
                  providers: [],
                  personal: [],
                },
                products: [],
              },
            },
          ],
        },
      ]
      jest.spyOn(service, 'findAll').mockResolvedValue(result)

      expect(await controller.findAll({} as PaginateQuery)).toBe(result)
    })
  })

  describe('findOne', () => {
    it('should return a provider by ID', async () => {
      const id = 1
      const result: ProvidersResponseDto = <ProvidersResponseDto>{
        NIF: '123456789',
        number: '123',
        name: 'Proveedor 1',
        CreationDate: new Date('2024-02-11T12:00:00Z'),
        UpdateDate: new Date('2024-02-11T12:00:00Z'),
        id: 0,
      }
      jest.spyOn(service, 'findOne').mockResolvedValue(result)

      expect(await controller.findOne(id)).toBe(result)
    })
  })

  describe('create', () => {
    it('should create a new provider', async () => {
      const providerDto: CreateProvidersDto = {
        type: 'Category',
        NIF: '123456789',
        number: '123',
        name: 'Proveedor 1',
      }
      const result: ProvidersResponseDto = {
        type: undefined,
        id: 1,
        NIF: '123456789',
        number: '123',
        name: 'Proveedor 1',
        CreationDate: new Date('2024-02-11T12:00:00Z'),
        UpdateDate: new Date('2024-02-11T12:00:00Z'),
      }
      jest.spyOn(service, 'create').mockResolvedValue(result)

      expect(await controller.create(providerDto)).toBe(result)
    })
  })

  describe('update', () => {
    it('should update a provider by ID', async () => {
      const id = 1
      const updateDto: UpdateProvidersDto = {
        type: 'Category',
        NIF: '123456789',
        number: '123',
        name: 'Proveedor 1',
      }
      const result: ProvidersResponseDto = {
        type: undefined,
        id: 1,
        NIF: '123456789',
        number: '123',
        name: 'Proveedor 1',
        CreationDate: new Date('2024-02-11T12:00:00Z'),
        UpdateDate: new Date('2024-02-11T12:00:00Z'),
      }
      jest.spyOn(service, 'update').mockResolvedValue(result)

      expect(await controller.update(id, updateDto)).toBe(result)
    })
  })

  describe('remove', () => {
    it('should remove a provider by ID', async () => {
      const id = '1'
      jest.spyOn(service, 'remove').mockResolvedValue(undefined)

      await expect(controller.remove(id)).resolves.toBeUndefined()
    })
  })
})
