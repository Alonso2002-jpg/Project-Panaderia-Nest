import { Test, TestingModule } from '@nestjs/testing'
import { OrdersService } from './orders.service'
import { PaginateModel } from 'mongoose'
import { Order, OrderDocument } from './schemas/order.schema'
import { Repository } from 'typeorm'
import { Category } from '../category/entities/category.entity'
import { Product } from '../product/entities/product.entity'
import { User } from '../user/entities/user.entity'
import { OrderMapper } from './mappers/orders.mapper'
import { getModelToken } from '@nestjs/mongoose'
import { getRepositoryToken } from '@nestjs/typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateOrderDto } from './dto/create-order.dto'
import { ProvidersEntity } from '../providers/entities/providers.entity'
import { UpdateOrderDto } from './dto/update-order.dto'

describe('OrdersService', () => {
  let service: OrdersService
  let ordersRepository: PaginateModel<OrderDocument>
  let productRepository: Repository<Product>
  let userRepository: Repository<User>
  let mapper: OrderMapper

  const orderMapperMock = {
    toEntity: jest.fn(),
  }

  const updateOrderDto: UpdateOrderDto = {
    idUser: 1,
    client: {
      fullName: 'Obando Joselyn',
      email: 'jos@gmail.com',
      telephone: '72268531',
      address: {
        street: 'Avenida Rey Juan Carlos',
        number: '1',
        city: 'Leganes',
        province: 'Madrid',
        country: 'Spain',
        postCode: '28916',
      },
    },
    orderLine: [
      {
        idProduct: '5c9d94ac-344f-4992-a714-4243b0787263',
        priceProduct: 19.99,
        stock: 2,
        total: 39.98,
      },
    ],
  }

  const createOrderDto: CreateOrderDto = {
    idUser: 1,
    client: {
      fullName: 'Obando Joselyn',
      email: 'jos@gmail.com',
      telephone: '72268531',
      address: {
        street: 'Avenida Rey Juan Carlos',
        number: '1',
        city: 'Leganes',
        province: 'Madrid',
        country: 'Spain',
        postCode: '28916',
      },
    },
    orderLine: [
      {
        idProduct: '5c9d94ac-344f-4992-a714-4243b0787263',
        priceProduct: 19.99,
        stock: 1,
        total: 19.99,
      },
    ],
  }

  const product: Product = {
    id: '5c9d94ac-344f-4992-a714-4243b0787263',
    name: 'Pan de Barra',
    price: 19.99,
    stock: 60,
    image: 'ejemplo.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: new Category(),
    provider: new ProvidersEntity(),
    isDeleted: false,
  }

  const productTwo: Product = {
    id: '5c9d94ac-344f-4992-a714-4243b0787263',
    name: 'Pan de Barra',
    price: 19.99,
    stock: 60,
    image: 'ejemplo.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: new Category(),
    provider: new ProvidersEntity(),
    isDeleted: false,
  }

  const order = {
    idUser: 1,
    client: {
      fullName: 'Obando Joselyn',
      email: 'jos@gmail.com',
      telephone: '72268531',
      address: {
        street: 'Avenida Rey Juan Carlos',
        number: '1',
        city: 'Leganes',
        province: 'Madrid',
        country: 'Spain',
        postCode: '28916',
      },
    },
    orderLine: [
      {
        idProduct: '5c9d94ac-344f-4992-a714-4243b0787263',
        priceProduct: 19.99,
        stock: 1,
        total: 19.99,
      },
    ],
    totalItems: 1,
    total: 19.99,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  }

  const orderTwo = {
    idUser: 1,
    client: {
      fullName: 'Obando Joselyn',
      email: 'jos@gmail.com',
      telephone: '72268531',
      address: {
        street: 'Avenida Rey Juan Carlos',
        number: '1',
        city: 'Leganes',
        province: 'Madrid',
        country: 'Spain',
        postCode: '28916',
      },
    },
    orderLine: [
      {
        idProduct: '5c9d94ac-344f-4992-a714-4243b0787263',
        priceProduct: 19.99,
        stock: 1,
        total: 19.99,
      },
    ],
    totalItems: 1,
    total: 19.99,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            paginate: jest.fn(),
            findById: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
          },
        },
        { provide: getRepositoryToken(Product), useClass: Repository },
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: OrderMapper, useValue: orderMapperMock },
      ],
    }).compile()

    service = module.get<OrdersService>(OrdersService)
    ordersRepository = module.get<PaginateModel<OrderDocument>>(
      getModelToken(Order.name),
    )
    productRepository = module.get(getRepositoryToken(Product))
    userRepository = module.get(getRepositoryToken(User))
    mapper = module.get<OrderMapper>(OrderMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('FindAll', () => {
    it('should find all order with pagination and filters', async () => {
      const page = 1
      const limit = 10
      const orderBy = 'id'
      const order = 'ASC'
      const mockOrders = [{}]

      jest
        .spyOn(ordersRepository, 'paginate')
        .mockImplementationOnce(async () => ({ docs: mockOrders }) as any)

      const result = await service.findAll(page, limit, orderBy, order)

      expect(ordersRepository.paginate).toHaveBeenCalledWith(
        {},
        {
          page,
          limit,
          sort: { [orderBy]: order },
          collection: 'es_ES',
        },
      )
      // expect(result).toEqual(mockOrders)
    })
  })

  describe('FindOne', () => {
    it('should find an order by ID', async () => {
      const orderId = 'some-order-id'
      const order = new Order()

      jest.spyOn(ordersRepository, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(order),
      } as any)

      const result = await service.findOne(orderId)

      expect(ordersRepository.findById).toHaveBeenCalledWith(orderId)

      expect(result).toEqual(order)
    })

    it('should throw an error if order doesn`t exist', async () => {
      jest.spyOn(ordersRepository, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      } as any)

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a new order', async () => {
      jest.spyOn(mapper, 'toEntity').mockReturnValue(order)
      jest.spyOn(ordersRepository, 'create').mockResolvedValue(order as any)
      jest
        .spyOn(productRepository, 'findOneBy')
        .mockReturnValue(Promise.resolve(product))
      jest
        .spyOn(productRepository, 'save')
        .mockReturnValue(Promise.resolve(product))

      const result = await service.create(createOrderDto)

      expect(result).toEqual(order)
    })
    it('should throw an error if the product in orderLine doesn`t exist', async () => {
      jest.spyOn(mapper, 'toEntity').mockReturnValue(order)
      jest
        .spyOn(productRepository, 'findOneBy')
        .mockReturnValue(Promise.resolve(null))

      await expect(service.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw an error if the product price doesn`t match with the orderLine price', async () => {
      product.price = 18.99
      jest.spyOn(mapper, 'toEntity').mockReturnValue(order)
      jest
        .spyOn(productRepository, 'findOneBy')
        .mockReturnValue(Promise.resolve(product))

      await expect(service.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      )
    })
    it('should throw an error order doesn`t have orderLines', async () => {
      order.orderLine = []
      jest.spyOn(mapper, 'toEntity').mockReturnValue(order)
      jest
        .spyOn(productRepository, 'findOneBy')
        .mockReturnValue(Promise.resolve(product))

      await expect(service.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      )
    })
    it('should throw an error if there isn`t enough product stock ', async () => {
      product.stock = 5
      jest.spyOn(mapper, 'toEntity').mockReturnValue(order)
      jest
        .spyOn(productRepository, 'findOneBy')
        .mockReturnValue(Promise.resolve(product))

      await expect(service.create(createOrderDto)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('update', () => {
    it('should update an order by id', async () => {
      jest.spyOn(ordersRepository, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(orderTwo),
      } as any)
      jest.spyOn(ordersRepository, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(orderTwo),
      } as any)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(orderTwo)
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(productTwo)
      jest.spyOn(productRepository, 'save').mockResolvedValue(productTwo)

      const result = await service.update('some-order-id', updateOrderDto)

      expect(result).toEqual(orderTwo)
      expect(productRepository.save).toHaveBeenCalled()
      expect(productRepository.findOneBy).toHaveBeenCalled()
      expect(mapper.toEntity).toHaveBeenCalled()
    })
    it('should throw an error if the order doesn`t exist', async () => {
      const id: string = 'some-order-id'
      jest.spyOn(ordersRepository, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(undefined),
      } as any)

      await expect(service.update(id, new UpdateOrderDto())).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should remove a order by id', async () => {
      const orderId: string = 'some-id'

      jest.spyOn(ordersRepository, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(order),
      } as any)
      jest.spyOn(ordersRepository, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(order),
      } as any)
      jest.spyOn(productRepository, 'save').mockResolvedValue(product)
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValue(product)

      await service.remove(orderId)

      expect(ordersRepository.findById).toHaveBeenCalledWith(orderId)
      expect(ordersRepository.findByIdAndDelete).toHaveBeenCalled()
    })
    it('should remove throw an error if order doesn`t exist', async () => {
      const orderId: string = 'some-id'

      jest.spyOn(ordersRepository, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any)

      await expect(service.remove(orderId)).rejects.toThrow(NotFoundException)
    })
  })
})
