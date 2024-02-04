import { PartialType } from '@nestjs/mapped-types';
import { ClientDto, CreateOrderDto, OrderLineDto } from './create-order.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @IsNumber()
    @IsNotEmpty()
    idUser: number

    @IsNotEmpty()
    client: ClientDto

    @IsNotEmpty()
    orderLine: OrderLineDto[]
}
