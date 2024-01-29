import { CreateOrderDto } from '../dto/create-order.dto';
import { plainToClass } from 'class-transformer';
import { Order } from '../schemas/order.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderMapper{
  toEntity(createOrderDto: CreateOrderDto): Order {
    return plainToClass(Order, createOrderDto)
    }
}