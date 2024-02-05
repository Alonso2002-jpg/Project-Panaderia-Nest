import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { OrderValidatePipe } from './pipes/order-validate.pipe'
import { IdValidatePipe } from './pipes/id-validate.pipe'
import { ApiExcludeController } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '../auth/guards/rols-auth.guard'
import { UserExistsGuard } from './guards/user-exists.guard'
import {OrderByValidatePipe} from "./pipes/orderBy-validate.pipe";

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesAuthGuard)
@ApiExcludeController()
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name)
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log(`Creating order ${JSON.stringify(createOrderDto)}`)
    return await this.ordersService.create(createOrderDto)
  }

  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number = 1,
    @Query('limit', new DefaultValuePipe(20)) limit: number = 20,
    @Query('orderBy', new DefaultValuePipe('idUser'), new OrderByValidatePipe())
    orderBy: string = 'idUser',
    @Query('order', new DefaultValuePipe('asc'), new OrderValidatePipe())
    order: string,
  ) {
    this.logger.log(
      `Searching all orders with: ${JSON.stringify({
        page,
        limit,
        orderBy,
        order,
      })}`,
    )
    return await this.ordersService.findAll(page, limit, orderBy, order)
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', IdValidatePipe) id: string) {
    this.logger.log(`Searching order with id ${id}`)
    return await this.ordersService.findOne(id)
  }

  @Get('usuario/:idUsuario')
  @Roles('ADMIN')
  async findOrdersUser(@Param('idUser', ParseIntPipe) idUser: number) {
    this.logger.log(`Searching orders by user ${idUser}`)
    return await this.ordersService.findByIdUser(idUser)
  }

  @Put(':id')
  @Roles('ADMIN')
  @UseGuards(UserExistsGuard)
  async update(
    @Param('id', new IdValidatePipe()) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    this.logger.log(
      `Updating order with id ${id} y ${JSON.stringify(updateOrderDto)}`,
    )
    return await this.ordersService.update(id, updateOrderDto)
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('ADMIN')
  async remove(@Param('id', new IdValidatePipe()) id: string) {
    this.logger.log(`Deleting order with id${id}`)
    await this.ordersService.remove(id)
  }
}
