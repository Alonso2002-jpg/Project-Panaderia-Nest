import { Module } from '@nestjs/common'
import { UsersService } from './user.service'
import { UsersMapper } from './mapper/users.mapper'
import { BcryptService } from '../utils/bcrypt/bcrypt.services'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UserRole } from './entities/user.roles.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { OrdersModule } from '../orders/orders.module'
import { UsersController } from './user.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserRole]),
    CacheModule.register(),
    OrdersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersMapper, BcryptService],
})
export class UserModule {}
