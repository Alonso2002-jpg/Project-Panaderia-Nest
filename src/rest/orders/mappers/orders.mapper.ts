import { CreateOrderDto } from '../dto/create-order.dto';
import { plainToClass } from 'class-transformer';
import { Order } from '../schemas/order.schema';
import { Injectable } from '@nestjs/common';
import {UpdateOrderDto} from "../dto/update-order.dto";

@Injectable()
export class OrderMapper{
  toEntity(createOrderDto: CreateOrderDto | UpdateOrderDto): Order {
    return plainToClass(Order, createOrderDto)
    }
}