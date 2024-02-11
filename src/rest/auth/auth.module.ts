import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtAuthStrategy } from './strategies/jwt-strategy'
import { AuthMapper } from './mapper/auth.mapper'
import { UserModule } from '../user/user.module'
import { UsersService } from '../user/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../user/entities/user.entity'
import { UserRole } from '../user/entities/user.roles.entity'
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'
import { Order } from '../orders/schemas/order.schema'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { OrdersService } from '../orders/orders.service'
import { UsersMapper } from '../user/mapper/users.mapper'
import { BcryptService } from '../utils/bcrypt/bcrypt.services'
import { Product } from '../product/entities/product.entity'
import { OrderMapper } from '../orders/mappers/orders.mapper'
import { PersonalService } from '../personal/personal.service'
import { PersonalEntity } from '../personal/entities/personal.entity'
import { Category } from '../category/entities/category.entity'
import { MapperPersonal } from '../personal/mapper/mapperPersonal'
import { CacheModule } from '@nestjs/cache-manager'

import * as process from 'process'
@Module({
  imports: [
    JwtModule.register({
      secret: Buffer.from(
        process.env.JWT_SECRET ||
          'La_Mejor_Panaderia_Del_Mundo_XD',
        'utf-8',
      ).toString('base64'),
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRATION_TIME) || 3600,
        algorithm: 'HS512',
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    MongooseModule.forFeatureAsync([
      {
        name: Order.name,
        useFactory: () => {
          const schema = SchemaFactory.createForClass(Order)
          schema.plugin(mongoosePaginate)
          return schema
        },
      },
    ]),
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Product,
      PersonalEntity,
      Category,
    ]),
    CacheModule.register(),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthMapper,
    JwtAuthStrategy,
    UsersService,
    OrdersService,
    OrderMapper,
    UsersMapper,
    BcryptService,
    PersonalService,
    MapperPersonal,
  ],
})
export class AuthModule {}
