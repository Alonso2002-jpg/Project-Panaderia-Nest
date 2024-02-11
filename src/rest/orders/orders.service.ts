import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { PaginateModel } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Order, OrderDocument } from './schemas/order.schema'
import { InjectRepository } from '@nestjs/typeorm'
import { Product } from '../product/entities/product.entity'
import { Repository } from 'typeorm'
import { OrderMapper } from './mappers/orders.mapper'
import { User } from '../user/entities/user.entity'
export const OrderByValues: string[] = ['_id', 'idUser']
export const OrderValues: string[] = ['asc', 'desc']

/**
 * Servicio para gestionar ordenes.
 */
@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name)

  constructor(
    @InjectModel(Order.name)
    private ordersRepository: PaginateModel<OrderDocument>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly orderMapper: OrderMapper,
  ) {}

  /**
   * Crea una nueva orden.
   * @param createOrderDto Los datos de la orden a crear.
   * @returns La orden creada.
   */
  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(`Creating order: ${JSON.stringify(createOrderDto)}`)
    console.log(`Saving order: ${JSON.stringify(createOrderDto)}`)
    const orderToBeSaved = this.orderMapper.toEntity(createOrderDto)
    await this.checkOrder(orderToBeSaved)
    const orderToSave = await this.reserveStockOrder(orderToBeSaved)
    orderToSave.createdAt = new Date()
    orderToSave.updatedAt = new Date()
    return await this.ordersRepository.create(orderToSave)
  }

  /**
   * Busca todas las ordenes con paginación y filtros.
   * @param page El numero de pagina.
   * @param limit El limite de resultados por pagina.
   * @param orderBy El campo por el que ordenar los resultados.
   * @param order La direccion de la ordenacion (ascendente o descendente).
   * @returns Una lista paginada de ordenes.
   */
  async findAll(page: number, limit: number, orderBy: string, order: string) {
    this.logger.log(
      `Searching all orders with pagination and filters: ${JSON.stringify({
        page,
        limit,
        orderBy,
        order,
      })}`,
    )
    const options = {
      page,
      limit,
      sort: {
        [orderBy]: order,
      },
      collection: 'es_ES',
    }

    return await this.ordersRepository.paginate({}, options)
  }

  /**
   * Busca una orden por su ID.
   * @param id El ID de la orden a buscar.
   * @returns La orden encontrada.
   * @throws NotFoundException Si no se encuentra la orden con el ID especificado.
   */
  async findOne(id: string) {
    this.logger.log(`Searching order with id ${id}`)
    const orderFound = await this.ordersRepository.findById(id).exec()
    if (!orderFound) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    return orderFound
  }

  /**
   * Busca ordenes por el ID del usuario.
   * @param idUser El ID del usuario cuyas ordenes se van a buscar.
   * @returns Una lista de ordenes asociadas al usuario.
   */
  async findByIdUser(idUser: number) {
    this.logger.log(`Searching orders by user ${idUser}`)
    return await this.ordersRepository.find({ idUser }).exec()
  }

  /**
   * Actualiza una orden existente.
   * @param id El ID de la orden a actualizar.
   * @param updateOrderDto Los datos actualizados de la orden.
   * @returns La orden actualizada.
   * @throws NotFoundException Si no se encuentra la orden con el ID especificado.
   */
  async update(id: string, updateOrderDto: UpdateOrderDto) {
    this.logger.log(
      `Updating order with id ${id} y ${JSON.stringify(updateOrderDto)}`,
    )
    const orderUpdated = await this.ordersRepository.findById(id).exec()
    if (!orderUpdated) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    const orderSaved = this.orderMapper.toEntity(updateOrderDto)
    await this.returnStockOrder(orderUpdated)
    await this.checkOrder(orderSaved)
    const ordersToSave = await this.reserveStockOrder(orderSaved)
    ordersToSave.updatedAt = new Date()
    return await this.ordersRepository
      .findByIdAndUpdate(id, ordersToSave, { new: true })
      .exec()
  }

  /**
   * Elimina una orden por su ID.
   * @param id El ID de la orden a eliminar.
   * @throws NotFoundException Si no se encuentra la orden con el ID especificado.
   */
  async remove(id: string) {
    this.logger.log(`Deleted order with id ${id}`)

    const orderToDelete = await this.ordersRepository.findById(id).exec()
    if (!orderToDelete) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    await this.returnStockOrder(orderToDelete)
    await this.ordersRepository.findByIdAndDelete(id).exec()
  }

  /**
   * Verifica la validez de una orden.
   * @param order La orden a verificar.
   * @throws BadRequestException Si la orden no es valida.
   */
  private async checkOrder(order: Order): Promise<void> {
    this.logger.log(`Checking order ${JSON.stringify(order)}`)
    if (!order.orderLine || order.orderLine.length === 0) {
      throw new BadRequestException(
        'No line items have been added to the current order',
      )
    }
    for (const orderLine of order.orderLine) {
      const product = await this.productRepository.findOneBy({
        id: orderLine.idProduct,
      })
      if (!product || product.isDeleted == true) {
        throw new BadRequestException(
          `The product with id ${orderLine.idProduct} does not exist`,
        )
      }
      if (product.stock < orderLine.stock && orderLine.stock > 0) {
        throw new BadRequestException(
          `The requested quantity is not valid or there is not enough stock of the product ${product.id}`,
        )
      }
      if (product.price !== orderLine.priceProduct) {
        throw new BadRequestException(
          `The order product price ${product.id} does not match the current product price`,
        )
      }
    }
  }

  /**
   * Reserva el stock de los productos en una orden.
   * @param order La orden para la cual se debe reservar el stock.
   * @returns La orden con el stock reservado.
   * @throws BadRequestException Si no se puede reservar el stock.
   */
  private async reserveStockOrder(order: Order) {
    this.logger.log(`Reserving order quantity: ${order}`)
    if (!order.orderLine || order.orderLine.length === 0) {
      throw new BadRequestException(`No line items have been added`)
    }
    for (const orderLine1 of order.orderLine) {
      const product = await this.productRepository.findOneBy({
        id: orderLine1.idProduct,
      })
      if (!product || product.isDeleted == true){
        throw new BadRequestException(`Orderline with product ${orderLine1.idProduct} cannot be updated or deleted because it is discontinued.`)
      }
      product.stock -= orderLine1.stock
      await this.productRepository.save(product)
      orderLine1.total = orderLine1.stock * orderLine1.priceProduct
    }
    order.total = order.orderLine.reduce(
      (sum, orderLine) => sum + orderLine.stock * orderLine.priceProduct,
      0,
    )
    order.totalItems = order.orderLine.reduce(
      (sum, orderLine) => sum + orderLine.stock,
      0,
    )
    return order
  }

  /**
   * Devuelve el stock de los productos reservados en una orden.
   * @param order La orden para la cual se debe devolver el stock.
   * @returns La orden con el stock devuelto.
   */
  private async returnStockOrder(order: Order): Promise<Order> {
    this.logger.log(`Returning order stock: ${order}`)
    if (order.orderLine) {
      for (const orderLine1 of order.orderLine) {
        const product = await this.productRepository.findOneBy({
          id: orderLine1.idProduct,
        })
        if (!product || product.isDeleted == true){
          throw new BadRequestException(`Orderline with product ${orderLine1.idProduct} cannot be updated or deleted because it is discontinued.`)
        }
        product.stock += orderLine1.stock
        await this.productRepository.save(product)
      }
    }
    return order
  }

  /**
   * Verifica si un usuario existe.
   * @param idUser El ID del usuario a verificar.
   * @returns `true` si el usuario existe, `false` si no.
   */
  async userExists(idUser: number): Promise<boolean> {
    this.logger.log(`Checking if the user exists ${idUser}`)
    const user = await this.userRepository.findOneBy({ id: idUser })
    return !!user
  }

  /**
   * Obtiene ordenes asociadas a un usuario.
   * @param idUser El ID del usuario cuyas ordenes se van a buscar.
   * @returns Una lista de ordenes asociadas al usuario.
   */
  async getOrderByUser(idUser: number): Promise<Order[]> {
    this.logger.log(`Searching orders by user ${idUser}`)
    return await this.ordersRepository.find({ idUser }).exec()
  }
}
