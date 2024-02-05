import { Test, TestingModule } from '@nestjs/testing'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { Order } from './schemas/order.schema'
import { CreateOrderDto } from './dto/create-order.dto'
import { NotFoundException } from '@nestjs/common'
import { UpdateOrderDto } from './dto/update-order.dto'

describe('OrdersController', () => {
  let controller: OrdersController
  let service: OrdersService

  const ordersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByIdUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersServiceMock }],
    }).compile()

    controller = module.get<OrdersController>(OrdersController)
    service = module.get<OrdersService>(OrdersService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all orders', async () => {
      const orders: any = {}
      const page = 1
      const limit = 20
      const orderBy = 'idUser'
      const order = 'asc'

      jest.spyOn(service, 'findAll').mockResolvedValue(orders)

      const result = await controller.findAll(page, limit, orderBy, order)

      expect(service.findAll).toHaveBeenCalled()
      expect(result).toBeDefined()
    })
  })

  describe('create', () => {
    it('should return a new order', async () => {
      const order: any = {}
      jest.spyOn(service, 'create').mockResolvedValue(order)
      const result = await controller.create(new CreateOrderDto())
      expect(result).toEqual(order)
    })
  })

  describe('update', () => {
    it('should return an updated order', async () => {
      const order: any = {}
      jest.spyOn(service, 'update').mockResolvedValue(order)
      const result = await controller.update('order-id', new UpdateOrderDto())
      expect(result).toEqual(order)
    })
  })

  describe('findOne', () => {
    it('should return a order by id', async () => {
      const order: any = {}
      jest.spyOn(service, 'findOne').mockResolvedValue(order)
      const result = await controller.findOne('order-id')
      expect(result).toEqual(order)
    })
    it('should throw an error if order doesn`t exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne('order-id')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('findOrdersUser', () => {
    it('should return all orders associated to an user id', async () => {
      const orders: any[] = [new Order(), new Order()]
      jest.spyOn(service, 'findByIdUser').mockResolvedValue(orders)

      const result = await controller.findOrdersUser(1)

      expect(result).toEqual(orders)
      expect(result.length).toBe(2)
    })
  })

  describe('remove', () => {
    it('should delete an order by id', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined)

      await controller.remove('order-id')

      expect(service.remove).toHaveBeenCalled()
    })
  })
})
