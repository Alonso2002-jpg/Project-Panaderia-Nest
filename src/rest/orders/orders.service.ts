import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {PaginateModel} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {Order, OrderDocument} from "./schemas/order.schema";
import {InjectRepository} from "@nestjs/typeorm";
import {Product} from "../product/entities/product.entity";
import { Repository } from 'typeorm'
import { OrderMapper } from './mappers/orders.mapper'
export const OrderByValues: string[] = ['_id', 'idUser'];
export const OrderValues: string[] = ['asc', 'desc'];
@Injectable()
export class OrdersService {

  private logger = new Logger(OrdersService.name);

  constructor(
      @InjectModel(Order.name)
      private ordersRepository: PaginateModel<OrderDocument>,
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
     @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly orderMapper: OrderMapper,
  ) {
  }
  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(`Creating order: ${JSON.stringify(createOrderDto)}`)
    console.log(`Saving order: ${createOrderDto}`)
    const orderToBeSaved = this.orderMapper.toEntity(createOrderDto)
    await this.checkOrder(orderToBeSaved)
    const orderToSave = await this.reserveStockOrder(orderToBeSaved)
    orderToSave.createdAt = new Date()
    orderToSave.updatedAt = new Date()
    return await this.ordersRepository.create(orderToSave)
  }

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

  async findOne(id: string) {
    this.logger.log(`Searching order with id ${id}`)
    const orderFound = await this.ordersRepository.findById(id).exec()
    if(!orderFound){
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    return orderFound;
  }

  async findByIdUser(idUser: number) {
    this.logger.log(`Searching orders by user ${idUser}`)
    return await this.ordersRepository.find({ idUser }).exec()
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    this.logger.log(`Updating order with id ${id} y ${JSON.stringify(updateOrderDto)}`,)
    const orderUpdated = await this.ordersRepository.findById(id).exec()
    if (!orderUpdated) {
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    const orderSaved = this.orderMapper.toEntity(updateOrderDto)
    await this.returnStockOrder(orderUpdated)
    await this.checkOrder(orderSaved)
    const ordersToSave = await this.reserveStockOrder(orderSaved)
    ordersToSave.updatedAt = new Date()
    return await this.ordersRepository.findByIdAndUpdate(id, ordersToSave, { new: true }).exec()
  }

  async remove(id:string){
    this.logger.log(`Deleted order with id ${id}`);

    const orderToDelete = await this.ordersRepository.findById(id).exec();
    if (!orderToDelete){
      throw new NotFoundException(`Order with id ${id} not found`)
    }
    await this.returnStockOrder(orderToDelete);
    await this.ordersRepository.findByIdAndDelete(id).exec();
  }

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
      if (!product) {
        throw new BadRequestException(
            'The product with id ${orderLine.idProduct} does not exist',
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

  private async reserveStockOrder(order: Order){
    this.logger.log(`Reserving order quantity: ${order}`)
    if(!order.orderLine || order.orderLine.length === 0){
      throw new BadRequestException(`No line items have been added`)
    }
    for(const orderLine1 of order.orderLine){
      const product = await this.productRepository.findOneBy({
        id: orderLine1.idProduct
      })
      product.stock -= orderLine1.stock;
      await this.productRepository.save(product)
      orderLine1.total = orderLine1.stock * orderLine1.priceProduct;
    }
    order.total = order.orderLine.reduce(
        (sum, orderLine) =>
            sum + orderLine.stock * orderLine.priceProduct,
        0
    )
    order.totalItems = order.orderLine.reduce(
        (sum, orderLine) => sum + orderLine.stock,
        0,
    )
    return order;
  }

  private async returnStockOrder(order: Order): Promise<Order> {
    this.logger.log(`Returning order stock: ${order}`);
    if (order.orderLine) {
      for (const orderLine1 of order.orderLine) {
        const product = await this.productRepository.findOneBy({ id: orderLine1.idProduct, })
        product.stock += orderLine1.stock
        await this.productRepository.save(product)
      }
    }
    return order;
  }

  async userExists(idUser: number): Promise<boolean> {
    this.logger.log(`Checking if the user exists ${idUser}`)
    const user = await this.userRepository.findOneBy({ id: idUser })
    return !!user
  }

  async getOrderByUser(idUser: number): Promise<Order[]> {
    this.logger.log(`Searching orders by user ${idUser}`)
    return await this.ordersRepository.find({ idUser }).exec()
  }
}
