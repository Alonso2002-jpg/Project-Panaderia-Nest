import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersMapper } from './mapper/users.mapper'
import { Role, UserRole } from './entities/user.roles.entity'
import { OrdersService } from '../orders/orders.service'
import { BcryptService } from '../utils/bcrypt/bcrypt.services'
import { CreateOrderDto } from '../orders/dto/create-order.dto'
import { UpdateOrderDto } from '../orders/dto/update-order.dto'
import { PersonalService } from '../personal/personal.service'
import { PersonalEntity } from '../personal/entities/personal.entity'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly personalService: PersonalService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersMapper,
    private readonly bcryptService: BcryptService,
  ) {}

  async findAll() {
    this.logger.log('findAll')
    return (await this.usersRepository.find()).map((u) =>
      this.usersService.toResponseDto(u),
    )
  }

  async findOne(id: number) {
    this.logger.log(`findOne: ${id} en service`)
    const userFind = await this.usersRepository.findOneBy({ id })
    if (!userFind) {
      throw new NotFoundException(`User not found with id ${id}`)
    }
    return this.usersService.toResponseDto(userFind)
  }

  async create(createUserDto: CreateUserDto) {
    this.logger.log('create')
    const existingUser = await Promise.all([
      this.findByUsername(createUserDto.username),
      this.findByEmail(createUserDto.email),
    ])
    if (existingUser[0]) {
      throw new BadRequestException('username already exists')
    }

    if (existingUser[1]) {
      throw new BadRequestException('email already exists')
    }
    const hashPassword = await this.bcryptService.hash(createUserDto.password)

    const usuario = this.usersService.toEntity(createUserDto)
    usuario.password = hashPassword
    const user = await this.usersRepository.save(usuario)
    const roles = createUserDto.rols || [Role.USER]
    const userRoles = roles.map((role) => ({ user: user, role: Role[role] }))
    const savedUserRoles = await this.userRoleRepository.save(userRoles)

    return this.usersService.toResponseDtoWithRoles(user, savedUserRoles)
  }

  validateRoles(roles: string[]): boolean {
    return roles.every((role) => Role[role])
  }

  async findByUsername(username: string) {
    this.logger.log(`findByUsername: ${username}`)
    return await this.usersRepository.findOneBy({ username })
  }

  async validatePassword(password: string, hashPassword: string) {
    this.logger.log(`validatePassword`)
    return await this.bcryptService.isMatch(password, hashPassword)
  }

  async deleteById(idUser: number) {
    this.logger.log(`deleteUserById: ${idUser}`)
    const user = await this.usersRepository.findOneBy({ id: idUser })
    if (!user) {
      throw new NotFoundException(`User not found with id ${idUser}`)
    }
    const existsPedidos = await this.ordersService.userExists(user.id)
    if (existsPedidos) {
      user.updatedAt = new Date()
      user.isDeleted = true
      return await this.usersRepository.save(user)
    } else {
      for (const userRole of user.rols) {
        await this.userRoleRepository.remove(userRole)
      }
      return await this.usersRepository.delete({ id: user.id })
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    updateRoles: boolean = false,
  ) {
    this.logger.log(
      `updateUserProfileById: ${id} with ${JSON.stringify(updateUserDto)}`,
    )
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User not found with id ${id}`)
    }

    await this.validateUser(updateUserDto, id)

    const rolesBackup = [...user.rols]
    Object.assign(user, updateUserDto)

    const personalAssigned = await this.personalService.findByUserId(id)
    if (!personalAssigned) {
      throw new BadRequestException('User does not have a personal assigned')
    }

    if (updateRoles) {
      for (const userRole of rolesBackup) {
        await this.userRoleRepository.remove(userRole)
      }
      const roles = updateUserDto.rols || [Role.USER]
      if (roles.includes('SELLER' || 'seller')) {
        this.validateSeller(personalAssigned)
      }
      const userRoles = roles.map((role) => ({
        user: user,
        role: Role[role.toUpperCase()],
      }))
      user.rols = await this.userRoleRepository.save(userRoles)
    } else {
      user.rols = rolesBackup
    }

    const updatedUser = await this.usersRepository.save(user)

    return this.usersService.toResponseDto(updatedUser)
  }

  async getOrders(id: number) {
    return await this.ordersService.getOrderByUser(id)
  }

  async getOrder(idUser: number, idOrder: string) {
    const order = await this.ordersService.findOne(idOrder)
    console.log(order.idUser)
    console.log(idUser)
    if (order.idUser != idUser) {
      throw new ForbiddenException(
        'Do not have permission to access this resource',
      )
    }
    return order
  }

  async createPedido(createOrderDto: CreateOrderDto, userId: number) {
    this.logger.log(`Creando pedido ${JSON.stringify(createOrderDto)}`)
    if (createOrderDto.idUser != userId) {
      throw new BadRequestException(
        'Producto idUsuario must be the same as the authenticated user',
      )
    }
    return await this.ordersService.create(createOrderDto)
  }

  async updatePedido(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId: number,
  ) {
    this.logger.log(
      `Actualizando pedido con id ${id} y ${JSON.stringify(updateOrderDto)}`,
    )
    if (updateOrderDto.idUser != userId) {
      throw new BadRequestException(
        'Producto idUsuario must be the same as the authenticated user',
      )
    }
    const order = await this.ordersService.findOne(id)
    if (order.idUser != userId) {
      throw new ForbiddenException(
        'Do not have permission to access this resource',
      )
    }
    return await this.ordersService.update(id, updateOrderDto)
  }

  async removePedido(idOrder: string, userId: number) {
    this.logger.log(`removePedido: ${idOrder}`)
    const pedido = await this.ordersService.findOne(idOrder)
    if (pedido.idUser != userId) {
      throw new ForbiddenException(
        'Do not have permission to access this resource',
      )
    }
    return await this.ordersService.remove(idOrder)
  }

  private async findByEmail(email: string) {
    this.logger.log(`findByEmail: ${email}`)
    return await this.usersRepository.findOneBy({ email })
  }

  private validateSeller(personal: PersonalEntity) {
    if (!personal.section.nameCategory.includes('CASHIER' || 'cashier')) {
      throw new BadRequestException('Personal must be a Cashier')
    }
  }

  private async validateUser(updateUserDto: UpdateUserDto, id: number) {
    if (updateUserDto.username) {
      const existingUser = await this.findByUsername(updateUserDto.username)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('username already exists')
      }
    }
    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('email already exists')
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await this.bcryptService.hash(
        updateUserDto.password,
      )
    }
  }
}
