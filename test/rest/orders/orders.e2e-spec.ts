import { INestApplication, NotFoundException} from '@nestjs/common'
import { UpdateOrderDto } from '../../../src/rest/orders/dto/update-order.dto'
import { CreateOrderDto } from '../../../src/rest/orders/dto/create-order.dto'
import { Product } from '../../../src/rest/product/entities/product.entity'
import { Category } from '../../../src/rest/category/entities/category.entity'
import { ProvidersEntity } from '../../../src/rest/providers/entities/providers.entity'
import { Test, TestingModule } from '@nestjs/testing'
import { OrdersController } from '../../../src/rest/orders/orders.controller'
import { OrdersService } from '../../../src/rest/orders/orders.service'
import * as request from 'supertest'
import { JwtAuthGuard } from '../../../src/rest/auth/guards/jwt-auth.guard'
import { RolesAuthGuard } from '../../../src/rest/auth/guards/rols-auth.guard'

describe('OrdersController (e2e)', () => {
  let app: INestApplication
  const myEndPoint: string = `/orders`

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

  const mockOrderService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByIdUser: jest.fn(),
    userExists: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        { provide: OrdersService, useValue: mockOrderService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesAuthGuard)
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /orders', () => {
    it('should return a page of orders', async () => {
      mockOrderService.findAll.mockResolvedValue([])

      const { body } = await request(app.getHttpServer())
        .get(myEndPoint)
        .expect(200)
      expect(() => {
        expect(body).toEqual([])
        expect(mockOrderService.findAll).toHaveBeenCalled()
      })
    })
  })

  describe('GET /orders/:id', () => {
    it('should return a order by id', async () => {
      mockOrderService.findOne.mockResolvedValue(order)

      const { body } = await request(app.getHttpServer())
        .get(`${myEndPoint}/5f70f0e0a177a50c9c59b5c0`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(order)
        expect(mockOrderService.findOne).toHaveBeenCalled()
      })
    })
    it('should throw an error if order doesn`t exist', async () => {
      mockOrderService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${myEndPoint}/5f70f0e0a177a50c9c59b5c0`)
        .expect(404)
    })
    it('should throw an error if id is not valid', async () => {
      await request(app.getHttpServer()).get(`${myEndPoint}/1`).expect(400)
    })
  })

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      mockOrderService.create.mockResolvedValue(order)

      const { body } = await request(app.getHttpServer())
        .post(myEndPoint)
        .send(createOrderDto)
        .expect(201)
      expect(() => {
        expect(body).toEqual(order)
        expect(mockOrderService.create).toHaveBeenCalledWith(createOrderDto)
      })
    })
  })

  describe('PUT /orders/:id', () => {
    it('should update an order', async () => {
      mockOrderService.userExists.mockResolvedValue(true)
      mockOrderService.update.mockResolvedValue(order)

      const { body } = await request(app.getHttpServer())
        .put(`${myEndPoint}/5f70f0e0a177a50c9c59b5c0`)
        .send(updateOrderDto)
        .expect(200)
      expect(() => {
        expect(body).toEqual(order)
        expect(mockOrderService.update).toHaveBeenCalledWith(
          '5f70f0e0a177a50c9c59b5c0',
          updateOrderDto,
        )
      })
    })
    it('should throw an error if Id is not valid', async () => {
      mockOrderService.userExists.mockResolvedValue(true)
      await request(app.getHttpServer())
        .put(`${myEndPoint}/1}`)
        .send(updateOrderDto)
        .expect(400)
    })
    it('should throw an error if user doesn´t exist', async () => {
      mockOrderService.userExists.mockResolvedValue(false)
      await request(app.getHttpServer())
        .put(`${myEndPoint}/5f70f0e0a177a50c9c59b5c0}`)
        .send(updateOrderDto)
        .expect(400)
    })
  })

  describe('DELETE /orders/:id', () => {
    it('should delete an order', async () => {
      mockOrderService.remove.mockResolvedValue(order)

      await request(app.getHttpServer())
        .delete(`${myEndPoint}/5f70f0e0a177a50c9c59b5c0`)
        .expect(204)
    })
    it('should throw an error if the order doesn`t exist', async () => {
      mockOrderService.remove.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .delete(`${myEndPoint}/5f70f0e0a177a50c9c59b5c0`)
        .expect(404)
    })
  })
})
