import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiExcludeController } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'
import { RolsExistsGuard } from './guards/rols.exists.guard'
import { UsersService } from './user.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import {Roles, RolesAuthGuard} from '../auth/guards/rols-auth.guard'
import { IdValidatePipe } from '../orders/pipes/id-validate.pipe'
import { CreateOrderDto } from '../orders/dto/create-order.dto'
import { UpdateOrderDto } from '../orders/dto/update-order.dto'

@Controller('users')
@UseInterceptors(CacheInterceptor) // Aplicar el interceptor aquí de cache
@UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí para autenticados con JWT y Roles (lo aplico a nivel de controlador)
@ApiExcludeController()
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  /// GESTION, SOLO ADMINISTRADOR

  @Get()
  @Roles('ADMIN')
  async findAll() {
    this.logger.log('findAll')
    return await this.usersService.findAll()
  }

  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`findOne: ${id}`)
    return await this.usersService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('create')
    return await this.usersService.create(createUserDto)
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.logger.log(`update: ${id}`)
    return await this.usersService.update(id, updateUserDto, true)
  }

  // ME/PROFILE, CUALQUIER USUARIO AUTENTICADO
  @Get('me/profile')
  @Roles('USER')
  async getProfile(@Req() request: any) {
    return request.user
  }

  @Delete('me/profile')
  @HttpCode(204)
  @Roles('USER')
  async deleteProfile(@Req() request: any) {
    return await this.usersService.deleteById(request.user.id)
  }

  @Put('me/profile')
  @Roles('USER')
  async updateProfile(
    @Req() request: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(request.user.id, updateUserDto, false)
  }

  // ME/PEDIDOS, CUALQUIER USUARIO AUTENTICADO Y VENDEDORES siempre y cuando el id del usuario coincida con el id del pedido
  @Get('me/orders')
  @Roles('ADMIN', 'SELLER')
  async getOrders(@Req() request: any) {
    return await this.usersService.getOrders(+request.user.id)
  }

  @Get('me/orders/:id')
  @Roles('ADMIN', 'SELLER')
  async getOrder(
    @Req() request: any,
    @Param('id', IdValidatePipe) id: ObjectId,
  ) {
    return await this.usersService.getOrder(request.user.id, id)
  }

  @Post('me/order')
  @HttpCode(201)
  @Roles('ADMIN', 'SELLER')
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: any,
  ) {
    this.logger.log(`Creando pedido ${JSON.stringify(createOrderDto)}`)
    return await this.usersService.createPedido(createOrderDto, request.user.id)
  }

  @Put('me/orders/:id')
  @Roles('ADMIN')
  async updatePedido(
    @Param('id', IdValidatePipe) id: ObjectId,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() request: any,
  ) {
    this.logger.log(
      `Actualizando pedido con id ${id} y ${JSON.stringify(updateOrderDto)}`,
    )
    return await this.usersService.updatePedido(
      id,
      updateOrderDto,
      request.user.id,
    )
  }

  @Delete('me/orders/:id')
  @HttpCode(204)
  @Roles('ADMIN')
  async removePedido(
    @Param('id', IdValidatePipe) id: ObjectId,
    @Req() request: any,
  ) {
    this.logger.log(`Eliminando pedido con id ${id}`)
    await this.usersService.removePedido(id, request.user.id)
  }
}
